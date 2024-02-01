import express from "express";
import bodyParser from "body-parser";
import pool from "./dbConfig.js";
import bcript from "bcrypt";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import initialize from "./passportConfig.js";
import axios from "axios";
import {
  checkAuthenticated,
  checkNotAuthenticated,
  isAdminRole,
  changePassword,
  setLoginAttempts,
  setRateLimit,
} from "./auth.js";

const PORT = process.env.PORT || 4000;
const server = express();
const Log = [];
let doneProcess;

initialize(passport);

server.use(bodyParser.urlencoded({ extended: true }));
server.use(flash());
server.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.initialize());
server.use(passport.session());
server.use(express.static("public"));
server.use(setRateLimit);
// Home Page
server.get("/", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { port: PORT });
});

// Render login page
server.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

// Register page
server.get(
  "/users/register",
  checkNotAuthenticated,
  isAdminRole,
  (req, res) => {
    res.render("register.ejs");
  }
);

server.get("/users/dashboard", checkNotAuthenticated, async (req, res) => {
  axios.post("http://localhost:5000", { sessionID: req.hostname });
  const passLogs = await axios.get("http://localhost:5000/pass-logs");
  res.render("dashboard.ejs", {
    user: req.user.username,
    passLogs: passLogs.data,
    result: Log || null,
    done: doneProcess || null,
    role: req.user.role || null,
  });
  Log.pop();
  doneProcess = null;
});

server.get("/users/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) throw err;
    res.redirect("/users/login");
  });
});

server.get("/users/changepassword", checkNotAuthenticated, (req, res) => {
  res.render("changePass.ejs", { username: req.user.username });
});

// Get credential
server.post(
  "/users/register",
  checkNotAuthenticated,
  isAdminRole,
  async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    console.log(role);

    let errors = [];

    if (!username || !password) {
      errors.push({ message: "Enter all fields!" });
    }

    if (password.length < 6) {
      errors.push({ message: "Password should be at least 6 characters!" });
    }

    if (errors.length > 0) {
      console.log(errors);
      res.render("register.ejs", { errors: errors });
    } else {
      // form validation has passed
      let hashedPassword = await bcript.hash(password, 10);
      pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username],
        (err, result) => {
          if (err) throw err;
          console.log(result.rows);
          if (result.rows.length > 0) {
            errors.push({ message: "Username already exist!" });
            res.render("register.ejs", { errors: errors });
          } else {
            pool.query(
              "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, password",
              [username, hashedPassword, role],
              (err, result) => {
                if (err) throw err;
                console.log(result.rows);
                req.flash("success_msg", "You registered. Please log in");
                res.redirect("/users/login");
              }
            );
          }
        }
      );
    }
  }
);

server.post(
  "/users/login",
  setLoginAttempts,
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
    failureMessage: true,
  })
);

server.post("/change-password", checkNotAuthenticated, async (req, res) => {
  const result = await axios.post("http://localhost:5000/change-password", {
    username: req.body.username,
    sessionID: req.hostname,
    user: req.user.username,
    password: req.user.password,
    hostname: req.hostname,
  });
  doneProcess = "done";
  if (result.data === "NOT_FOUND") {
    Log.push(`User ${req.body.username} not found in the current voyage`);
  } else if (result.data === "PASSWORD_CHANGED") {
    Log.push(`Password for user ${req.body.username} has been changed!`);
  }
  res.redirect("/users/dashboard");
});

server.post(
  "/users/changepassword",
  checkNotAuthenticated,
  async (req, res) => {
    const username = req.user.username;
    const currPassword = req.body.currPassword;
    const newPassword = req.body.newPassword;
    const confPassword = req.body.confPassword;
    if (newPassword === confPassword) {
      const result = await changePassword(username, currPassword, newPassword);
      console.log("result = ", result);
      if (result) {
        res.redirect("/users/dashboard");
      } else {
        res.render("changePass.ejs", { message: "Incorrect password!" });
      }
    } else {
      res.render("changePass.ejs", { message: "Confirm password!" });
    }
  }
);

server.get("/delete", async (req, res) => {
  const result = await axios.post("http://localhost:5000/delete-driver", {
    hostname: req.hostname,
  });
  console.log(result);
});
server.get("/test", (req,res)=>{
  console.log(req)
  res.send(true)
})
// Server listening
server.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
