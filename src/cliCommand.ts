import { createCommand, createArgument, createOption } from "commander";
import { cloneDeep } from "lodash-es";
import { formatChoices } from "./util";

import type CliCore from "./cliCore";
import type { Command } from "commander";
import type createLogger from "./util/createLogger";
import type createRunCmd from "./util/createRunCmd";

export interface Choice {
  key: string;
  value: any;
  label?: string;
}

export type Choices = (string | Choice)[];

export type CliCommandChoices = Choices | (() => (string | Choice)[]);

export interface BaseParams<T = CliCommandChoices> {
  description?: string;
  // TODO multiple checkbox
  // TODO 这里应该根据 multiple 有两种参数输入格式
  // TODO 是不是需要新建一种 interface
  default?: string | string[];
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
  description?: string;
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
  childProgram: Command;
  baseConfig: Omit<
    Required<CliCommandConfig<IArgs, IOpts>>,
    "arguments" | "options"
  > & {
    arguments: Record<string, Arguments<Choice[]>>;
    options: Record<string, Options<Choice[]>>;
  };

  constructor(config: CliCommandConfig<IArgs, IOpts>) {
    this.baseConfig = this.normalizeConfig(config);
    this.childProgram = createCommand(this.baseConfig.command).description(
      this.baseConfig.description,
    );
  }

  private normalizeConfig(config: CliCommandConfig<IArgs, IOpts>) {
    const _config = cloneDeep(config);

    if (_config.arguments) {
      Object.keys(_config.arguments).forEach((key) => {
        if (_config.arguments![key].choices) {
          _config.arguments![key].choices = formatChoices(
            _config.arguments![key].choices!,
          );
        }
      });
    }

    if (_config.options) {
      Object.keys(_config.options).forEach((key) => {
        if (_config.options![key].choices) {
          _config.options![key].choices = formatChoices(
            _config.options![key].choices!,
          );
        }
      });
    }

    return {
      command: _config.command,
      description: _config.description ?? _config.command,
      arguments: (_config.arguments ?? {}) as Record<
        string,
        Arguments<Choice[]>
      >,
      options: (_config.options ?? {}) as Record<string, Options<Choice[]>>,
      commands: _config.commands ?? [],
      action: _config.action ?? (() => {}),
    };
  }

  private createArguments() {
    return Object.keys(this.baseConfig.arguments).map((key) => {
      const item = this.baseConfig.arguments[key];

      const name = item.multiple ? `${key}...` : key;
      const cmd = item.optional ? `[${name}]` : `<${name}>`;

      const argument = createArgument(cmd, item.description ?? key);

      if (Array.isArray(item.choices)) {
        argument.choices(item.choices.map((choice) => choice.key));
      }

      if (item.multiple && Array.isArray(item.default)) {
        const currentDefault = item.default.join(", ");
        argument.default(currentDefault, currentDefault);
      } else {
        argument.default(item.default as string, item.default as string);
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

      const option = createOption(currentCmd, item.description ?? key);

      if (Array.isArray(item.choices)) {
        option.choices(item.choices.map((choice) => choice.key));
      }

      if (item.multiple && Array.isArray(item.default)) {
        const currentDefault = item.default.join(", ");
        option.default(currentDefault, currentDefault);
      } else {
        option.default(item.default as string, item.default as string);
      }

      return option;
    });
  }

  private createAction(cliCore: CliCore) {
    return (...args: any[]) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts = args[args.length - 2];

      const currArgs = Object.keys(this.baseConfig.arguments).reduce(
        (pre, curr, index) => ({ [curr]: _args[index], ...pre }),
        {} as Record<string, any>,
      );

      // TODO multiple checkbox
      Object.keys(currArgs).forEach((key) => {
        if (Array.isArray(this.baseConfig.arguments[key].choices)) {
          currArgs[key] =
            this.baseConfig.arguments[key].choices!.find(
              (choice) => choice.key === currArgs[key],
            )?.value ?? currArgs[key];
        }
      });

      const currOpts = _opts;

      // TODO multiple checkbox
      Object.keys(currOpts).forEach((key) => {
        if (Array.isArray(this.baseConfig.options[key].choices)) {
          currOpts[key] =
            this.baseConfig.options[key].choices!.find(
              (choice) => choice.key === currOpts[key],
            )?.value ?? currOpts[key];
        }
      });

      this.baseConfig.action({
        data: { ...currArgs, ...currOpts },
        logger: cliCore.logger,
        runCmd: cliCore.runCmd,
      });
    };
  }

  registerCommand(cliCore: CliCore) {
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
