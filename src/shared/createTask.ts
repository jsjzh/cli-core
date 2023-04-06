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

  constructor(logger: Logger, config?: RunTaskConfig) {
    this.tasks = [];
    this.logger = logger;

    this.config = {
      hasTip: false,
      ...config,
    };
  }

  add(taskItem: TaskItem | TaskItem[]) {
    Array.isArray(taskItem)
      ? (this.tasks = this.tasks.concat(taskItem))
      : this.tasks.push(taskItem);
    return this;
  }

  async run() {
    for (const item of this.tasks) await this._runTask(item);
  }

  async _runTask(taskItem: TaskItem) {
    this.config.hasTip && this.logger.info(`${taskItem.title} START`);
    await taskItem.task();
    this.config.hasTip && this.logger.info(`${taskItem.title} DONE`);
  }
}

const createRunTask = (logger: Logger) => (option: RunTaskConfig) =>
  new RunTask(logger, option);

export default createRunTask;
