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
    required?: boolean;
  }[];
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
      arguments: config.arguments || [],
      options: config.options || [],
      commands: config.commands || [],
      context: config.context || (() => ({})),
      helper: config.helper || {},
      action: config.action || (() => {}),
    };
  }

  registerCommand(cliCore: CliCore) {
    const childProgram = createCommand(this.baseConfig.command);
    childProgram.description(this.baseConfig.description);

    const commandArguments = this.baseConfig.arguments.map((arg) => {
      const argument = createArgument(arg.name, arg.description);

      arg.selects && argument.choices(arg.selects);
      arg.default && argument.default.apply(argument, arg.default);

      return argument;
    });

    commandArguments.forEach((commandArgument) =>
      childProgram.addArgument(commandArgument),
    );

    const commandOptions = this.baseConfig.options.map((opt) => {
      const option = createOption(opt.name, opt.description);

      opt.selects && option.choices(opt.selects);
      opt.default && option.default.apply(option, opt.default);

      if (opt.required) option.required = true;

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
