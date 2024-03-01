// Import necessary dependencies
import express from "express"; // Express.js framework
import bodyParser from "body-parser"; // Middleware for parsing request bodies
import session from "express-session"; // Middleware for managing sessions
import flash from "express-flash"; // Middleware for displaying flash messages
import passport from "passport"; // Authentication middleware
import initialize from "./utils/passportConfig.js"; // Passport configuration
import axios from "./utils/axios.js"; // HTTP client for making requests
import cookieParser from "cookie-parser"; // Middleware for parsing cookies
import logger from "./utils/logger.js"; // Winston logger for logging
import expressWinston from "express-winston"; // Middleware for logging HTTP requests
import { checkNotAuthenticated, setRateLimit } from "./utils/auth.js"; // Custom authentication middleware

// Import routes
import loginRoute from "./routes/login.js"; // Route for handling login
import registerUser from "./routes/registerUser.js"; // Route for registering new users
import dashboard from "./routes/dashboard.js"; // Route for rendering the dashboard
import guestPassword from "./routes/guestPassword.js"; // Route for changing guest passwords
import logout from "./routes/logout.js"; // Route for logging out users
import changeUserPassword from "./routes/changeUserPassword.js"; // Route for changing user passwords
import support from "./routes/support.js"; // Route for handling user support

const PORT = process.env.PORT || 4000; // Port number for the server
const server = express(); // Create Express server

initialize(passport); // Initialize Passport authentication

// Middleware setup
server.use(cookieParser()); // Parse cookies
server.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
server.use(flash()); // Flash messages
server.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret used to sign the session ID cookie
    resave: false, // Save session data on each request
    saveUninitialized: false, // Do not save uninitialized sessions
  })
);
server.use(passport.initialize()); // Initialize Passport
server.use(passport.session()); // Use Passport for managing sessions
server.use(express.static("public")); // Serve static files from the 'public' directory
server.use("/css", express.static("node_modules/bootstrap/dist/css")); // Serve Bootstrap CSS
server.use("/js", express.static("node_modules/bootstrap/dist/js")); // Serve Bootstrap JavaScript
server.use("/js", express.static("node_modules/jquery/dist")); // Serve jQuery

server.use(setRateLimit); // Apply rate limiting to prevent abuse

// Logging middleware
server.use(
  expressWinston.logger({
    winstonInstance: logger, // Winston logger instance
    statusLevels: true, // Log levels based on HTTP status codes
  })
);

// Routes setup
server.get("/", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { port: PORT }); // Render login page
});

server.use("/users/login", loginRoute); // Route for handling login
server.use("/users/register", registerUser); // Route for registering new users
server.use("/users/dashboard", dashboard); // Route for rendering the dashboard
server.use("/users/guest-password", guestPassword); // Route for changing guest passwords
server.use("/users/logout", logout); // Route for logging out users
server.use("/users/changepassword", changeUserPassword); // Route for changing user passwords
server.use("/users/support", support); // Route for handling user support

// Route for deleting driver
server.get("/delete", async (req, res) => {
  const result = await axios.post("http://localhost:5000/delete-driver", {
    hostname: req.hostname,
  });
  console.log(result);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
