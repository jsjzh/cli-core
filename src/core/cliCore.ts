import { createCommand, createOption } from "commander";
import CliCommand from "@/core/cliCommand";

import { createPrompt } from "@/shared/prompt";

import createLogger from "@/util/createLogger";
import createRunCmd from "@/util/createRunCmd";

import type { Command } from "commander";
import type { CreateLoggerConfig } from "@/util/createLogger";

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
      ...(config.loggerConfig ?? {}),
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
      description: config.description ?? config.name,
      commands: config.commands ?? [],
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
              description: "please select the next command",
              choices: commands.map((command) => ({
                key: command.baseConfig.name,
                value: command,
              })),
            })
            .execute((answers) => {
              const command = answers.command;

              if (
                Array.isArray(command.baseConfig.commands) &&
                command.baseConfig.commands.length
              ) {
                createCliCorePrompt(command.baseConfig.commands);
              } else {
                const prompt = createPrompt({
                  prefix: this.baseConfig.name,
                });

                const _mergeParams = {
                  ...command.baseConfig.arguments,
                  ...command.baseConfig.options,
                };

                Object.keys(_mergeParams).forEach((name) => {
                  // 只有参数为必选的时候，才会被 prompt 所接收
                  if (!_mergeParams[name].optional) {
                    if (
                      _mergeParams[name].choices &&
                      _mergeParams[name].multiple
                    ) {
                      prompt.addCheckbox({
                        name,
                        description: _mergeParams[name].description,
                        choices: _mergeParams[name].choices,
                        default: _mergeParams[name].default,
                      });
                    } else if (Array.isArray(_mergeParams[name].choices)) {
                      prompt.addList({
                        name,
                        description: _mergeParams[name].description,
                        choices: _mergeParams[name].choices,
                        default: _mergeParams[name].default[0],
                      });
                    } else {
                      prompt.addInput({
                        name,
                        description: _mergeParams[name].description,
                        default: _mergeParams[name].default[0],
                      });
                    }
                  }
                });

                prompt.execute((answers) => {
                  command.baseConfig.action({
                    data: answers,
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
