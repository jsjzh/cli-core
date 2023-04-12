import CronJob, { createCronJob } from "@/shared/cronJob";
import Prompt, { createPrompt } from "@/shared/prompt";
import Task, { createTask } from "@/shared/task";

describe("cron", () => {
  it("cron", () => {
    expect(
      createCronJob({
        cronTime: "* * * * * *",
        onTick() {
          console.log("hello world");
        },
      }),
    ).toBeInstanceOf(CronJob);
  });
});

describe("prompt", () => {
  it("prompt", () => {
    expect(createPrompt()).toBeInstanceOf(Prompt);
  });
});

describe("task", () => {
  it("task", () => {
    expect(createTask()).toBeInstanceOf(Task);
  });
});
