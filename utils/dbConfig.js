import dotenv from "dotenv";

dotenv.config();

import pg from "pg";

const pool = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
let retries = 5;
while (retries) {
  try {
    pool.connect((err) => {
      if (err) throw err;
      console.log("DB Connected");
    });
    break;
  } catch (err) {
    retries--;
    console.log(err);
    await new Promise((res) => setTimeout(res, 5000));
  }
}

export default pool;
