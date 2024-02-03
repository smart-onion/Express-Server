import express from "express";
import {
  isAdminRole,
  checkNotAuthenticated,
  changePassword,
} from "../utils/auth.js";

const router = express.Router();

// /users/changepassword
router.get("/", isAdminRole, checkNotAuthenticated, (req, res) => {
  res.render("changePass.ejs", { username: req.user.username });
});

router.post(
  "/",
  isAdminRole,
  checkNotAuthenticated,

  async (req, res) => {
    const username = req.user.username;
    const currPassword = req.body.currPassword;
    const newPassword = req.body.newPassword;
    const confPassword = req.body.confPassword;
    if (newPassword === confPassword) {
      const result = await changePassword(username, currPassword, newPassword);
      console.log("result = ", result);
      if (result) {
        res.redirect("/users/dashboard");
      } else {
        res.render("changePass.ejs", { message: "Incorrect password!" });
      }
    } else {
      res.render("changePass.ejs", { message: "Confirm password!" });
    }
  }
);
export default router;
