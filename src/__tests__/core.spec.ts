import { describe, test, expect } from "vitest";

import CliCore from "@/core/cliCore";
import CliCommand from "@/core/cliCommand";

describe.todo("CliCore", () => {
  test("CliCore", () => {
    const cli = new CliCore({
      name: "cli",
      description: "cli tools",
      version: "0.0.1",
      config: { interactive: true },
      loggerConfig: { appName: "cli logger" },
    });

    const run = cli.runCmd();
    expect(run("echo hello", "pipe", false)).toBe("hello\n");
    expect(() => run("error", "pipe")).toThrowError();
    cli.execute();
  });
});

describe.todo("cliCommand", () => {
  test("cliCommand", () => {
    const cliCommandChild = new CliCommand<{
      foo: string;
      bar: string;
      names: { age: number } | string;
      dev: string;
    }>({
      name: "cliCommandChild",
      description: "cliCommandChild desc",
      arguments: {
        bar: {
          choices: ["foo", "bar"],
          default: "foo",
        },
        foo: {
          choices: ["foo", "bar"],
          multiple: true,
        },
      },
      options: {
        names: {
          alias: "n",
          choices: () => [
            "bar",
            { key: "foo", value: { age: 18 }, label: "foo label" },
          ],
          default: "foo",
          optional: true,
        },
        dev: {
          description: "输入 push 的内容",
        },
      },
      action(props) {
        expect(props.data.foo).toBe(["foo", "bar"]);
        expect(props.data.names).toBe({ age: 18 });
      },
    });

    const cliCommand = new CliCommand({
      name: "cliCommand",
      description: "cliCommand desc",
      commands: [cliCommandChild],
    });

    const cli = new CliCore({
      name: "cli",
      description: "cli tools",
      version: "0.0.1",
      commands: [cliCommand],
      config: { interactive: true },
      loggerConfig: { appName: "cli logger" },
    });

    cli.execute();
  });
});
