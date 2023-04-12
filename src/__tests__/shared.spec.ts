import CronJob, { createCronJob } from "@/shared/cronJob";
import Prompt, { createPrompt } from "@/shared/prompt";
import Task, { createTask } from "@/shared/task";

describe("cron", () => {
  test("cron", () => {
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
  test("prompt", () => {
    expect(createPrompt()).toBeInstanceOf(Prompt);
  });
});

describe("task", () => {
  test("task", async () => {
    expect(createTask({ showLog: false })).toBeInstanceOf(Task);

    await expect(
      createTask()
        .add({
          title: "demo",
          task() {
            console.log("hello world");
          },
        })
        .execute(),
    ).resolves.toBeUndefined();

    await expect(
      createTask()
        .add([
          {
            title: "demo 1",
            task() {
              console.log("hello world");
            },
          },
          {
            title: "demo 2",
            task() {
              console.log("hello world");
            },
          },
        ])
        .execute(),
    ).resolves.toBeUndefined();
  });
});
