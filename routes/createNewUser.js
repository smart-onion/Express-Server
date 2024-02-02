import express from "express";
import pool from "../utils/dbConfig.js";
import authenticateToken from "../middleware/authorization.js";

const router = express.Router();

// create new user
router.post("/", authenticateToken, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  if (!username || !password) {
    res.json({ error: "Enter all fields!" });
  }

  if (password.length < 6) {
    res.json({ error: "Password should be at least 6 characters!" });
  }
  // form validation has passed
  let hashedPassword = await bcript.hash(password, 10);
  pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username],
    (err, result) => {
      if (err) throw err;
      if (result.rows.length > 0) {
        res.json({ error: "Username already exist!" });
      } else {
        pool.query(
          "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, password",
          [username, hashedPassword, role],
          (err, result) => {
            if (err) throw err;
            res.json({ message: "success" });
          }
        );
      }
    }
  );
});

// delete user coming soon...

export default router;
