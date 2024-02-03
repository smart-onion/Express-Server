import express from "express";

const router = express.Router();

// /users/logout
router.get("/", (req, res, next) => {
  req.logout((err) => {
    if (err) throw err;
    res.clearCookie();
    res.redirect("/users/login");
  });
});

export default router;
