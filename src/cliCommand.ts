import { createCommand, createArgument, createOption } from "commander";

import type CliCore from "./cliCore";
import type { Command } from "commander";
import type createLogger from "./util/createLogger";
import type createRunCmd from "./util/createRunCmd";

export const formatChoices = (choices: CliCommandChoices) => {
  let _choices: Choices;

  if (typeof choices === "function") {
    _choices = choices();
  } else {
    _choices = choices;
  }

  _choices.forEach((item, key) => {
    if (typeof item === "string") {
      _choices[key] = { key: String(item), label: String(item), value: item };
    } else {
      if (!item.label) {
        item.label = item.key;
      }
    }
  });

  return _choices as InnerChoiceItem[];
};

// prompt 里面的 choices 也统一成这样的格式，在 prompt 中做转换
// 所以这里给 export 出去
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
  // 必选
  // cli cmd <message> xxx
  // 可选
  // cli cmd [message] xxx
  // 多参数
  // cli cmd [message...] xxx xxx
  arguments?: Record<string, Arguments<CliCommandChoices>>;
  // 必选
  // cli cmd <base> xxx
  // 可选
  // cli cmd [base] xxx
  // 多参数
  // cli cmd [base...] xxx xxx
  // 布尔
  // cli cmd <base>
  // 短名
  // cli cmd <b> xxx
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

  constructor(config: CliCommandConfig<IArgs, IOpts>) {
    this.baseConfig = this.normalizeConfig(config);
    this.childProgram = createCommand(this.baseConfig.name).description(
      this.baseConfig.description,
    );
  }

  private normalizeConfig(
    config: CliCommandConfig<IArgs, IOpts>,
  ): InnerCliCommandConfig<IArgs, IOpts> {
    if (config.arguments) {
      Object.keys(config.arguments).forEach((key) => {
        if (!config.arguments![key].description) {
          config.arguments![key].description = key;
        }

        if (!config.arguments![key].default) {
          config.arguments![key].default = [];
        } else if (typeof config.arguments![key].default === "string") {
          config.arguments![key].default = [
            config.arguments![key].default as string,
          ];
        }

        if (config.arguments![key].choices) {
          config.arguments![key].choices = formatChoices(
            config.arguments![key].choices!,
          );
        }

        config.arguments![key].multiple = !!config.arguments![key].multiple;
        config.arguments![key].optional = !!config.arguments![key].optional;
      });
    }

    if (config.options) {
      Object.keys(config.options).forEach((key) => {
        if (!config.options![key].description) {
          config.options![key].description = key;
        }

        if (!config.options![key].default) {
          config.options![key].default = [];
        } else if (typeof config.options![key].default === "string") {
          config.options![key].default = [
            config.options![key].default as string,
          ];
        }

        if (config.options![key].choices) {
          config.options![key].choices = formatChoices(
            config.options![key].choices!,
          );
        }

        config.options![key].multiple = !!config.options![key].multiple;
        config.options![key].optional = !!config.options![key].optional;
      });
    }

    return {
      name: config.name,
      description: config.description ?? config.name,
      arguments: (config.arguments ?? {}) as Record<string, InnerArguments>,
      options: (config.options ?? {}) as Record<string, InnerOptions>,
      commands: config.commands ?? [],
      action: config.action ?? (() => {}),
    };
  }

  private createArguments() {
    return Object.keys(this.baseConfig.arguments).map((key) => {
      const item = this.baseConfig.arguments[key];

      const name = item.multiple ? `${key}...` : key;
      const cmd = item.optional ? `[${name}]` : `<${name}>`;

      const argument = createArgument(cmd, item.description);

      argument.choices(item.choices.map((choice) => choice.key));

      const currentDefault = item.default.join(", ");
      argument.default(currentDefault, currentDefault);

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

      option.choices(item.choices.map((choice) => choice.key));

      const currentDefault = item.default.join(", ");
      option.default(currentDefault, currentDefault);

      return option;
    });
  }

  // TODO 待验证 default multiple optional
  private createAction(cliCore: CliCore) {
    return (...args: any[]) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts = args[args.length - 2];

      const currArgs = Object.keys(this.baseConfig.arguments).reduce(
        (pre, curr, index) => ({ [curr]: _args[index], ...pre }),
        {} as Record<string, any>,
      );

      Object.keys(currArgs).forEach((key) => {
        if (!currArgs[key] && this.baseConfig.arguments[key].default) {
          currArgs[key] = this.baseConfig.arguments[key].default;
        }

        if (!this.baseConfig.arguments[key].multiple) {
          currArgs[key] = [currArgs[key]];
        }

        currArgs[key].forEach((valueKey: string) => {
          currArgs[key] =
            this.baseConfig.arguments[key].choices!.find(
              (choice) => choice.key === valueKey,
            )?.value ?? currArgs[key][valueKey];
        });
      });

      const currOpts = _opts;

      Object.keys(currOpts).forEach((key) => {
        if (!currOpts[key] && this.baseConfig.options[key].default) {
          currOpts[key] = this.baseConfig.options[key].default;
        }

        if (!this.baseConfig.options[key].multiple) {
          currOpts[key] = [currOpts[key]];
        }

        currOpts[key].forEach((valueKey: string) => {
          currOpts[key] =
            this.baseConfig.options[key].choices!.find(
              (choice) => choice.key === valueKey,
            )?.value ?? currOpts[key][valueKey];
        });
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
