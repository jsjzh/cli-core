interface TaskItem {
  title: string;
  task: () => void | Promise<any>;
}

interface TaskConfig {
  showLog?: boolean;
}

export default class Task {
  private tasks: TaskItem[];
  private config: TaskConfig;

  constructor(config?: TaskConfig) {
    this.tasks = [];
    this.config = { showLog: config?.showLog ?? true };
  }

  public add(taskItem: TaskItem | TaskItem[]) {
    Array.isArray(taskItem)
      ? (this.tasks = this.tasks.concat(taskItem))
      : this.tasks.push(taskItem);
    return this;
  }

  public async execute() {
    for (const item of this.tasks) {
      this.config.showLog && console.log(`${item.title} START`);
      await item.task();
      this.config.showLog && console.log(`${item.title} DONE`);
    }
  }
}

export const createTask = (option?: TaskConfig) => new Task(option);
