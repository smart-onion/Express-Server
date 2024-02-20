import { createLogger, format, transports } from "winston";

var infoFilename = new Date().toLocaleDateString() + "_info";
var warnFilename = new Date().toLocaleDateString() + "_warn";
var errorFilename = new Date().toLocaleDateString() + "_error";

const logger = createLogger({
  transports: [
    // new transports.Console(),
    new transports.File({
      level: "info",
      filename: `logs/${infoFilename}.log`,
    }),
    new transports.File({
      level: "error",
      filename: `logs/${errorFilename}.log`,
    }),
    new transports.File({
      level: "warn",
      filename: `logs/${warnFilename}.log`,
    }),
  ],
  format: format.combine(format.timestamp(), format.json(), format.metadata()),
});

export default logger;
