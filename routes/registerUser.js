// Import necessary modules and functions
import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/dbConfig.js"; // Importing database connection pool
import { checkNotAuthenticated, isAdminRole } from "../utils/auth.js"; // Importing authentication middleware
import dotenv from "dotenv";
// Load environment variables from .env file into process.env
dotenv.config();
// Create a router instance
const router = express.Router();

// Handle GET request to "/users/register" endpoint
router.get("/", checkNotAuthenticated, isAdminRole, async (req, res) => {
  // Retrieve all users from the database
  const result = await pool.query("SELECT id, username, role FROM users");

  // Check if there are users in the result
  if (result.rows.length > 0) {
    // Render the register page with user data and roles
    res.render("register.ejs", {
      user: req.user?.username,
      role: req.user.role,
      error: req.session?.message,
      users: result.rows,
    });
  } else {
    // Render the register page with error if database error occurs
    res.render("register.ejs", {
      role: req.user.role,
      error: "DataBase Error!",
    });
  }
});

// Handle POST request to "/users/register" endpoint
router.post("/", checkNotAuthenticated, isAdminRole, async (req, res) => {
  // Extract data from request body
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  let errors = [];

  // Validation: Check if username and password are provided
  if (!username || !password) {
    req.session.message = "Enter all fields!";
    errors.push({ message: 1 });
  }

  // Validation: Check if password length is at least 6 characters
  if (password.length < 6) {
    req.session.message = "Password should be at least 6 characters!";
    errors.push({ message: 1 });
  }

  // If there are validation errors, redirect back to the registration page
  if (errors.length > 0) {
    res.redirect("/users/register");
  } else {
    // Hash the password
    let hashedPassword = await bcrypt.hash(password, 10);

    // Check if the username already exists in the database
    pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username],
      (err, result) => {
        if (err) throw err;

        // If username exists, show error and redirect back to registration page
        if (result.rows.length > 0) {
          errors.push({ message: 1 });
          req.session.message = "Username already exists!";
          res.redirect("/users/register");
        } else {
          // Insert new user into the database
          pool.query(
            "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, password",
            [username, hashedPassword, role],
            (err, result) => {
              if (err) throw err;
              console.log("warning", result.rows);
              req.flash("success_msg", "You registered. Please log in");
              res.redirect("/users/register");
            }
          );
        }
      }
    );
  }
});

router.delete("/", checkNotAuthenticated, (req, res) => {
  console.log(req.body.username.trim());
  pool.query(`DELETE FROM users WHERE username='${req.body.username.trim()}'`);
});

// Export the router module
export default router;
