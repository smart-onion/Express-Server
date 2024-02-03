import express from "express";
import passport from "passport";
const router = express.Router();
import { checkAuthenticated, setLoginAttempts } from "../utils/auth.js";

// Render login page
router.get("/", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

function sendCookie(req, res, next) {
  console.log(req.user);
  res.cookie(req.user?.role);
  next();
}

// Authenticate user
router.post(
  "/",
  setLoginAttempts,

  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
    failureMessage: true,
  })

  // Additional logic or redirection if needed
);

export default router;
