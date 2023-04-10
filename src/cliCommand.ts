import { createCommand, createArgument, createOption } from "commander";
import { cloneDeep } from "lodash-es";

import type CliCore from "./cliCore";
import type { Command } from "commander";
import type createLogger from "./util/createLogger";
import type createRunCmd from "./util/createRunCmd";

const formatChoices = (choices: CliCommandChoices) => {
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

interface ChoiceItem {
  key: string;
  value: any;
  label?: string;
}

type Choices = (string | ChoiceItem)[];

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
  command: string;
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
  command: string;
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
    this.childProgram = createCommand(this.baseConfig.command).description(
      this.baseConfig.description,
    );
  }

  private normalizeConfig(
    config: CliCommandConfig<IArgs, IOpts>,
  ): InnerCliCommandConfig<IArgs, IOpts> {
    const _config = cloneDeep(config);

    if (_config.arguments) {
      Object.keys(_config.arguments).forEach((key) => {
        if (!_config.arguments![key].description) {
          _config.arguments![key].description = key;
        }

        if (typeof _config.arguments![key].default === "string") {
          _config.arguments![key].default = [
            _config.arguments![key].default as string,
          ];
        }

        if (_config.arguments![key].choices) {
          _config.arguments![key].choices = formatChoices(
            _config.arguments![key].choices!,
          );
        }

        _config.arguments![key].multiple = !!_config.arguments![key].multiple;
        _config.arguments![key].optional = !!_config.arguments![key].optional;
      });
    }

    if (_config.options) {
      Object.keys(_config.options).forEach((key) => {
        if (!_config.options![key].description) {
          _config.options![key].description = key;
        }

        if (typeof _config.options![key].default === "string") {
          _config.options![key].default = [
            _config.options![key].default as string,
          ];
        }

        if (_config.options![key].choices) {
          _config.options![key].choices = formatChoices(
            _config.options![key].choices!,
          );
        }

        _config.options![key].multiple = !!_config.options![key].multiple;
        _config.options![key].optional = !!_config.options![key].optional;
      });
    }

    return {
      command: _config.command,
      description: _config.description ?? _config.command,
      arguments: (_config.arguments ?? {}) as Record<string, InnerArguments>,
      options: (_config.options ?? {}) as Record<string, InnerOptions>,
      commands: _config.commands ?? [],
      action: _config.action ?? (() => {}),
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

  // TODO 这里要把 default 值加上去
  // 然后也要把 value 给加上，不管是简单类型还是复杂类型的 value
  // 然后如果是多选的类型，要多个值
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
