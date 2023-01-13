declare module "src/shared/logger" {
    import winston from "winston";
    interface ICreateLoggerOption {
        appName: string;
    }
    const createLogger: (option: ICreateLoggerOption) => winston.Logger;
    export default createLogger;
}
declare module "src/shared/runCmd" {
    import type { Logger } from "winston";
    const createRunCmd: (logger: Logger) => (cwd?: string) => (cmd: string, showExecuteCmd?: boolean, showStdio?: boolean) => string;
    export default createRunCmd;
}
declare module "src/shared/runCron" {
    import { CronJob } from "cron";
    import type { Logger } from "winston";
    import type { CronJobParameters } from "cron";
    const createRunCron: (logger: Logger) => (options: CronJobParameters) => CronJob;
    export default createRunCron;
}
declare module "src/shared/runTask" {
    import type { Logger } from "winston";
    interface TaskItem {
        title: string;
        task: (...args: any) => Promise<any>;
    }
    interface RunTaskConfig {
        hasTip?: boolean;
    }
    class RunTask {
        tasks: TaskItem[];
        config: RunTaskConfig;
        logger: Logger;
        constructor(logger: Logger, config?: RunTaskConfig);
        add(taskItem: TaskItem | TaskItem[]): this;
        run(): Promise<void>;
        _runTask(taskItem: TaskItem): Promise<void>;
    }
    const createRunTask: (logger: Logger) => (option: RunTaskConfig) => RunTask;
    export default createRunTask;
}
declare module "src/shared/index" {
    import createLogger from "src/shared/logger";
    import createRunCmd from "src/shared/runCmd";
    import createRunCron from "src/shared/runCron";
    import createRunTask from "src/shared/runTask";
    export { createLogger, createRunCmd, createRunCron, createRunTask };
}
declare module "src/index" {
    import CliCommand from "src/cliCommand";
    import { createLogger, createRunCmd, createRunCron, createRunTask } from "src/shared/index";
    import type { Command } from "commander";
    interface CliConfig {
        name: string;
        version: string;
        description: string;
        commands?: CliCommand[];
        context?: () => {
            [k: keyof any]: any;
        };
        helper?: {
            [k: keyof any]: any;
        };
    }
    export default class Cli {
        program: Command;
        baseConfig: Required<CliConfig>;
        helper: {
            logger: ReturnType<typeof createLogger>;
            runCmd: ReturnType<typeof createRunCmd>;
            runCron: ReturnType<typeof createRunCron>;
            runTask: ReturnType<typeof createRunTask>;
            [k: keyof any]: any;
        };
        constructor(config: CliConfig);
        normalizeConfig(config: CliConfig): Required<CliConfig>;
        createHelper(): void;
        registerCliCommand(): void;
        execute(): void;
    }
}
declare module "src/cliCommand" {
    import { createLogger, createRunCron, createRunCmd, createRunTask } from "src/shared/index";
    import type { Command } from "commander";
    import type Cli from "src/index";
    interface CliCommandConfig {
        command: string;
        description: string;
        arguments?: {
            name: string;
            description: string;
            selects?: string[];
            default?: [any, string];
        }[];
        options?: {
            name: string;
            description: string;
            selects?: string[];
            default?: [any, string];
        }[];
        commands?: CliCommand[];
        context?: () => {
            [k: keyof any]: any;
        };
        helper?: {
            [k: keyof any]: any;
        };
        action?: (props: {
            args: string | number[];
            opts: {
                [k: keyof any]: any;
            };
            context: {
                [k: keyof any]: any;
            };
            logger: ReturnType<typeof createLogger>;
            helper: {
                runCron: ReturnType<typeof createRunCron>;
                runCmd: ReturnType<typeof createRunCmd>;
                runTask: ReturnType<typeof createRunTask>;
                [k: keyof any]: any;
            };
            instance: Command;
        }) => void;
    }
    export default class CliCommand {
        baseConfig: Required<CliCommandConfig>;
        constructor(config: CliCommandConfig);
        normalizeConfig(config: CliCommandConfig): Required<CliCommandConfig>;
        registerCommand(cli: Cli): Command;
    }
}
