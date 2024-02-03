import express from "express";
import axios from "../utils/axios.js";
import { checkNotAuthenticated } from "../utils/auth.js";

const router = express.Router();
// /users/guest-password
router.get("/", checkNotAuthenticated, async (req, res) => {
  console.log(req.session?.message);
  const passLogs = await axios.get("/pass-logs");
  res.render("guestPassword.ejs", {
    user: req.user.username,
    passLogs: passLogs.data,
    role: req.user.role || null,
    message: req.session?.message,
  });
});

router.post("/", checkNotAuthenticated, async (req, res) => {
  const result = await axios.post("/change-password", {
    username: req.body.username,
    sessionID: req.hostname,
    user: req.user.username,
    password: req.user.password,
    hostname: req.hostname,
  });
  if (result.data === "NOT_FOUND") {
    req.session.message = `FAILED! User ${req.body.username} not found in the current voyage`;
    res.redirect("/users/guest-password");
  } else if (result.data === "PASSWORD_CHANGED") {
    req.session.message = `Password for user ${req.body.username} has been changed!`;
    res.redirect("/users/guest-password");
  }
});

export default router;
