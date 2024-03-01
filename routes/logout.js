import express from "express";

// Create a router instance
const router = express.Router();

// Define a route handler for the GET request to "/users/logout"
router.get("/", (req, res, next) => {
  // Call the logout function provided by the authentication middleware
  req.logout((err) => {
    // If an error occurs during logout, throw it
    if (err) throw err;

    // Clear any cookies associated with the request
    res.clearCookie();

    // Redirect the user to the login page after logout
    res.redirect("/users/login");
  });
});

// Export the router module
export default router;