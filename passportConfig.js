import localStrategy from "passport-local";
import pool from "./utils/dbConfig.js";
import bcript from "bcrypt";
import dotenv from "dotenv";
import jwtStrategy from "passport-jwt";
import passport from "passport";

dotenv.config();
function initialize(passport) {
  const authenticateUser = (username, password, done) => {
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
              return done(null, user);
            } else {
              return done(null, false, { message: "Password is not correct!" });
            }
          });
        } else {
          return done(null, false, { message: "User not exist!" });
        }
      }
    );
  };
  passport.use(
    new localStrategy.Strategy(
      { usernameField: "username", password: " password" },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    pool.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
      if (err) throw err;
      return done(null, result.rows[0]);
    });
  });
}

const jwtOptions = {
  jwtFromRequest: jwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env, // Replace with your actual secret key
};
passport.use(new jwtStrategy.Strategy(jwtOptions, (payload, done) => {
  
}))
export default initialize;
