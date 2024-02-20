import express from "express";
import passport from "passport";
const router = express.Router();
import logger from "../utils/logger.js";
import { checkAuthenticated, setLoginAttempts } from "../utils/auth.js";

// Render login page  /users/login
router.get("/", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

function sendCookie(req, res, next) {
  res.cookie(req.user?.role);
  next();
}

// Authenticate user   /users/login
router.post(
  "/",
  setLoginAttempts,
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
    failureMessage: true,
  })

);

export default router;
