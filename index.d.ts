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
  interface IBaseConfig {
    name: string;
    message: string;
  }
  interface IInputConfig extends IBaseConfig {
    default?: string;
  }
  interface INumberConfig extends IBaseConfig {
    default?: number;
  }
  interface IConfirmConfig extends IBaseConfig {
    default?: boolean;
  }
  interface IListConfig extends IBaseConfig {
    choices: (
      | {
          name: string;
          value: any;
        }
      | string
    )[];
    default?: string;
  }
  interface IRawListConfig extends IBaseConfig {
    choices: (
      | {
          name: string;
          value: any;
        }
      | string
    )[];
    default?: string;
  }
  interface ICheckboxConfig extends IBaseConfig {
    choices: (
      | {
          name: string;
          value: any;
        }
      | string
    )[];
    default?: string[];
  }
  interface IPasswordConfig extends IBaseConfig {
    default?: string;
  }
  interface IEditorConfig extends IBaseConfig {
    default?: string;
  }
  class Prompt {
    promptModule: PromptModule;
    prompts: Question[];
    baseConfig: Omit<IPromptConfig, "initialAnswers">;
    initialAnswers: Partial<Answers>;
    constructor(config: IPromptConfig);
    addInput(inputConfig: IInputConfig): this;
    addNumber(numberConfig: INumberConfig): this;
    addConfirm(confirmConfig: IConfirmConfig): this;
    addList(listConfig: IListConfig): this;
    addRawList(rawListConfig: IRawListConfig): this;
    addCheckbox(checkboxConfig: ICheckboxConfig): this;
    addPassword(passwordConfig: IPasswordConfig): this;
    addEditor(editorConfig: IEditorConfig): this;
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
  default?: any | [any, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}
interface IArguments extends IBaseParams {}
interface IOptions extends IBaseParams {
  alias?: string;
}

export interface CliCommandConfig<IArgs, IOpts> {
  command: string;
  description: string;
  arguments?: Record<keyof IArgs, IArguments>;
  options?: Record<keyof IOpts, IOptions>;
  commands?: CliCommand[];
  helper?: Record<string, any>;
  action?: (props: {
    data: Partial<IArgs & IOpts>;
    logger: ReturnType<typeof Helper.createLogger>;
    helper: {
      runPrompt: ReturnType<typeof Helper.createPrompt>;
      runCron: ReturnType<typeof Helper.createRunCron>;
      runCmd: ReturnType<typeof Helper.createRunCmd>;
      runTask: ReturnType<typeof Helper.createRunTask>;
    } & Record<string, any>;
  }) => void;
}

export class CliCommand<
  IArgs = Record<string, any>,
  IOpts = Record<string, any>,
> {
  childProgram: Command;
  baseConfig: Required<CliCommandConfig>;
  constructor(config: CliCommandConfig<IArgs, IOpts>);
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
  helper?: Record<string, any>;
  configs?: { interactive?: boolean };
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
  } & Record<string, any>;
  constructor(config: CliCoreConfig);
  private createProgram;
  private normalizeConfig;
  private createInteractive;
  private createAction;
  private registerCliCommand;
  execute(): void;
}
