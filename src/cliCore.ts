import { createCommand, createOption } from "commander";
import CliCommand from "./cliCommand";

import createPrompt from "./shared/createPrompt";
import createLogger from "./utils/createLogger";

import * as utils from "./utils";

import type { IBaseParams } from "./cliCommand";
import type { Command } from "commander";
import type { CreateLoggerConfig } from "./utils/createLogger";

interface CliCoreConfig {
  name: string;
  version: string;
  description?: string;
  commands?: CliCommand[];
  config?: { interactive?: boolean };
  loggerConfig?: Partial<CreateLoggerConfig>;
}

export default class CliCore {
  public program: Command;
  public baseConfig: Required<Omit<CliCoreConfig, "loggerConfig">>;
  public logger: ReturnType<typeof createLogger>;

  constructor(config: CliCoreConfig) {
    this.baseConfig = this.normalizeConfig(config);

    this.logger = createLogger({
      base: process.env.HOME!,
      appName: this.baseConfig.name,
      datePattern: "YYYY-MM-DD",
      logName: "%DATE%.log",
      maxSize: "20m",
      maxFiles: "14d",
      logLevel: "warn",
      outputLevel: "info",
      ...(config.loggerConfig || {}),
    });

    this.program = this.createProgram();

    const option = this.createInteractive();
    const action = this.createAction();

    this.program.addOption(option);
    this.program.action(action);

    this.registerCliCommand();
  }

  private normalizeConfig(config: CliCoreConfig) {
    return {
      name: config.name,
      version: config.version,
      description: config.description || config.name,
      commands: config.commands || [],
      config: { interactive: false, ...(config.config || {}) },
    };
  }

  private createProgram() {
    return createCommand(this.baseConfig.name)
      .version(this.baseConfig.version)
      .description(this.baseConfig.description);
  }

  private createInteractive() {
    return createOption("-i, --interactive", "使用交互式命令行运行").default(
      this.baseConfig.config.interactive,
      String(this.baseConfig.config.interactive),
    );
  }

  private createAction() {
    return (...args: any[]) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts: { interactive: boolean } = args[args.length - 2];

      if (_opts.interactive) {
        const createCliCorePrompt = (commands: CliCommand[]) => {
          createPrompt({ prefix: this.baseConfig.name })<{
            command: CliCommand;
          }>()
            .addRawList({
              name: "command",
              message: "please select the next command",
              choices: commands.map((command) => ({
                name: command.baseConfig.command,
                value: command,
              })),
            })
            .execute((answers) => {
              const command = answers.command;

              if (utils.haveLenArray(command.baseConfig.commands)) {
                createCliCorePrompt(command.baseConfig.commands);
              } else {
                const prompt = createPrompt({
                  prefix: this.baseConfig.name,
                })();

                const defaultAnswers: Record<string, any> = {};

                const createItem = (name: string, item: IBaseParams) => {
                  const setDefault = (d: any) =>
                    item.default
                      ? Array.isArray(item.default)
                        ? (item.default[0] as any)
                        : (item.default as any)
                      : d;

                  if (utils.isCheckbox(item)) {
                    prompt.addCheckbox({
                      name,
                      message: item.description,
                      choices: item.choices!,
                      default: setDefault([]),
                    });
                  } else if (utils.isList(item)) {
                    prompt.addList({
                      name,
                      message: item.description,
                      choices: item.choices!,
                      default: setDefault(undefined),
                    });
                  } else if (utils.isInput(item)) {
                    prompt.addInput({
                      name,
                      message: item.description,
                      default: setDefault(undefined),
                    });
                  } else {
                    defaultAnswers[name] = setDefault(undefined);
                  }
                };

                Object.keys(command.baseConfig.arguments).forEach((name) =>
                  createItem(name, command.baseConfig.arguments[name]),
                );

                Object.keys(command.baseConfig.options).forEach((name) =>
                  createItem(name, command.baseConfig.options[name]),
                );

                prompt.execute((answers) => {
                  command.baseConfig.action({
                    data: { ...defaultAnswers, ...answers },
                    logger: this.logger,
                  });
                });
              }
            });
        };

        createCliCorePrompt(this.baseConfig.commands);
      } else {
        this.program.outputHelp();
      }
    };
  }

  private registerCliCommand() {
    this.baseConfig.commands.forEach((command) =>
      this.program.addCommand(command.registerCommand(this)),
    );
  }

  public execute() {
    this.program.parse();
  }
}
