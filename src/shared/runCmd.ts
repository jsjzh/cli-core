import { execSync } from "child_process";
import type { Logger } from "winston";

const createRunCmd =
  (logger: Logger) =>
  (cwd: string = process.cwd()) =>
  (cmd: string, showExecuteCmd = true, showStdio = true) => {
    try {
      if (showExecuteCmd) {
        logger.info(`将在 ${cwd} 运行指令 ${cmd}`);
      }
      return execSync(cmd, {
        cwd,
        stdio: showStdio ? "inherit" : "pipe",
        encoding: "utf-8",
      });
    } catch (error) {
      throw new Error(`在 ${cwd} 运行 ${cmd} 指令出错`);
    }
  };

export default createRunCmd;
