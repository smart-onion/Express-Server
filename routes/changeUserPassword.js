// Import the necessary modules and functions
import express from "express";
import {
  isAdminRole,
  checkNotAuthenticated,
  changePassword,
} from "../utils/auth.js";

// Create a router instance
const router = express.Router();

// Handle GET request to "/users/changepassword" endpoint
router.get("/", isAdminRole, checkNotAuthenticated, (req, res) => {
  // Render the change password form view
  res.render("changePass.ejs", { username: req.user.username });
});

// Handle POST request to "/users/changepassword" endpoint
router.post(
  "/",
  isAdminRole,
  checkNotAuthenticated,
  async (req, res) => {
    // Extract data from request body
    const username = req.user.username;
    const currPassword = req.body.currPassword;
    const newPassword = req.body.newPassword;
    const confPassword = req.body.confPassword;

    // Check if new password matches confirmed password
    if (newPassword === confPassword) {
      // Call the changePassword function to attempt password change
      const result = await changePassword(username, currPassword, newPassword);

      // Log the result of the password change attempt
      console.log("result = ", result);

      // Redirect to dashboard if password change successful, else render changePass view with error message
      if (result) {
        res.redirect("/users/dashboard");
      } else {
        res.render("changePass.ejs", { message: "Incorrect password!" });
      }
    } else {
      // Render changePass view with error message if passwords do not match
      res.render("changePass.ejs", { message: "Confirm password!" });
    }
  }
);

// Export the router module
export default router;
