import { CronJob } from "cron";
import type { Logger } from "winston";
import type { CronJobParameters } from "cron";

const createRunCron = (logger: Logger) => (options: CronJobParameters) =>
  new CronJob(options);

export default createRunCron;
