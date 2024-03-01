// Import necessary modules and functions
import express from "express";
import axios from "../utils/axios.js";
import { checkNotAuthenticated } from "../utils/auth.js";

// Create a router instance
const router = express.Router();

// Handle GET request to "/users/guest-password" endpoint
router.get("/", checkNotAuthenticated, async (req, res) => {
  // Retrieve any message stored in session
  var message = req.session?.message;
  req.session.message = ""; // Clear the message from session

  // Fetch password change logs from external API
  const passLogs = await axios.get("/pass-logs");

  // Render the guest password management page with user information, password change logs, role, and any message
  res.render("guestPassword.ejs", {
    user: req.user.username,
    passLogs: passLogs.data,
    role: req.user.role || null,
    message: message,
  });
});

// Handle POST request to "/users/guest-password" endpoint
router.post("/", checkNotAuthenticated, async (req, res) => {
  // Make a POST request to change the password
  const result = await axios.post("/change-password", {
    username: req.body.username,
    sessionID: req.hostname,
    user: req.user.username,
    password: req.user.password,
    hostname: req.hostname,
  });

  // Handle different results from the password change attempt
  if (result.data === "NOT_FOUND") {
    // If user not found, set a message in session and redirect back to the guest password management page
    req.session.message = `FAILED! User ${req.body.username} not found in the current voyage`;
    res.redirect("/users/guest-password");
  } else if (result.data === "PASSWORD_CHANGED") {
    // If password changed successfully, set a message in session and redirect back to the guest password management page
    req.session.message = `Password for user ${req.body.username} has been changed!`;
    res.redirect("/users/guest-password");
  }
});

// Export the router module
export default router;
