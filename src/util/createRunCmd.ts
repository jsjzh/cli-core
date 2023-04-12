import { execSync } from "node:child_process";

import type { StdioOptions } from "node:child_process";
import type { Logger } from "winston";

const createRunCmd =
  (logger: Logger) =>
  (cwd: string = process.cwd()) =>
  (cmd: string, stdio: StdioOptions = "inherit", showExecuteCmd = true) => {
    try {
      if (showExecuteCmd) {
        logger.info(`将在 ${cwd} 运行指令 ${cmd}`);
      }

      return execSync(cmd, {
        cwd,
        stdio,
        encoding: "utf8",
      });
    } catch (error) {
      throw new Error(`在 ${cwd} 运行 ${cmd} 指令出错`);
    }
  };

export default createRunCmd;
