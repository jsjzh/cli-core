import CronJob, { createCronJob } from "@/shared/cronJob";
import Prompt, { createPrompt } from "@/shared/prompt";
import Task, { createTask } from "@/shared/task";

const sum = (a: number, b: number) => a + b;

describe("cron", () => {
  test("cron", () => {
    expect(
      createCronJob({
        cronTime: "* * * * * *",
        onTick() {
          test("run task", () => {
            expect(sum(1, 2)).toBe(3);
          });
        },
      }),
    ).toBeInstanceOf(CronJob);
  });
});

describe("prompt", () => {
  test("prompt", () => {
    expect(createPrompt()).toBeInstanceOf(Prompt);

    const prompt = createPrompt({
      prefix: "demo ",
      suffix: " test",
      initialAnswers: {
        checkbox: "value",
      },
    });

    expect(
      prompt.addCheckbox({ name: "checkbox", choices: [] }),
    ).toBeInstanceOf(Prompt);

    expect(prompt.addInput({ name: "addInput" })).toBeInstanceOf(Prompt);

    expect(prompt.addNumber({ name: "addNumber" })).toBeInstanceOf(Prompt);

    expect(prompt.addConfirm({ name: "addConfirm" })).toBeInstanceOf(Prompt);

    expect(
      prompt.addList({ name: "addList", choices: ["foo"] }),
    ).toBeInstanceOf(Prompt);

    expect(
      prompt.addRawList({
        name: "addRawList",
        choices: [{ key: "foo", value: { age: 18 }, label: "foo label" }],
      }),
    ).toBeInstanceOf(Prompt);

    expect(
      prompt.addCheckbox({
        name: "addCheckbox",
        choices: [{ key: "foo", value: { age: 18 }, label: "foo label" }],
      }),
    ).toBeInstanceOf(Prompt);

    expect(prompt.addPassword({ name: "addPassword" })).toBeInstanceOf(Prompt);

    expect(prompt.addEditor({ name: "addEditor" })).toBeInstanceOf(Prompt);

    test.todo("验证命令行输入值", () => {
      prompt.execute();
    });
  });
});

describe("task", () => {
  test("task", async () => {
    expect(createTask()).toBeInstanceOf(Task);

    await expect(
      createTask({ showLog: false })
        .add({
          title: "demo 1",
          task() {
            test("run task", () => {
              expect(sum(1, 2)).toBe(3);
            });
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
              test("run task", () => {
                expect(sum(1, 2)).toBe(3);
              });
            },
          },
          {
            title: "demo 2",
            task() {
              test("run task", () => {
                expect(sum(1, 2)).toBe(3);
              });
            },
          },
        ])
        .execute(),
    ).resolves.toBeUndefined();
  });
});
