import {
  CliCore,
  CliCommand,
  createCronJob,
  createPrompt,
  createTask,
} from "@/index";

describe("@oishi/cli-core", () => {
  it("CliCore 可用", () => {
    expect(CliCore).toBeDefined();
  });

  it("CliCommand 可用", () => {
    expect(CliCommand).toBeDefined();
  });

  it("createCronJob 可用", () => {
    expect(createCronJob).toBeDefined();
  });

  it("createPrompt 可用", () => {
    expect(createPrompt).toBeDefined();
  });

  it("createTask 可用", () => {
    expect(createTask).toBeDefined();
  });
});
