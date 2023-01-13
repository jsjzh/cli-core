import type { CronJob, CronJobParameters } from "cron";
import type { Command } from "commander";
import type { Logger } from "winston";
import type { StdioOptions } from "child_process";

type AnyObject = { [k: keyof any]: any };

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

interface IArg {
  name: string;
  description: string;
  selects?: string[];
  default?: [any, string];
}

export interface CliCommandConfig<O = AnyObject, C = AnyObject, H = AnyObject> {
  /**
   * 定义子 command 指令
   *
   * @example
   *
   * 如：定义 command 为 start，则可以如下方式触发
   *
   * ```shell
   * cli start
   * ```
   */
  command: string;
  /**
   * 描述子 command 功能
   */
  description: string;
  /**
   * 定义 arguments
   *
   * @example
   *
   * ```ts
   * [
   *   {
   *     name: "<message>",
   *     description: "输入 push 的内容",
   *   },
   *   {
   *     name: "[branch]",
   *     description: "输入分支",
   *     default: ["master", "默认传入 master"],
   *     selects: ["master", "develop"],
   *   },
   * ]
   * ```
   */
  arguments?: IArg[];
  /**
   * 定义 options
   *
   * @example
   *
   * ```ts
   * [
   *   {
   *     name: "-p, --platform",
   *     description: "选择平台",
   *   },
   *   {
   *     name: "-G, --no-git",
   *     description: "不要初始化 git",
   *   },
   *   {
   *     name: "-c, --version <version>",
   *     description: "输入发布时的版本升级方式",
   *     selects: ["major", "minor", "patch", "premajor", "preminor", "prepatch"],
   *     default: ["patch", "默认升级方式为：patch"],
   *   },
   *   {
   *     name: "-d, --dirs [dirs...]",
   *     description: "[dirs...] 会以贪婪的方式获取 dir",
   *   },
   * ]
   * ```
   */
  options?: IArg[];
  /**
   * 传入 CliCommand 实例
   *
   * @example
   *
   * ```ts
   * {
   *    commands: [
   *      new CliCommand({
   *        command: "git",
   *        description: "git 命令合集",
   *        action(props) {
   *          props.instance.outputHelp()
   *        },
   *      }),
   *    ],
   *  }
   * ```
   */
  commands?: CliCommand<C, H>[];
  /**
   * 传入局部 context
   *
   * @example
   *
   * ```ts
   * {
   *   context() {
   *     return {
   *       name: "king",
   *       age: 18,
   *     }
   *   },
   * }
   * ```
   */
  context?(): C;
  /**
   * 传入局部 helper
   *
   * @example
   *
   * ```ts
   * {
   *   helper: {
   *     getName() {
   *       return "king"
   *     },
   *   },
   * }
   * ```
   */
  helper?: H;
  /**
   * 命令行匹配到之后执行 action
   */
  action?: (props: {
    /**
     * 若定义了 arguments
     * 则会以数组的形式传入
     *
     * @example
     *
     * ```ts
     * props.args[0]
     * // hello
     * ```
     */
    args: string | number[];
    /**
     * 若定义了 options
     * 则会以对象的形式传入
     *
     * @example
     *
     * ```ts
     * props.opts.message
     * // hello
     * ```
     */
    opts: Partial<O>;
    /**
     * 可以获取到全局 + 局部的 context
     */
    context: C;
    /**
     * logger 输出工具库
     *
     * @remarks
     * props.logger.info: 会在控制台输出
     *
     * props.logger.warn: 会在控制台输出，还会被记录到当前目录下的 logs 文件
     *
     * props.logger.error: 会在控制台输出，还会被记录到当前目录下的 logs 文件
     *
     * @example
     *
     * ```ts
     * props.logger.info("hello world")
     * ```
     */
    logger: ReturnType<typeof Helper.createLogger>;
    /**
     * 工具函数
     */
    helper: {
      /**
       * 定时执行任务
       *
       * @example
       *
       * ```ts
       * props.helper.runCron({
       *   cronTime: "* * * * * *",
       *   onTick() {
       *     props.logger.info("hello wrold")
       *   },
       * })
       * ```
       */
      runCron: ReturnType<typeof Helper.createRunCron>;
      /**
       * 定义同步命令行执行
       *
       * @example
       *
       * ```ts
       * const run = props.helper.runCmd(process.cwd())
       * run("echo hello")
       * ```
       */
      runCmd: ReturnType<typeof Helper.createRunCmd>;
      /**
       * TODO
       */
      runTask: ReturnType<typeof Helper.createRunTask>;
      [k: keyof any]: any;
    } & H;
    /**
     * Command 实例
     */
    instance: Command;
  }) => void;
}

export class CliCommand<C, H> {
  constructor(config: CliCommandConfig<AnyObject, C, H>);
}

export interface CliCoreConfig<C = AnyObject, H = AnyObject> {
  /**
   * 定义命令行工具的名称
   *
   * @example
   *
   * 如：定义 name 为 cli，则可以如下方式触发
   *
   * ```shell
   * cli start xxx
   * cli run xxx
   * ```
   */
  name: string;
  /**
   * 定义命令行工具的版本
   */
  version: string;
  /**
   * 描述命令行工具功能
   */
  description: string;
  /**
   * 传入 CliCommand 实例
   *
   * @example
   *
   * ```ts
   * {
   *    commands: [
   *      new CliCommand({
   *        command: "git",
   *        description: "git 命令合集",
   *        action(props) {
   *          props.instance.outputHelp()
   *        },
   *      }),
   *    ],
   *  }
   * ```
   */
  commands?: CliCommand<C, H>[];
  /**
   * 传入全局 context
   *
   * @example
   *
   * ```ts
   * {
   *   context() {
   *     return {
   *       name: "king",
   *       age: 18,
   *     }
   *   },
   * }
   * ```
   */
  context?(): C;
  /**
   * 传入全局 helper
   *
   * @example
   *
   * ```ts
   * {
   *   helper: {
   *     getName() {
   *       return "king"
   *     },
   *   },
   * }
   * ```
   */
  helper?: H;
}

export class CliCore {
  constructor(config: CliCoreConfig);
  execute(): void;
}
