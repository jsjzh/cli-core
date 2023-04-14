import { CliCore } from "../lib";

import cmd1 from "./command/cmd1";

const demo = new CliCore({
  name: "demo",
  version: "0.0.1",
  commands: [cmd1],
  config: { interactive: true },
});

demo.execute();
