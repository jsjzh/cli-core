const { CliCore, CliCommand } = require("../lib");

const demo = new CliCommand({
  command: "demo",
  description: "测试指令",
  arguments: {
    name: {
      description: "名称",
      choices: () => [
        { name: "foo", value: { age: 18 } },
        { name: "bar", value: { age: 19 } },
      ],
    },
  },
  options: {
    names: {
      description: "名称",
      choices: () => [
        { name: "foo", value: { age: 20 } },
        { name: "bar", value: { age: 21 } },
      ],
    },
  },
  action(props) {
    console.log(props.data);
  },
});

const cli = new CliCore({
  name: "cli",
  description: "自用 cli 合集",
  version: "0.0.1",
  commands: [demo],
  config: {
    interactive: true,
  },
});

cli.execute();
