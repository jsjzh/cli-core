declare module "src/shared/prompt" {
  import type { PromptModule, Question, Answers } from "inquirer";
  import { ChoiceItem, Choices } from "src/cliCommand";
  interface BaseConfig {
    name: string;
    description?: string;
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
  interface InnerListConfig extends BaseConfig {
    choices: ChoiceItem[];
    default?: string;
  }
  interface RawListConfig extends BaseConfig {
    choices: Choices;
    default?: string;
  }
  interface InnerRawListConfig extends BaseConfig {
    choices: ChoiceItem[];
    default?: string;
  }
  interface CheckboxConfig extends BaseConfig {
    choices: Choices;
    default?: string[];
  }
  interface InnerCheckboxConfig extends BaseConfig {
    choices: ChoiceItem[];
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
    prompts: Record<string, Question>;
    configs: Record<
      string,
      | InputConfig
      | NumberConfig
      | ConfirmConfig
      | InnerListConfig
      | InnerRawListConfig
      | InnerCheckboxConfig
      | PasswordConfig
      | EditorConfig
    >;
    constructor(config: PromptConfig);
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
    execute(): void;
  }
}
declare module "src/cliCommand" {
  import type CliCore from "src/cliCore";
  import type { Command } from "commander";
  import type createLogger from "src/util/createLogger";
  import type createRunCmd from "src/util/createRunCmd";
  export const formatChoices: (choices: CliCommandChoices) => InnerChoiceItem[];
  export interface ChoiceItem {
    key: string;
    value: any;
    label?: string;
  }
  export type Choices = (string | ChoiceItem)[];
  type CliCommandChoices = Choices | (() => Choices);
  interface BaseParams<T> {
    description?: string;
    default?: string | string[];
    choices?: T;
    optional?: boolean;
    multiple?: boolean;
  }
  interface Arguments<T> extends BaseParams<T> {}
  interface Options<T> extends BaseParams<T> {
    alias?: string;
  }
  interface CliCommandConfig<IArgs, IOpts> {
    name: string;
    description?: string;
    arguments?: Record<string, Arguments<CliCommandChoices>>;
    options?: Record<string, Options<CliCommandChoices>>;
    commands?: CliCommand[];
    action?: (props: {
      data: Partial<IArgs & IOpts>;
      logger: ReturnType<typeof createLogger>;
      runCmd: ReturnType<typeof createRunCmd>;
    }) => void;
  }
  interface InnerCliCommandConfig<IArgs, IOpts> {
    name: string;
    description: string;
    arguments: Record<string, InnerArguments>;
    options: Record<string, InnerOptions>;
    commands: CliCommand[];
    action: (props: {
      data: Partial<IArgs & IOpts>;
      logger: ReturnType<typeof createLogger>;
      runCmd: ReturnType<typeof createRunCmd>;
    }) => void;
  }
  export interface InnerBaseParams {
    description: string;
    default: string[];
    choices: InnerChoiceItem[];
    optional: boolean;
    multiple: boolean;
  }
  interface InnerArguments extends InnerBaseParams {}
  interface InnerOptions extends InnerBaseParams {
    alias?: string;
  }
  export interface InnerChoiceItem {
    key: string;
    value: any;
    label: string;
  }
  export default class CliCommand<
    IArgs extends Record<string, any> = {},
    IOpts extends Record<string, any> = {},
  > {
    childProgram: Command;
    baseConfig: InnerCliCommandConfig<IArgs, IOpts>;
    constructor(config: CliCommandConfig<IArgs, IOpts>);
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
