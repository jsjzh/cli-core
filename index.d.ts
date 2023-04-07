declare module "src/shared/prompt" {
  import type { PromptModule, Question, Answers } from "inquirer";
  export interface Choice {
    name: string;
    value: any;
  }
  export type Choices = (string | Choice)[];
  interface BaseConfig {
    name: string;
    message: string;
  }
  interface InputConfig extends BaseConfig {
    default?: string;
  }
  interface NumberConfig extends BaseConfig {
    default?: number;
  }
  interface ConfirmConfig extends BaseConfig {
    default?: boolean;
  }
  interface ListConfig extends BaseConfig {
    choices: Choices;
    default?: string;
  }
  interface RawListConfig extends BaseConfig {
    choices: Choices;
    default?: string;
  }
  interface CheckboxConfig extends BaseConfig {
    choices: Choices;
    default?: string[];
  }
  interface PasswordConfig extends BaseConfig {
    default?: string;
  }
  interface EditorConfig extends BaseConfig {
    default?: string;
  }
  interface PromptConfig {
    prefix?: string;
    suffix?: string;
    initialAnswers?: Answers;
  }
  export default class Prompt<T extends Answers> {
    promptModule: PromptModule;
    baseConfig: Required<PromptConfig>;
    prompts: Question[];
    constructor(config: PromptConfig);
    private normalizeConfig;
    addInput(inputConfig: InputConfig): this;
    addNumber(numberConfig: NumberConfig): this;
    addConfirm(confirmConfig: ConfirmConfig): this;
    addList(listConfig: ListConfig): this;
    addRawList(rawListConfig: RawListConfig): this;
    addCheckbox(checkboxConfig: CheckboxConfig): this;
    addPassword(passwordConfig: PasswordConfig): this;
    addEditor(editorConfig: EditorConfig): this;
    execute(callback?: (values: T) => void): Promise<void>;
  }
  export const createPrompt: <T extends Answers>(
    config?: PromptConfig,
  ) => Prompt<T>;
}
declare module "src/util/index" {
  import type { BaseParams, CliCommandChoices } from "src/cliCommand";
  import { Choice } from "src/shared/prompt";
  export const isInput: (config: BaseParams) => boolean;
  export const isList: (config: BaseParams) => boolean;
  export const isCheckbox: (config: BaseParams) => boolean | undefined;
  export const haveLenArray: (arr: any) => boolean;
  export const formatChoices: (choices: CliCommandChoices) => Choice[];
}
declare module "src/util/createLogger" {
  import winston from "winston";
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
  const createLogger: (config: CreateLoggerConfig) => winston.Logger;
  export default createLogger;
}
declare module "src/util/createRunCmd" {
  import type { StdioOptions } from "node:child_process";
  import type { Logger } from "winston";
  const createRunCmd: (
    logger: Logger,
  ) => (
    cwd?: string,
  ) => (cmd: string, stdio?: StdioOptions, showExecuteCmd?: boolean) => string;
  export default createRunCmd;
}
declare module "src/cliCore" {
  import CliCommand from "src/cliCommand";
  import createLogger from "src/util/createLogger";
  import createRunCmd from "src/util/createRunCmd";
  import type { Command } from "commander";
  import type { CreateLoggerConfig } from "src/util/createLogger";
  interface CliCoreConfig {
    /**
     * 应用名
     */
    name: string;
    /**
     * 应用版本号
     */
    version: string;
    /**
     * 应用描述，默认取应用名
     */
    description?: string;
    commands?: CliCommand[];
    config?: {
      /**
       * 是否默认使用命令行模式，默认为 false
       */
      interactive?: boolean;
    };
    loggerConfig?: CreateLoggerConfig;
  }
  export default class CliCore {
    program: Command;
    baseConfig: Required<Omit<CliCoreConfig, "loggerConfig">>;
    logger: ReturnType<typeof createLogger>;
    runCmd: ReturnType<typeof createRunCmd>;
    constructor(config: CliCoreConfig);
    private normalizeConfig;
    private createProgram;
    private createInteractive;
    private createAction;
    private registerCliCommand;
    execute(): void;
  }
}
declare module "src/cliCommand" {
  import type CliCore from "src/cliCore";
  import type { Command } from "commander";
  import type createLogger from "src/util/createLogger";
  import type createRunCmd from "src/util/createRunCmd";
  import type { Choices, Choice } from "src/shared/prompt";
  export type CliCommandChoices = Choices | (() => (string | Choice)[]);
  export interface BaseParams<T = CliCommandChoices> {
    description: string;
    default?: string | [string, string];
    choices?: T;
    optional?: boolean;
    multiple?: boolean;
  }
  interface Arguments<T = CliCommandChoices> extends BaseParams<T> {}
  interface Options<T = CliCommandChoices> extends BaseParams<T> {
    alias?: string;
  }
  interface CliCommandConfig<IArgs, IOpts> {
    command: string;
    description: string;
    arguments?: Record<string, Arguments>;
    options?: Record<string, Options>;
    commands?: CliCommand[];
    action?: (props: {
      data: Partial<IArgs & IOpts>;
      logger: ReturnType<typeof createLogger>;
      runCmd: ReturnType<typeof createRunCmd>;
    }) => void;
  }
  export default class CliCommand<
    IArgs extends Record<string, any> = {},
    IOpts extends Record<string, any> = {},
  > {
    childProgram: Command;
    baseConfig: Omit<
      Required<CliCommandConfig<IArgs, IOpts>>,
      "arguments" | "options"
    > & {
      arguments: Record<string, Arguments<Choice[]>>;
      options: Record<string, Options<Choice[]>>;
    };
    constructor(config: CliCommandConfig<IArgs, IOpts>);
    private normalizeConfig;
    private createArguments;
    private createOptions;
    private createAction;
    registerCommand(cliCore: CliCore): Command;
  }
}
declare module "src/shared/cron" {
  import { CronJob } from "cron";
  import type { CronJobParameters } from "cron";
  export default CronJob;
  export const createCron: (options: CronJobParameters) => CronJob;
}
declare module "src/shared/task" {
  interface TaskItem {
    title: string;
    task: () => Promise<any>;
  }
  interface TaskConfig {
    showLog?: boolean;
  }
  export default class Task {
    tasks: TaskItem[];
    config: TaskConfig;
    constructor(config?: TaskConfig);
    add(taskItem: TaskItem | TaskItem[]): this;
    execute(): Promise<void>;
  }
  export const createTask: (option: TaskConfig) => Task;
}
declare module "@oishi/cli-core" {
  import CliCore from "src/cliCore";
  import CliCommand from "src/cliCommand";
  import { createPrompt } from "src/shared/prompt";
  import { createCron } from "src/shared/cron";
  import { createTask } from "src/shared/task";
  export { CliCore, CliCommand, createPrompt, createCron, createTask };
}
