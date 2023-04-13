import { describe, test, expect } from "vitest";

import winston from "winston";
import createLogger from "@/util/createLogger";
import createRunCmd from "@/util/createRunCmd";

describe("createLogger", () => {
  test.todo("createLogger", () => {
    expect(createLogger({ appName: "cli" })).toBeInstanceOf(winston.Logger);
  });
});

describe("createRunCmd", () => {
  test("createRunCmd", () => {
    const runCmd = createRunCmd(createLogger({ appName: "cli" }));
    const run = runCmd();
    expect(run("echo hello", "pipe", false)).toBe("hello\n");
    expect(() => run("error", "pipe")).toThrowError();
  });
});
