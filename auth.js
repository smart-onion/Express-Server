import bcript from "bcrypt";
import pool from "./utils/dbConfig.js";
import rateLimit from "express-rate-limit";

const setRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const setLoginAttempts = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.send("success");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send("fooo");
}

function isAdminRole(req, res, next) {
  if (req.user.role === "ADMIN") {
    return next();
  }
  res.send("NOT_PERMITED");
}

async function changePassword(username, currPassord, newPassword) {
  let done;
  let updatePassword = new Promise((resolve, error) => {
    pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username],
      (err, result) => {
        console.log("inside");
        if (err) console.log("text", err);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          bcript.compare(currPassord, user.password, async (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              let hashPassword = await bcript.hash(newPassword, 10);
              console.log(hashPassword);
              pool.query("UPDATE users SET password = $1 WHERE username=$2", [
                hashPassword,
                username,
              ]);
              resolve(true);
            } else {
              error(false);
            }
          });
        } else {
          error(false);
        }
      }
    );
  });
  await updatePassword
    .then((result) => {
      done = result;
    })
    .catch((error) => {
      done = error;
    });
  return done;
}

export {
  checkAuthenticated,
  checkNotAuthenticated,
  isAdminRole,
  changePassword,
  setRateLimit,
  setLoginAttempts,
};
