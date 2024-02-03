import express from "express";
import pool from "../utils/dbConfig.js";
import bcript from "bcrypt";

import { checkNotAuthenticated, isAdminRole } from "../utils/auth.js";

const router = express.Router();
// /users/register
router.get(
  "/",
  checkNotAuthenticated,
  isAdminRole,
  (req, res) => {
    res.render("register.ejs");
  }
);
// /users/register
router.post(
  "/",
  checkNotAuthenticated,
  isAdminRole,
  async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    console.log(role);

    let errors = [];

    if (!username || !password) {
      errors.push({ message: "Enter all fields!" });
    }

    if (password.length < 6) {
      errors.push({ message: "Password should be at least 6 characters!" });
    }

    if (errors.length > 0) {
      console.log(errors);
      res.render("register.ejs", { errors: errors });
    } else {
      // form validation has passed
      let hashedPassword = await bcript.hash(password, 10);
      pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username],
        (err, result) => {
          if (err) throw err;
          console.log(result.rows);
          if (result.rows.length > 0) {
            errors.push({ message: "Username already exist!" });
            res.render("register.ejs", { errors: errors });
          } else {
            pool.query(
              "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, password",
              [username, hashedPassword, role],
              (err, result) => {
                if (err) throw err;
                console.log(result.rows);
                req.flash("success_msg", "You registered. Please log in");
                res.redirect("/users/login");
              }
            );
          }
        }
      );
    }
  }
);

export default router;
