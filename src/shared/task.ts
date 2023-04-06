interface TaskItem {
  title: string;
  task: () => Promise<any>;
}

interface TaskConfig {
  showLog?: boolean;
}

export default class Task {
  tasks: TaskItem[];
  config: TaskConfig;

  constructor(config?: TaskConfig) {
    this.tasks = [];
    this.config = { showLog: config?.showLog ?? true };
  }

  add(taskItem: TaskItem | TaskItem[]) {
    Array.isArray(taskItem)
      ? (this.tasks = this.tasks.concat(taskItem))
      : this.tasks.push(taskItem);
    return this;
  }

  async execute() {
    for (const item of this.tasks) {
      this.config.showLog && console.log(`${item.title} START`);
      await item.task();
      this.config.showLog && console.log(`${item.title} DONE`);
    }
  }
}

export const createTask = (option: TaskConfig) => new Task(option);
