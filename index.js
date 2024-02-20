// import dependencies
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import initialize from "./utils/passportConfig.js";
import axios from "./utils/axios.js";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import expressWinston from "express-winston";
import { checkNotAuthenticated, setRateLimit } from "./utils/auth.js";

// import routes
import loginRoute from "./routes/login.js";
import registerUser from "./routes/registerUser.js";
import dashboard from "./routes/dashboard.js";
import guestPassword from "./routes/guestPassword.js";
import logout from "./routes/logout.js";
import changeUserPassword from "./routes/changeUserPassword.js";

const PORT = process.env.PORT || 4000;
const server = express();

initialize(passport);
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(flash());
server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.initialize());
server.use(passport.session());
server.use(express.static("public"));
// server.use("/css", express.static("node_modules/boxicons/"));
server.use("/css", express.static("node_modules/bootstrap/dist/css"));
server.use("/js", express.static("node_modules/bootstrap/dist/js"));
server.use("/js", express.static("node_modules/jquery/dist"));

server.use(setRateLimit);

server.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  })
);

// Home Page
server.get("/", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { port: PORT });
});

// Render login page or authenticate user
server.use("/users/login", loginRoute);

// Render Register page or register new user
server.use("/users/register", registerUser);
// render dashboard
server.use("/users/dashboard", dashboard);
// Change guest password
server.use("/users/guest-password", guestPassword);
// Logout user
server.use("/users/logout", logout);
// Change user password
server.use("/users/changepassword", changeUserPassword);

server.get("/delete", async (req, res) => {
  const result = await axios.post("http://localhost:5000/delete-driver", {
    hostname: req.hostname,
  });
  console.log(result);
});

// Server listening
server.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
