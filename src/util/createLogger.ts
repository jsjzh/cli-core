import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "node:path";

// 0 1 2 3 4 5 6
export type Level =
  | "error"
  | "warn"
  | "info"
  | "http"
  | "verbose"
  | "debug"
  | "silly";

export interface CreateLoggerConfig {
  appName: string;

  base?: string;
  datePattern?: string;
  logName?: string;
  maxSize?: string;
  maxFiles?: string;
  logLevel?: Level;
  outputLevel?: Level;
}

const createLogger = (config: CreateLoggerConfig) =>
  winston.createLogger({
    transports: [
      new DailyRotateFile({
        level: config.logLevel || "warn",
        dirname: path.join(
          config.base || process.env.HOME!,
          "logs",
          config.appName,
        ),
        datePattern: config.datePattern || "YYYY-MM-DD",
        filename: config.logName || "%DATE%.log",
        maxSize: config.maxSize || "20m",
        maxFiles: config.maxFiles || "14d",
        format: winston.format.combine(
          winston.format.label({ label: config.appName }),
          winston.format.uncolorize(),
          winston.format.splat(),
          winston.format.ms(),
          winston.format.timestamp(),
          winston.format.simple(),
        ),
      }),
      new winston.transports.Console({
        level: config.outputLevel || "info",
        format: winston.format.combine(
          winston.format.label({ label: config.appName }),
          winston.format.colorize(),
          winston.format.splat(),
          winston.format.ms(),
          winston.format.timestamp(),
          winston.format.printf(
            (info) =>
              `${info.timestamp} [${config.appName}] ${info.level}: ${info.message}`,
          ),
        ),
      }),
    ],
  });

export default createLogger;
