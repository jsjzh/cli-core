import { createCommand, createArgument, createOption } from "commander";
import {
  createLogger,
  createPrompt,
  createRunCron,
  createRunCmd,
  createRunTask,
} from "./shared";
import { omit } from "lodash";
import type { Command } from "commander";
import type CliCore from "./cliCore";

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

interface CliCommandConfig {
  command: string;
  description: string;
  // cli demo <message> xxx
  // cli demo [message] xxx
  arguments?: { [k: string]: IArguments };
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
  options?: { [k: string]: IOptions };
  commands?: CliCommand[];
  context?: () => { [k: keyof any]: any };
  helper?: { [k: keyof any]: any };
  // configs: { [k: keyof any]: any };
  action?: (props: {
    data: { [k: keyof any]: any };
    // args: { [k: keyof any]: any };
    // opts: { [k: keyof any]: any };
    context: { [k: keyof any]: any };
    logger: ReturnType<typeof createLogger>;
    helper: {
      runPrompt: ReturnType<typeof createPrompt>;
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
        const name = item.multiple ? `${key}...` : key;
        const cmd = item.optional ? `[${name}]` : `<${name}>`;
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
      const name = item.multiple ? `${key}...` : key;
      const cmd = item.optional ? `[${name}]` : `<${name}>`;
      const currentCmd = item.short
        ? `-${item.short}, --${key} ${cmd}`
        : `--${key} ${cmd}`;

      const option = createOption(currentCmd, item.description);

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

    const option = createOption("-i, --interactive", "开启交互式命令行");
    option.default(false, "不开启");
    childProgram.addOption(option);

    // 艹，发现个问题，他妈的，一旦是 <name> 这样必须的参数
    // 那特么的，是没有办法进入 action 函数的
    // 会显示 error: missing required argument 'name'
    childProgram.action((...args) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts = args[args.length - 2];

      let currArgs = Object.keys(this.baseConfig.arguments).reduce(
        (pre, curr, index) => ({ [curr]: _args[index], ...pre }),
        {},
      );

      let currOpts = omit(_opts, "interactive");

      if (_opts.interactive) {
        const prompt = cliCore.helper.runPrompt({
          initialAnswers: { ...currArgs, ...currOpts },
        });

        // TODO 还可以补充更多的类型
        // InputQuestion,
        //   NumberQuestion,
        //   ConfirmQuestion,
        // ListQuestion,
        //   RawListQuestion,
        // CheckboxQuestion,
        //   PasswordQuestion,
        //   EditorQuestion,

        const isInput = (config: IBaseParams) => !config.optional;

        const isList = (config: IBaseParams) =>
          !config.optional && Array.isArray(config.choices);

        const isCheckbox = (config: IBaseParams) =>
          !config.optional && Array.isArray(config.choices) && config.multiple;

        Object.keys(this.baseConfig.arguments).forEach((key) => {
          const item = this.baseConfig.arguments[key];

          if (isCheckbox(item)) {
            prompt.addCheckbox({
              name: key,
              message: item.description,
              choices: item.choices!,
            });
          } else if (isList(item)) {
            prompt.addList({
              name: key,
              message: item.description,
              choices: item.choices!,
            });
          } else if (isInput(item)) {
            prompt.addInput({
              name: key,
              message: item.description,
            });
          }
        });

        Object.keys(this.baseConfig.options).forEach((key) => {
          const item = this.baseConfig.options[key];

          if (isCheckbox(item)) {
            prompt.addCheckbox({
              name: key,
              message: item.description,
              choices: item.choices!,
            });
          } else if (isList(item)) {
            prompt.addList({
              name: key,
              message: item.description,
              choices: item.choices!,
            });
          } else if (isInput(item)) {
            prompt.addInput({
              name: key,
              message: item.description,
            });
          }
        });

        prompt.execute((answers) => {
          this.baseConfig.action({
            data: answers,
            context: {
              ...cliCore.baseConfig.context(),
              ...this.baseConfig.context(),
            },
            helper: { ...cliCore.helper, ...this.baseConfig.helper },
            logger: cliCore.helper.logger,
            instance,
          });
        });
      } else {
        this.baseConfig.action({
          data: { ...currArgs, ...currOpts },
          context: {
            ...cliCore.baseConfig.context(),
            ...this.baseConfig.context(),
          },
          helper: { ...cliCore.helper, ...this.baseConfig.helper },
          logger: cliCore.helper.logger,
          instance,
        });
      }
    });

    this.baseConfig.commands.forEach((command) =>
      childProgram.addCommand(command.registerCommand(cliCore)),
    );

    return childProgram;
  }
}
