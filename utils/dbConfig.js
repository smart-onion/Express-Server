// Import the dotenv library for loading environment variables
import dotenv from "dotenv";
// Load environment variables from .env file into process.env
dotenv.config();

// Import the pg module for interacting with PostgreSQL database
import pg from "pg";

// Create a new PostgreSQL client instance with connection parameters from environment variables
const pool = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Set the number of retries for connecting to the database
let retries = 5;
// Retry connecting to the database until successful or retries exhausted
while (retries) {
  try {
    // Attempt to connect to the database
    pool.connect((err) => {
      // If an error occurs during connection, throw the error
      if (err) throw err;
      // If connection is successful, log a success message
      console.log("DB Connected");
    });
    // Exit the retry loop if connection is successful
    break;
  } catch (err) {
    // If an error occurs during connection attempt, decrement the number of retries
    retries--;
    // Log the error
    console.log(err);
    // Wait for 5 seconds before retrying connection
    await new Promise((res) => setTimeout(res, 5000));
  }
}

// Export the PostgreSQL client instance
export default pool;
