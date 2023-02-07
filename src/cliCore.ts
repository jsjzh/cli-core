import { createCommand, createOption } from "commander";
import CliCommand from "./cliCommand";
import {
  createLogger,
  createPrompt,
  createRunCmd,
  createRunCron,
  createRunTask,
  utils,
} from "./shared";

import type { Command } from "commander";

interface CliCoreConfig {
  name: string;
  version: string;
  description: string;
  commands?: CliCommand[];
  context?: () => { [k: string]: any };
  helper?: { [k: string]: any };
  // configs: { [k: string]: any };
}

export default class CliCore {
  program: Command;
  baseConfig: Required<CliCoreConfig>;
  helper: {
    logger: ReturnType<typeof createLogger>;
    runPrompt: ReturnType<typeof createPrompt>;
    runCmd: ReturnType<typeof createRunCmd>;
    runCron: ReturnType<typeof createRunCron>;
    runTask: ReturnType<typeof createRunTask>;
    [k: string]: any;
  };

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
      context: config.context || (() => ({})),
      helper: config.helper || {},
    };
  }

  private createInteractive() {
    return createOption("-i, --interactive", "开启交互式命令行").default(
      false,
      "不开启",
    );
  }

  private createAction() {
    return (...args: any[]) => {
      // const instance: Command = args[args.length - 1];
      // const _args = args.slice(0, args.length - 2);
      const _opts: { interactive: boolean } = args[args.length - 2];

      if (_opts.interactive) {
        const path: string[] = [];

        const createPrompt = (commands: CliCommand[]) => {
          const prompt = this.helper.runPrompt();

          prompt.addRawList({
            name: "command",
            message: "请选择下一个路径",
            choices: commands.map((command) => command.baseConfig.command),
          });

          prompt.execute((answers) => {
            const name = answers["command"];
            path.push(name);
            const command = commands.find(
              (command) => command.baseConfig.command === name,
            );

            if (
              command &&
              Array.isArray(command.baseConfig.commands) &&
              command.baseConfig.commands.length
            ) {
              createPrompt(command.baseConfig.commands);
            } else if (command) {
              const prompt = this.helper.runPrompt();

              Object.keys(command.baseConfig.arguments).forEach((key) => {
                const item = command.baseConfig.arguments[key];

                if (utils.isCheckbox(item)) {
                  prompt.addCheckbox({
                    name: key,
                    message: item.description,
                    choices: item.choices!,
                  });
                } else if (utils.isList(item)) {
                  prompt.addList({
                    name: key,
                    message: item.description,
                    choices: item.choices!,
                  });
                } else if (utils.isInput(item)) {
                  prompt.addInput({
                    name: key,
                    message: item.description,
                  });
                }
              });

              Object.keys(command.baseConfig.options).forEach((key) => {
                const item = command.baseConfig.options[key];

                if (utils.isCheckbox(item)) {
                  prompt.addCheckbox({
                    name: key,
                    message: item.description,
                    choices: item.choices!,
                  });
                } else if (utils.isList(item)) {
                  prompt.addList({
                    name: key,
                    message: item.description,
                    choices: item.choices!,
                  });
                } else if (utils.isInput(item)) {
                  prompt.addInput({
                    name: key,
                    message: item.description,
                  });
                }
              });

              prompt.execute((answers) => {
                command.baseConfig.action({
                  data: answers,
                  context: {
                    ...this.baseConfig.context(),
                    ...command.baseConfig.context(),
                  },
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
