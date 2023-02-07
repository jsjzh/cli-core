import type { CronJob, CronJobParameters } from "cron";
import type { Command } from "commander";
import type { Logger } from "winston";
import type { StdioOptions } from "child_process";
import type { PromptModule, Question, Answers } from "inquirer";

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
      choices: ({ name: string; value: string } | string)[];
      default?: string;
    }): this;
    addRawList(rawlistConfig: {
      name: string;
      message: string;
      choices: ({ name: string; value: string } | string)[];
      default?: string;
    }): this;
    addCheckbox(checkboxConfig: {
      name: string;
      message: string;
      choices: ({ name: string; value: string } | string)[];
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
  alias?: string;
}

export interface CliCommandConfig {
  command: string;
  description: string;
  arguments?: { [k: string]: IArguments };
  options?: { [k: string]: IOptions };
  commands?: CliCommand[];
  context?: () => { [k: string]: any };
  helper?: { [k: string]: any };
  action?: (props: {
    data: { [k: string]: any };
    context: { [k: string]: any };
    logger: ReturnType<typeof Helper.createLogger>;
    helper: {
      runPrompt: ReturnType<typeof Helper.createPrompt>;
      runCron: ReturnType<typeof Helper.createRunCron>;
      runCmd: ReturnType<typeof Helper.createRunCmd>;
      runTask: ReturnType<typeof Helper.createRunTask>;
      [k: string]: any;
    };
  }) => void;
}

export class CliCommand {
  childProgram: Command;
  baseConfig: Required<CliCommandConfig>;
  constructor(config: CliCommandConfig);
  private normalizeConfig;
  private createArguments;
  private createOptions;
  private createAction;
  registerCommand(cliCore: CliCore): Command;
}

export interface CliCoreConfig {
  name: string;
  version: string;
  description: string;
  commands?: CliCommand[];
  context?: () => { [k: string]: any };
  helper?: { [k: string]: any };
}

export class CliCore {
  program: Command;
  baseConfig: Required<CliCoreConfig>;
  helper: {
    logger: ReturnType<typeof Helper.createLogger>;
    runPrompt: ReturnType<typeof Helper.createPrompt>;
    runCmd: ReturnType<typeof Helper.createRunCmd>;
    runCron: ReturnType<typeof Helper.createRunCron>;
    runTask: ReturnType<typeof Helper.createRunTask>;
    [k: string]: any;
  };
  constructor(config: CliCoreConfig);
  private createProgram;
  private normalizeConfig;
  private createInteractive;
  private createAction;
  private registerCliCommand;
  execute(): void;
}
