import { CronJob } from "cron";

import type { CronJobParameters } from "cron";

export default CronJob;

export const createCron = (options: CronJobParameters) => new CronJob(options);
