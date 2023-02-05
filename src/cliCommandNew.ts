import { createCommand, createArgument, createOption } from "commander";
import {
  createLogger,
  createRunCron,
  createRunCmd,
  createRunTask,
} from "./shared";
import type { Command } from "commander";
import type CliCore from "./cliCore";

interface CliCommandConfig {
  command: string;
  description: string;
  // cli demo <message> xxx
  // cli demo [message] xxx
  arguments?: {
    [k: string]: {
      description?: string;
      default?: string | [string, string];
      choices?: string[];

      isOptional?: boolean;
      isMultiple?: boolean;
    };
  };
  // 基础
  // cli demo <base> xxx
  // 短名
  // cli demo <b> xxx
  // boolean
  // cli demo <base>
  // 可选
  // cli demo [base]
  // 多参数
  // cli demo [base...]
  options?: {
    [k: string]: {
      short?: string;
      description?: string;
      default?: string | [string, string];
      choices?: string[];

      isOptional?: boolean;
      isMultiple?: boolean;
    };
  };
  commands?: CliCommand[];
  context?: () => { [k: keyof any]: any };
  helper?: { [k: keyof any]: any };
  // configs: { [k: keyof any]: any };
  action?: (props: {
    args: string | number[];
    opts: { [k: keyof any]: any };
    context: { [k: keyof any]: any };
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

export default class CliCommand {
  baseConfig: Required<CliCommandConfig>;

  constructor(config: CliCommandConfig) {
    this.baseConfig = this.normalizeConfig(config);
  }

  normalizeConfig(config: CliCommandConfig): Required<CliCommandConfig> {
    return {
      command: config.command,
      description: config.description,
      arguments: config.arguments || {},
      options: config.options || {},
      commands: config.commands || [],
      context: config.context || (() => ({})),
      helper: config.helper || {},
      action: config.action || (() => {}),
    };
  }

  registerCommand(cliCore: CliCore) {
    const childProgram = createCommand(this.baseConfig.command);
    childProgram.description(this.baseConfig.description);

    const commandArguments = Object.keys(this.baseConfig.arguments).map(
      (key) => {
        const item = this.baseConfig.arguments[key];
        const name = item.isMultiple ? `${key}...` : key;
        const cmd = item.isOptional ? `[${name}]` : `<${name}>`;
        const argument = createArgument(cmd, item.description);
        Array.isArray(item.choices) && argument.choices(item.choices);
        if (item.default) {
          argument.default.apply(
            argument,
            Array.isArray(item.default)
              ? item.default
              : [item.default, item.default],
          );
        }

        return argument;
      },
    );

    commandArguments.forEach((commandArgument) =>
      childProgram.addArgument(commandArgument),
    );

    const commandOptions = Object.keys(this.baseConfig.options).map((key) => {
      const item = this.baseConfig.options[key];
      const name = item.isMultiple ? `${key}...` : key;
      const cmd = item.isOptional ? `[${name}]` : `<${name}>`;
      const option = createOption(cmd, item.description);
      Array.isArray(item.choices) && option.choices(item.choices);
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

    commandOptions.forEach((commandOption) =>
      childProgram.addOption(commandOption),
    );

    childProgram.action((...args) => {
      const instance: Command = args[args.length - 1];
      const _opts = args[args.length - 2];
      const _args = args.slice(0, args.length - 2);

      this.baseConfig.action!({
        args: _args,
        opts: _opts,
        context: {
          ...cliCore.baseConfig.context(),
          ...this.baseConfig.context(),
        },
        helper: { ...cliCore.helper, ...this.baseConfig.helper },
        logger: cliCore.helper.logger,
        instance,
      });
    });

    this.baseConfig.commands.forEach((command) =>
      childProgram.addCommand(command.registerCommand(cliCore)),
    );

    return childProgram;
  }
}
