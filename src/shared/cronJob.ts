import { CronJob } from "cron";

import type { CronJobParameters } from "cron";

export default CronJob;

export const createCronJob = (options: CronJobParameters) => new CronJob(options);
