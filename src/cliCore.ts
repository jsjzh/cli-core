import { createCommand, createOption } from "commander";
import CliCommand from "./cliCommand";
import {
  createLogger,
  createPrompt,
  createRunCmd,
  createRunCron,
  createRunTask,
} from "./shared";
import type { Command } from "commander";

interface IBaseParams {
  description: string;
  default?: string | [string, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}

interface CliCoreConfig {
  name: string;
  version: string;
  description: string;
  commands?: CliCommand[];
  context?: () => { [k: keyof any]: any };
  helper?: { [k: keyof any]: any };
  // configs: { [k: keyof any]: any };
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
    [k: keyof any]: any;
  };

  constructor(config: CliCoreConfig) {
    this.baseConfig = this.normalizeConfig(config);

    this.program = this.initProgram();

    const logger = createLogger({ appName: this.baseConfig.name });

    this.helper = {
      ...this.baseConfig.helper,
      logger,
      runPrompt: createPrompt({ prefix: this.baseConfig.name }),
      runCmd: createRunCmd(logger),
      runCron: createRunCron(logger),
      runTask: createRunTask(logger),
    };

    this.registerInteractive();
    this.registerAction();
    this.registerCliCommand();
  }

  initProgram() {
    return createCommand(this.baseConfig.name)
      .version(this.baseConfig.version)
      .description(this.baseConfig.description);
  }

  normalizeConfig(config: CliCoreConfig): Required<CliCoreConfig> {
    return {
      name: config.name,
      version: config.version,
      description: config.description,
      commands: config.commands || [],
      context: config.context || (() => ({})),
      helper: config.helper || {},
    };
  }

  registerInteractive() {
    const option = createOption("-i, --interactive", "开启交互式命令行");
    option.default(false, "不开启");
    this.program.addOption(option);
  }

  registerAction() {
    this.program.action((...args) => {
      const instance: Command = args[args.length - 1];
      const _args = args.slice(0, args.length - 2);
      const _opts: { interactive: boolean } = args[args.length - 2];

      if (_opts.interactive) {
        const path: string[] = [];

        const demo = (commands: CliCommand[]) => {
          const prompt = this.helper.runPrompt();

          prompt.addRawList({
            name: "command",
            message: "请选择下一步执行任务",
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
              demo(command.baseConfig.commands);
            } else if (command) {
              const prompt = this.helper.runPrompt();

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
                !config.optional &&
                Array.isArray(config.choices) &&
                config.multiple;

              Object.keys(command.baseConfig.arguments).forEach((key) => {
                const item = command.baseConfig.arguments[key];

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

              Object.keys(command.baseConfig.options).forEach((key) => {
                const item = command.baseConfig.options[key];

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

        demo(this.baseConfig.commands);
      } else {
        this.program.outputHelp();
      }
    });
  }

  registerCliCommand() {
    this.baseConfig.commands.forEach((command) =>
      this.program.addCommand(command.registerCommand(this)),
    );
  }

  execute() {
    this.program.parse();
  }
}
