import { createCommand, createOption } from "commander";
import CliCommand, { Choice } from "./cliCommand";

import { createPrompt } from "./shared/prompt";

import * as utils from "./util";
import createLogger from "./util/createLogger";
import createRunCmd from "./util/createRunCmd";

import type { BaseParams } from "./cliCommand";
import type { Command } from "commander";
import type { CreateLoggerConfig } from "./util/createLogger";

interface CliCoreConfig {
  /**
   * 应用名
   */
  name: string;
  /**
   * 应用版本号
   */
  version: string;
  /**
   * 应用描述，默认取应用名
   */
  description?: string;
  commands?: CliCommand[];
  config?: {
    /**
     * 是否默认使用命令行模式，默认为 false
     */
    interactive?: boolean;
  };
  loggerConfig?: CreateLoggerConfig;
}

export default class CliCore {
  program: Command;
  baseConfig: Required<Omit<CliCoreConfig, "loggerConfig">>;
  logger: ReturnType<typeof createLogger>;
  runCmd: ReturnType<typeof createRunCmd>;

  constructor(config: CliCoreConfig) {
    this.baseConfig = this.normalizeConfig(config);

    this.logger = createLogger({
      appName: this.baseConfig.name,
      ...(config.loggerConfig || {}),
    });

    this.runCmd = createRunCmd(this.logger);

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
      config: { interactive: !!config.config?.interactive },
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
          createPrompt<{
            command: CliCommand;
          }>({ prefix: this.baseConfig.name })
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
                const defaultAnswers: Record<string, any> = {};

                const prompt = createPrompt({
                  prefix: this.baseConfig.name,
                });

                const createItem = (
                  name: string,
                  item: BaseParams<Choice[]>,
                ) => {
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
                      choices: item.choices?.map((choice) => ({
                        name: choice.label!,
                        value: choice.key,
                      }))!,
                      default: setDefault([]),
                    });
                  } else if (utils.isList(item)) {
                    prompt.addList({
                      name,
                      message: item.description,
                      choices: item.choices?.map((choice) => ({
                        name: choice.label!,
                        value: choice.key,
                      }))!,
                      default: item.default,
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

                const _mergeParams = {
                  ...command.baseConfig.arguments,
                  ...command.baseConfig.options,
                };

                Object.keys(_mergeParams).forEach((name) => {
                  createItem(name, _mergeParams[name]);
                });

                prompt.execute((answers) => {
                  const _answers = Object.keys(answers).reduce(
                    (pre, curr) => ({
                      ...pre,
                      [curr]:
                        _mergeParams[curr].choices?.find(
                          (choice) => choice.key === answers[curr],
                        )?.value ?? answers[curr],
                    }),
                    answers,
                  );

                  command.baseConfig.action({
                    data: { ...defaultAnswers, ..._answers },
                    logger: this.logger,
                    runCmd: this.runCmd,
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

  execute() {
    this.program.parse();
  }
}
