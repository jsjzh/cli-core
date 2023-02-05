import type { CronJob, CronJobParameters } from "cron";
import type { Command } from "commander";
import type { Logger } from "winston";
import type { StdioOptions } from "child_process";
import type { PromptModule, Question, Answers } from "inquirer";

// type AnyObject = { [k: keyof any]: any };

declare namespace Helper {
  interface TaskItem {
    title: string;
    task(): Promise<any>;
  }
  interface RunTaskConfig {
    hasTip?: boolean;
  }
  class RunTask {
    constructor(logger: Logger, config?: RunTaskConfig);
    add(taskItem: TaskItem | TaskItem[]): this;
    run(): Promise<void>;
  }

  interface IPromptConfig {
    prefix?: string;
    suffix?: string;
    initialAnswers?: Partial<Answers>;
  }

  class Prompt {
    promptModule: PromptModule;
    prompts: Question[];
    baseConfig: IPromptConfig;
    initialAnswers: Partial<Answers>;
    constructor(config: IPromptConfig);
    addInput(inputConfig: {
      name: string;
      message: string;
      default?: string;
    }): this;
    addNumber(numberConfig: {
      name: string;
      message: string;
      default?: number;
    }): this;
    addConfirm(confirmConfig: {
      name: string;
      message: string;
      default?: boolean;
    }): this;
    addList(listConfig: {
      name: string;
      message: string;
      choices: (
        | {
            name: string;
            value: string;
          }
        | string
      )[];
      default?: string;
    }): this;
    addRawList(rawlistConfig: {
      name: string;
      message: string;
      choices: (
        | {
            name: string;
            value: string;
          }
        | string
      )[];
      default?: string;
    }): this;
    addCheckbox(checkboxConfig: {
      name: string;
      message: string;
      choices: (
        | {
            name: string;
            value: string;
          }
        | string
      )[];
      default?: string[];
    }): this;
    addPassword(passwordConfig: {
      name: string;
      message: string;
      default?: string;
    }): this;
    addEditor(editorConfig: {
      name: string;
      message: string;
      default?: string;
    }): this;
    execute(callback?: (value: Answers) => void): Promise<void>;
  }

  const createPrompt: (
    config?: IPromptConfig,
  ) => (initialAnswers?: Partial<Answers>) => Prompt;
  const createRunTask: (logger: Logger) => (option: RunTaskConfig) => RunTask;
  const createRunCron: (
    logger: Logger,
  ) => (options: CronJobParameters) => CronJob;
  const createRunCmd: (
    logger: Logger,
  ) => (
    cwd?: string,
  ) => (cmd: string, stdio?: StdioOptions, showExecuteCmd?: boolean) => string;
  const createLogger: (option: { appName: string }) => Logger;
}

interface IBaseParams {
  description: string;
  default?: string | [string, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}
interface IArguments extends IBaseParams {}
interface IOptions extends IBaseParams {
  short?: string;
}

export interface CliCommandConfig {
  command: string;
  description: string;
  arguments?: { [k: string]: IArguments };
  options?: { [k: string]: IOptions };
  commands?: CliCommand[];
  context?: () => { [k: keyof any]: any };
  helper?: { [k: keyof any]: any };
  action?: (props: {
    data: { [k: keyof any]: any };
    context: { [k: keyof any]: any };
    logger: ReturnType<typeof Helper.createLogger>;
    helper: {
      runPrompt: ReturnType<typeof Helper.createPrompt>;
      runCron: ReturnType<typeof Helper.createRunCron>;
      runCmd: ReturnType<typeof Helper.createRunCmd>;
      runTask: ReturnType<typeof Helper.createRunTask>;
      [k: keyof any]: any;
    };
    instance: Command;
  }) => void;
}

export class CliCommand {
  constructor(config: CliCommandConfig);
}

export interface CliCoreConfig {
  name: string;
  version: string;
  description: string;
  commands?: CliCommand[];
  context?: () => { [k: keyof any]: any };
  helper?: { [k: keyof any]: any };
}

export class CliCore {
  helper: {
    logger: ReturnType<typeof Helper.createLogger>;
    runPrompt: ReturnType<typeof Helper.createPrompt>;
    runCmd: ReturnType<typeof Helper.createRunCmd>;
    runCron: ReturnType<typeof Helper.createRunCron>;
    runTask: ReturnType<typeof Helper.createRunTask>;
    [k: keyof any]: any;
  };
  constructor(config: CliCoreConfig);
  execute(): void;
}
