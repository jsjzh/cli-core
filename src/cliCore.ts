import { createCommand, createOption } from "commander";
import CliCommand, { IBaseParams } from "./cliCommand";
import {
  createLogger,
  createPrompt,
  createRunCmd,
  createRunCron,
  createRunTask,
  utils,
} from "./shared";

import type { Command } from "commander";
import { haveLenArray } from "./shared/utils";

interface CliCoreConfig {
  name: string;
  version: string;
  description: string;
  commands?: CliCommand[];
  helper?: Record<string, any>;
  configs?: { interactive?: boolean };
}

export default class CliCore {
  public program: Command;
  public baseConfig: Required<CliCoreConfig>;
  public helper: {
    logger: ReturnType<typeof createLogger>;
    runPrompt: ReturnType<typeof createPrompt>;
    runCmd: ReturnType<typeof createRunCmd>;
    runCron: ReturnType<typeof createRunCron>;
    runTask: ReturnType<typeof createRunTask>;
  } & Record<string, any>;

  constructor(config: CliCoreConfig) {
    this.baseConfig = this.normalizeConfig(config);

    this.program = this.createProgram();

    const logger = createLogger({ appName: this.baseConfig.name });

    this.helper = {
      ...this.baseConfig.helper,
      logger,
      runPrompt: createPrompt({ prefix: this.baseConfig.name }),
      runCmd: createRunCmd(logger),
      runCron: createRunCron(logger),
      runTask: createRunTask(logger),
    };

    const option = this.createInteractive();
    const action = this.createAction();

    this.program.addOption(option);
    this.program.action(action);

    this.registerCliCommand();
  }

  private createProgram() {
    return createCommand(this.baseConfig.name)
      .version(this.baseConfig.version)
      .description(this.baseConfig.description);
  }

  private normalizeConfig(config: CliCoreConfig): Required<CliCoreConfig> {
    return {
      name: config.name,
      version: config.version,
      description: config.description,
      commands: config.commands || [],
      helper: config.helper || {},
      configs: { interactive: false, ...(config.configs || {}) },
    };
  }

  private createInteractive() {
    return createOption("-i, --interactive", "??????????????????").default(
      this.baseConfig.configs.interactive,
      String(this.baseConfig.configs.interactive),
    );
  }

  private createAction() {
    return (...args: any[]) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts: { interactive: boolean } = args[args.length - 2];

      if (_opts.interactive) {
        const createPrompt = (commands: CliCommand[]) => {
          const prompt = this.helper.runPrompt();

          prompt.addRawList({
            name: "command",
            message: "please select the next command",
            choices: commands.map((command) => ({
              name: command.baseConfig.command,
              value: command,
            })),
          });

          prompt.execute((answers) => {
            const command = answers["command"];

            if (haveLenArray(command.baseConfig.commands)) {
              createPrompt(command.baseConfig.commands);
            } else {
              const prompt = this.helper.runPrompt();

              const defaultAnswers: Record<string, any> = {};

              const createItem = (key: string, item: IBaseParams) => {
                const setDefault = (d: any) =>
                  item.default
                    ? Array.isArray(item.default)
                      ? (item.default[0] as any)
                      : (item.default as any)
                    : d;

                if (utils.isCheckbox(item)) {
                  prompt.addCheckbox({
                    name: key,
                    message: item.description,
                    choices: item.choices!,
                    default: setDefault([]),
                  });
                } else if (utils.isList(item)) {
                  prompt.addList({
                    name: key,
                    message: item.description,
                    choices: item.choices!,
                    default: setDefault(""),
                  });
                } else if (utils.isInput(item)) {
                  prompt.addInput({
                    name: key,
                    message: item.description,
                    default: setDefault(""),
                  });
                  // optional: true
                } else {
                  defaultAnswers[key] = setDefault("");
                }
              };

              Object.keys(command.baseConfig.arguments).forEach((key) =>
                createItem(key, command.baseConfig.arguments[key]),
              );

              Object.keys(command.baseConfig.options).forEach((key) =>
                createItem(key, command.baseConfig.options[key]),
              );

              prompt.execute((answers) => {
                command.baseConfig.action({
                  data: { ...defaultAnswers, ...answers },
                  helper: { ...this.helper, ...command.baseConfig.helper },
                  logger: this.helper.logger,
                });
              });
            }
          });
        };

        createPrompt(this.baseConfig.commands);
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
