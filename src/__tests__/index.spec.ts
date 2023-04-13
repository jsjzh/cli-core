import { describe, test, expect } from "vitest";

import {
  CliCore,
  CliCommand,
  createCronJob,
  createPrompt,
  createTask,
} from "@/index";

describe("@oishi/cli-core", () => {
  test("CliCore 可用", () => {
    expect(CliCore).toBeDefined();
  });

  test("CliCommand 可用", () => {
    expect(CliCommand).toBeDefined();
  });

  test("createCronJob 可用", () => {
    expect(createCronJob).toBeDefined();
  });

  test("createPrompt 可用", () => {
    expect(createPrompt).toBeDefined();
  });

  test("createTask 可用", () => {
    expect(createTask).toBeDefined();
  });
});
