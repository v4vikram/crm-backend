import pino from "pino";
import { pinoHttp } from "pino-http";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

export const httpLogger = pinoHttp({
  logger,
  redact: ["req.headers.authorization", "req.headers.cookie"],

  autoLogging: {
    ignore: (req) => req.url === "/favicon.ico",
  },
});