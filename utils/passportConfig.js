// Import necessary modules
import localStrategy from "passport-local"; // Passport strategy for authenticating with a username and password
import pool from "./dbConfig.js"; // Database connection pool
import bcrypt from "bcrypt"; // Library for hashing passwords

// Function to initialize Passport authentication
function initialize(passport) {
  // Function to authenticate user with username and password
  const authenticateUser = (username, password, done) => {
    // Query the database to find user with the given username
    pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
      (err, result) => {
        if (err) throw err;

        // If user exists
        if (result.rows.length > 0) {
          const user = result.rows[0];

          // Compare the provided password with the hashed password stored in the database
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            // If passwords match, authentication is successful
            if (isMatch) {
              return done(null, user); // Call done callback with user object
            } else {
              return done(null, false, { message: "Password is not correct!" }); // Call done callback with error message
            }
          });
        } else {
          return done(null, false, { message: "User not exist!" }); // Call done callback with error message
        }
      }
    );
  };

  // Configure Passport to use the local strategy for authentication
  passport.use(
    new localStrategy.Strategy(
      { usernameField: "username", passwordField: "password" }, // Specify fields for username and password in the request
      authenticateUser // Use the authenticateUser function for user authentication
    )
  );

  // Serialize user object to store in the session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user object from the session
  passport.deserializeUser((id, done) => {
    pool.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
      if (err) throw err;
      return done(null, result.rows[0]); // Call done callback with deserialized user object
    });
  });
}

// Export the initialize function for use in other parts of the application
export default initialize;
