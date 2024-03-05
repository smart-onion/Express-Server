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
  var result;
  console.log(req.body.action);
  switch (req.body.action) {
    case "PASSWORD":
      result = await axios.post("/change-password", {
        username: req.body.username,
        sessionID: req.hostname,
        user: req.user.username,
        password: req.user.password,
        hostname: req.hostname,
        action: req.body?.action,
      });
      break;
    case "1154":
      result = await axios.post("/error-1154", {
        username: req.body.username,
        sessionID: req.hostname,
        user: req.user.username,
        password: req.user.password,
        hostname: req.hostname,
        action: req.body?.action,
      });
      break;
    case "DETAIL":
      result = await axios.post("/get-details", {
        username: req.body.username,
        sessionID: req.hostname,
        user: req.user.username,
        password: req.user.password,
        hostname: req.hostname,
        action: req.body?.action,
      });
      break;
  }
  console.log(result.data);
  // Handle different results from the password change attempt
  if (result.data === "NOT_FOUND") {
    // If user not found, set a message in session and redirect back to the guest password management page
    req.session.message = `FAILED! User ${req.body.username} not found in the current voyage`;
    res.redirect("/users/guest-password");
  } else if (result.data === "PASSWORD_CHANGED") {
    // If password changed successfully, set a message in session and redirect back to the guest password management page
    req.session.message = `Password for user ${req.body.username} has been changed to '1111'!`;
    res.redirect("/users/guest-password");
  } else if (result.data === "FIXED") {
    req.session.message = `Error fixed for user ${req.body.username}!`;
    res.redirect("/users/guest-password");
  } else if (result.data === "DETAIL") {
    // req.session.message = `Get detail for user ${req.body.username}!`;
    res.sendFile(`${process.env.DETAILS_PATH}[${req.hostname}]Details.html`, {
      headers: {
        "Content-Disposition": "attachment", // Force browser to download
      },
    });
    // res.redirect("/users/guest-password");
  } else if (result.data === "NO_DETAIL") {
    req.session.message = `${req.body.username} did not buy WiFi!`;
    res.redirect("/users/guest-password");
  }
});

// Export the router module
export default router;
