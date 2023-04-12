import { describe, it, expect } from "vitest";
import * as Cli from "..";

describe("CliCore", () => {
  it("exports modules should be defined", () => {
    Object.keys(Cli).forEach((module) => {
      expect((Cli as any)[module]).toBeDefined();
    });
  });
});
