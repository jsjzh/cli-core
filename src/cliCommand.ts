import { createCommand, createArgument, createOption } from "commander";

import type CliCore from "./cliCore";
import type { Command } from "commander";
import type createLogger from "./util/createLogger";
import type createRunCmd from "./util/createRunCmd";

export interface BaseParams {
  description: string;
  default?: string | [string, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}

interface Arguments extends BaseParams {}

interface Options extends BaseParams {
  alias?: string;
}

interface CliCommandConfig<IArgs, IOpts> {
  command: string;
  description: string;
  // 必选
  // cli demo <message> xxx
  // 可选
  // cli demo [message] xxx
  // 多参数
  // cli demo [message...] xxx xxx
  arguments?: Record<string, Arguments>;
  // 必选
  // cli demo <base> xxx
  // 可选
  // cli demo [base] xxx
  // 多参数
  // cli demo [base...] xxx xxx
  // 布尔
  // cli demo <base>
  // 短名
  // cli demo <b> xxx
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
  public childProgram: Command;
  public baseConfig: Required<CliCommandConfig<IArgs, IOpts>>;

  constructor(config: CliCommandConfig<IArgs, IOpts>) {
    this.baseConfig = this.normalizeConfig(config);
    this.childProgram = createCommand(this.baseConfig.command).description(
      this.baseConfig.description,
    );
  }

  private normalizeConfig(
    config: CliCommandConfig<IArgs, IOpts>,
  ): Required<CliCommandConfig<IArgs, IOpts>> {
    return {
      command: config.command,
      description: config.description,
      arguments: config.arguments || {},
      options: config.options || {},
      commands: config.commands || [],
      action: config.action || (() => {}),
    };
  }

  private createArguments() {
    return Object.keys(this.baseConfig.arguments).map((key) => {
      const item = this.baseConfig.arguments[key];

      const name = item.multiple ? `${key}...` : key;
      const cmd = item.optional ? `[${name}]` : `<${name}>`;

      const argument = createArgument(cmd, item.description);

      if (item.choices && Array.isArray(item.choices)) {
        argument.choices(item.choices);
      }

      if (item.default) {
        argument.default.apply(
          argument,
          Array.isArray(item.default)
            ? item.default
            : [item.default, item.default],
        );
      }

      return argument;
    });
  }

  private createOptions() {
    return Object.keys(this.baseConfig.options).map((key) => {
      const item = this.baseConfig.options[key];

      const name = item.multiple ? `${key}...` : key;
      const cmd = item.optional ? `[${name}]` : `<${name}>`;

      const currentCmd = item.alias
        ? `-${item.alias}, --${key} ${cmd}`
        : `--${key} ${cmd}`;

      const option = createOption(currentCmd, item.description);

      if (item.choices && Array.isArray(item.choices)) {
        option.choices(item.choices);
      }

      if (item.default) {
        option.default.apply(
          option,
          Array.isArray(item.default)
            ? item.default
            : [item.default, item.default],
        );
      }

      return option;
    });
  }

  private createAction(cliCore: CliCore) {
    return (...args: any[]) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts = args[args.length - 2];

      let currArgs = Object.keys(this.baseConfig.arguments).reduce(
        (pre, curr, index) => ({ [curr]: _args[index], ...pre }),
        {},
      );

      let currOpts = _opts;

      this.baseConfig.action({
        data: { ...currArgs, ...currOpts },
        logger: cliCore.logger,
        runCmd: cliCore.runCmd,
      });
    };
  }

  public registerCommand(cliCore: CliCore) {
    const args = this.createArguments();
    const opts = this.createOptions();
    const action = this.createAction(cliCore);

    args.forEach((arg) => this.childProgram.addArgument(arg));
    opts.forEach((arg) => this.childProgram.addOption(arg));
    this.childProgram.action(action);

    this.baseConfig.commands.forEach((command) =>
      this.childProgram.addCommand(command.registerCommand(cliCore)),
    );

    return this.childProgram;
  }
}
