import {
  CliCore,
  CliCommand,
  createCron,
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

  it("createCron 可用", () => {
    expect(createCron).toBeDefined();
  });

  it("createPrompt 可用", () => {
    expect(createPrompt).toBeDefined();
  });

  it("createTask 可用", () => {
    expect(createTask).toBeDefined();
  });
});
