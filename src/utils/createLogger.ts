import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "node:path";

// 0 1 2 3 4 5 6
type Level = "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";

export interface CreateLoggerConfig {
  base: string;
  appName: string;
  datePattern: string;
  logName: string;
  maxSize: string;
  maxFiles: string;
  logLevel: Level;
  outputLevel: Level;
}

const createLogger = (config: CreateLoggerConfig) =>
  winston.createLogger({
    transports: [
      new DailyRotateFile({
        level: config.logLevel,
        dirname: path.join(config.base, "logs", config.appName),
        datePattern: config.datePattern,
        filename: config.logName,
        maxSize: config.maxSize,
        maxFiles: config.maxFiles,
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
        level: config.outputLevel,
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
