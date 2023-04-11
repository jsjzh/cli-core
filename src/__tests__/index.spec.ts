import * as Cli from "..";

describe("CliCore", () => {
  test("exports modules should be defined", () => {
    Object.keys(Cli).forEach((module) => {
      expect((Cli as any)[module]).toBeDefined();
    });
  });
});
