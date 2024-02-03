import express from "express";
import { checkNotAuthenticated } from "../utils/auth.js";
import axios from "../utils/axios.js";

const router = express.Router();
const Log = [];
let doneProcess;

router.get("/", checkNotAuthenticated, async (req, res) => {
  // axios.post("/", { sessionID: req.hostname });
  const passLogs = await axios.get("/pass-logs");
  
  console.log(req.session)
  res.render("dashboardNew.ejs", {
    user: req.user.username,
    passLogs: passLogs.data,
    result: Log || null,
    role: req.user.role
  });
  Log.pop();
  doneProcess = null;
});

export default router;
