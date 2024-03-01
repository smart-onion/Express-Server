// Import necessary modules and functions
import express from "express";
import passport from "passport";
const router = express.Router();
import { checkAuthenticated, setLoginAttempts } from "../utils/auth.js";

// Render login page at /users/login endpoint
router.get("/", checkAuthenticated, (req, res) => {
  // Render the login page (login.ejs) if user is not authenticated
  res.render("login.ejs");
});

// Middleware function to send role as a cookie
function sendCookie(req, res, next) {
  // Set the role as a cookie in the response if user is authenticated
  res.cookie(req.user?.role);
  next();
}

// Authenticate user at /users/login endpoint
router.post(
  "/",
  setLoginAttempts, // Middleware to set login attempts
  passport.authenticate("local", {
    // Use local strategy for authentication
    successRedirect: "/users/dashboard", // Redirect to dashboard on successful authentication
    failureRedirect: "/users/login", // Redirect to login page on failed authentication
    failureFlash: true, // Enable flashing of error messages
    failureMessage: true, // Enable passing failure message to flash messages
  })
);

// Export the router module
export default router;
