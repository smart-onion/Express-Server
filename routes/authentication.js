import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/dbConfig.js";
import jwtTokens from "../utils/jwtTokens.js";
import authenticateToken from "../middleware/authorization.js";
import { setLoginAttempts } from "../auth.js";
import bcript from "bcrypt";
const router = express.Router();

// Login, send tokens
router.post("/", setLoginAttempts, async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    (err, result) => {
      if (err) throw err;

      if (result.rows.length > 0) {
        const user = result.rows[0];
        bcript.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role,
            };
            console.log(req.session);
            let tokens = jwtTokens(user);
            res.cookie("refresh_token", tokens.refreshToken, {
              httpOnly: true,
            });
            res.json({ tokens, role: user.role });
          } else {
            return res.status(403).json({ error: "Password is not correct!" });
          }
        });
      } else {
        return res.status(401).json({ error: "User not exist!" });
      }
    }
  );
});

// refresh token
router.get("/", authenticateToken, (req, res) => {
  console.log(req.cookies);
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh TOKEN" });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) return res.status(403).json({ error: error.message });
        let token = jwtTokens(user);
        res.cookie("refresh_token", token.refreshToken, { httpOnly: true });
        res.json(token);
      }
    );
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

//delete token, LOGOUT
router.delete("/", authenticateToken, (req, res) => {
  try {
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "refresh token deleted!" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
