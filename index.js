import express from "express";
import bodyParser from "body-parser";
import pool from "./utils/dbConfig.js";
import session from "express-session";
import initialize from "./passportConfig.js";
import axios from "axios";
import dotenv from "dotenv";
import authRoute from "./routes/authentication.js";
import createUserRoute from "./routes/createNewUser.js";
import cors from "cors";
dotenv.config();

import {
  checkAuthenticated,
  checkNotAuthenticated,
  isAdminRole,
  changePassword,
  setLoginAttempts,
  setRateLimit,
} from "./auth.js";

const corsOptions = {
  credentials: true,
  origin: "http://localhost:3000",
  optionSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
const PORT = process.env.PORT || 4000;
const server = express();
const Log = [];
let doneProcess;

// initialize(passport);
server.use(cors(corsOptions));
server.use(express.json());
// server.use(bodyParser.urlencoded({ extended: true }));
// server.use(flash());
server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// server.use(passport.initialize());
// server.use(passport.session());
server.use(express.static("public"));
server.use(setRateLimit);
// Home Page
// server.get("/", checkNotAuthenticated, (req, res) => {
//   res.render("login.ejs", { port: PORT });
// });

// Render login page
// server.get("/users/login", checkAuthenticated, (req, res) => {
//   res.render("login.ejs");
// });

// Register page
// server.get(
//   "/users/register",
//   checkNotAuthenticated,
//   isAdminRole,
//   (req, res) => {
//     res.render("register.ejs");
//   }
// );

// server.get("/users/dashboard", checkNotAuthenticated, async (req, res) => {
//   axios.post("http://localhost:5000", { sessionID: req.hostname });
//   const passLogs = await axios.get("http://localhost:5000/pass-logs");
//   res.render("dashboard.ejs", {
//     user: req.user.username,
//     passLogs: passLogs.data,
//     result: Log || null,
//     done: doneProcess || null,
//     role: req.user.role || null,
//   });
//   Log.pop();
//   doneProcess = null;
// });

// server.get("/users/logout", (req, res, next) => {
//   req.logout((err) => {
//     if (err) throw err;
//     res.redirect("/users/login");
//   });
// });

// server.get("/users/changepassword", checkNotAuthenticated, (req, res) => {
//   res.render("changePass.ejs", { username: req.user.username });
// });

// Create or delete user
server.use("/create-user", createUserRoute);
// Login user
server.use("/login", authRoute);

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

// Server listening
server.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
