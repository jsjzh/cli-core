import type { CronJob, CronJobParameters } from "cron";
import type { Command } from "commander";
import type { Logger } from "winston";
import type { StdioOptions } from "child_process";

export const createRunCmd: (
  logger: Logger,
) => (
  cwd?: string,
) => (cmd: string, stdio?: StdioOptions, showExecuteCmd?: boolean) => string;

interface TaskItem {
  title: string;
  task: (...args: any) => Promise<any>;
}
interface RunTaskConfig {
  hasTip?: boolean;
}
export class RunTask {
  tasks: TaskItem[];
  config: RunTaskConfig;
  logger: Logger;
  constructor(logger: Logger, config?: RunTaskConfig);
  add(taskItem: TaskItem | TaskItem[]): this;
  run(): Promise<void>;
  _runTask(taskItem: TaskItem): Promise<void>;
}

export const createRunTask: (
  logger: Logger,
) => (option: RunTaskConfig) => RunTask;

export const createRunCron: (
  logger: Logger,
) => (options: CronJobParameters) => CronJob;

interface ICreateLoggerOption {
  appName: string;
}

export const createLogger: (option: ICreateLoggerOption) => Logger;

interface CliCommandConfig {
  command: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    selects?: string[];
    default?: [any, string];
  }[];
  options?: {
    name: string;
    description: string;
    selects?: string[];
    default?: [any, string];
  }[];
  commands?: CliCommand[];
  context?: () => {
    [k: keyof any]: any;
  };
  helper?: {
    [k: keyof any]: any;
  };
  action?: (props: {
    args: string | number[];
    opts: {
      [k: keyof any]: any;
    };
    context: {
      [k: keyof any]: any;
    };
    logger: ReturnType<typeof createLogger>;
    helper: {
      runCron: ReturnType<typeof createRunCron>;
      runCmd: ReturnType<typeof createRunCmd>;
      runTask: ReturnType<typeof createRunTask>;
      [k: keyof any]: any;
    };
    instance: Command;
  }) => void;
}

export class CliCommand {
  baseConfig: Required<CliCommandConfig>;
  constructor(config: CliCommandConfig);
  normalizeConfig(config: CliCommandConfig): Required<CliCommandConfig>;
  registerCommand(cliCore: CliCore): Command;
}

export interface CliCoreConfig {
  name: string;
  version: string;
  description: string;
  commands?: CliCommand[];
  context?: () => {
    [k: keyof any]: any;
  };
  helper?: {
    [k: keyof any]: any;
  };
}

export class CliCore {
  program: Command;
  baseConfig: Required<CliCoreConfig>;
  helper: {
    logger: ReturnType<typeof createLogger>;
    runCmd: ReturnType<typeof createRunCmd>;
    runCron: ReturnType<typeof createRunCron>;
    runTask: ReturnType<typeof createRunTask>;
    [k: keyof any]: any;
  };
  constructor(config: CliCoreConfig);
  normalizeConfig(config: CliCoreConfig): Required<CliCoreConfig>;
  createHelper(): void;
  registerCliCommand(): void;
  execute(): void;
}
