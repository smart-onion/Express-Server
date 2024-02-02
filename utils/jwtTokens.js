import jwt from "jsonwebtoken";

function jwtTokens({ user_id, user_name }) {
  const user = { user_id, user_name };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" }); // replace secret and expire time
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "5m" }); // replace secret and expire time
  return { accessToken, refreshToken };
}

export default jwtTokens;