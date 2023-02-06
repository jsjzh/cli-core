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
  alias?: string;
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
  childProgram: Command;
  baseConfig: Required<CliCommandConfig>;

  constructor(config: CliCommandConfig) {
    this.baseConfig = this.normalizeConfig(config);

    this.childProgram = createCommand(this.baseConfig.command);
    this.childProgram.description(this.baseConfig.description);
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

  registerArguments() {
    Object.keys(this.baseConfig.arguments).forEach((key) => {
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

      this.childProgram.addArgument(argument);
    });
  }

  registerOptions() {
    Object.keys(this.baseConfig.options).forEach((key) => {
      const item = this.baseConfig.options[key];
      const name = item.multiple ? `${key}...` : key;
      const cmd = item.optional ? `[${name}]` : `<${name}>`;
      const currentCmd = item.alias
        ? `-${item.alias}, --${key} ${cmd}`
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

      this.childProgram.addOption(option);
    });
  }

  registerInteractive() {
    const option = createOption("-i, --interactive", "开启交互式命令行");
    option.default(false, "不开启");
    this.childProgram.addOption(option);
  }

  registerAction(cliCore: CliCore) {
    this.childProgram.action((...args) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts = args[args.length - 2];

      let currArgs = Object.keys(this.baseConfig.arguments).reduce(
        (pre, curr, index) => ({ [curr]: _args[index], ...pre }),
        {},
      );

      let currOpts = omit(_opts, "interactive");

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
    });
  }

  registerInteractiveAction(cliCore: CliCore) {
    this.childProgram
      .exitOverride((error) => {
        const prompt = cliCore.helper.runPrompt();

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
            instance: this.childProgram,
          });
        });
      })
      .configureOutput({ writeErr: (str) => "" });
  }

  registerCommand(cliCore: CliCore) {
    this.registerArguments();
    this.registerOptions();
    this.registerInteractive();
    this.registerAction(cliCore);
    this.registerInteractiveAction(cliCore);

    this.baseConfig.commands.forEach((command) =>
      this.childProgram.addCommand(command.registerCommand(cliCore)),
    );

    return this.childProgram;
  }
}
