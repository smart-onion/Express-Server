// Import necessary modules and functions
import express from "express";
import { checkNotAuthenticated } from "../utils/auth.js";
import axios from "../utils/axios.js";

// Create a router instance
const router = express.Router();

// Array to store logs
const Log = [];

// Variable to track if the process is done
let doneProcess;

// Handle GET request to "/dashboard" endpoint
router.get("/", checkNotAuthenticated, async (req, res) => {
  try {
    // Notify external API about the dashboard access
    axios.post("/", { hostname: req.hostname }).catch((error) => {
      if (error) throw error;
    });

    // Retrieve password change logs from external API
    const passLogs = await axios.get("/pass-logs").catch((error) => {
      if (error) throw error;
    });

    // Render the dashboard view with user information, password change logs, and any previous result
    res.render("dashboardNew.ejs", {
      user: req.user.username,
      passLogs: passLogs.data,
      result: Log || null,
      role: req.user.role,
    });

    // Remove the previous result from the log
    Log.pop();
    
    // Reset the doneProcess variable
    doneProcess = null;
  } catch (error) {
    // If an error occurs, render the dashboard view with user information, role, and error message
    res.render("dashboardNew.ejs", {
      user: req.user.username,
      role: req.user.role,
      message: error,
    });
  }
});

// Export the router module
export default router;
