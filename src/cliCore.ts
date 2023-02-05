import { createCommand } from "commander";
import CliCommand from "./cliCommand";
import {
  createLogger,
  createPrompt,
  createRunCmd,
  createRunCron,
  createRunTask,
} from "./shared";
import type { Command } from "commander";

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

    this.program = createCommand(this.baseConfig.name)
      .version(this.baseConfig.version)
      .description(this.baseConfig.description);

    const logger = createLogger({ appName: this.baseConfig.name });

    this.helper = {
      logger,
      runPrompt: createPrompt({ prefix: this.baseConfig.name }),
      runCmd: createRunCmd(logger),
      runCron: createRunCron(logger),
      runTask: createRunTask(logger),
      ...this.baseConfig.helper,
    };

    this.createHelper();
    this.registerCliCommand();
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

  createHelper() {}

  registerCliCommand() {
    this.baseConfig.commands.forEach((command) =>
      this.program.addCommand(command.registerCommand(this)),
    );
  }

  execute() {
    this.program.parse();
  }
}
