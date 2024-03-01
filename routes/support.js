// Import necessary modules and functions
import express from "express";
import { checkNotAuthenticated } from "../utils/auth.js";
import axios from "../utils/axios.js";
import pool from "../utils/dbConfig.js";

// Create a router instance
const router = express.Router();

// Handle GET request to "/users/support" endpoint
router.get("/", checkNotAuthenticated, async (req, res) => {
  // Retrieve any support message stored in session
  var message = req.session?.support;
  req.session.support = null; // Clear the support message from session

  // Query the database to fetch recent support messages for the current user
  const result = await pool.query(
    `SELECT username, time, message FROM support_messages WHERE username='${req.user.username}' ORDER BY time DESC LIMIT 10`
  );

  // Render the support page with user information, role, support message, and support message data
  res.render("support.ejs", {
    user: req.user.username,
    role: req.user?.role,
    message: message,
    data: result.rows,
  });
});

// Handle POST request to "/users/support" endpoint
router.post("/", checkNotAuthenticated, async (req, res) => {
  // Insert the new support message into the database
  pool.query(
    "INSERT INTO support_messages (username, message) VALUES ($1, $2)",
    [req.user?.username, req.body?.message],
    async (err) => {
      if (err) {
        // If an error occurs during database insertion, set an error message in session and redirect back to the support page
        req.session.support = "Something went wrong!";
        res.redirect("/users/support");
      } else {
        // If insertion is successful, notify the support team via an external API call
        const result = await axios.post("/call-support", {
          hostname: req.hostname,
          username: req.user?.username,
          message: req.body?.message || null,
        });
        // Check if the API call was successful
        if (result.data === 200) {
          // If successful, set a success message in session and redirect back to the support page
          req.session.support = "You called for support!";
          res.redirect("/users/support");
        } else {
          // If API call fails, set an error message in session and redirect back to the support page
          req.session.support = "Something went wrong!";
          res.redirect("/users/support");
        }
      }
    }
  );
});

// Export the router module
export default router;
