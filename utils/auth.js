// Import necessary modules
import bcrypt from "bcrypt"; // For password hashing
import pool from "./dbConfig.js"; // Database connection pool
import rateLimit from "express-rate-limit"; // For rate limiting in Express

// Rate limiting configuration for general requests
const setRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7", // Use standard headers
  legacyHeaders: false, // Do not use legacy headers
});

// Rate limiting configuration for login attempts
const setLoginAttempts = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 login attempts per windowMs
  standardHeaders: "draft-7", // Use standard headers
  legacyHeaders: false, // Do not use legacy headers
});

// Middleware function to check if user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // If user is authenticated, redirect to dashboard
    return res.redirect("/users/dashboard");
  }
  next();
}

// Middleware function to check if user is not authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // If user is authenticated, proceed to next middleware
    return next();
  }
  // If user is not authenticated, redirect to login page
  return res.redirect("/users/login");
}

// Middleware function to check if user has admin role
function isAdminRole(req, res, next) {
  if (req.user?.role === "ADMIN") {
    // If user has admin role, set role in session and proceed to next middleware
    req.session.role = true;
    return next();
  }
  // If user does not have admin role, redirect to login page
  res.redirect("/users/login");
}

// Function to change user password
async function changePassword(username, currPassword, newPassword) {
  let done;
  let updatePassword = new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username],
      (err, result) => {
        if (err) console.log("text", err);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          // Compare current password with hashed password stored in database
          bcrypt.compare(currPassword, user.password, async (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              // Hash the new password
              let hashPassword = await bcrypt.hash(newPassword, 10);
              // Update user password in the database
              pool.query("UPDATE users SET password = $1 WHERE username=$2", [
                hashPassword,
                username,
              ]);
              resolve(true); // Resolve promise with true if password is updated successfully
            } else {
              reject(false); // Reject promise with false if current password is incorrect
            }
          });
        } else {
          reject(false); // Reject promise with false if user is not found
        }
      }
    );
  });

  // Await the promise and handle result
  await updatePassword
    .then((result) => {
      done = result; // Set result to done
    })
    .catch((error) => {
      done = error; // Set error to done
    });
  return done; // Return the result
}

// Export all the middleware functions and utility functions
export {
  checkAuthenticated,
  checkNotAuthenticated,
  isAdminRole,
  changePassword,
  setRateLimit,
  setLoginAttempts,
};
