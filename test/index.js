const { CliCore, CliCommand } = require("../lib");

const demo = new CliCommand({
  command: "demo",
  description: "测试指令",
  arguments: {
    name: {
      description: "arguments 名称",
      choices: [
        {
          key: "fookey",
          label: "foolabel",
          value: { age: 1, job: "foovalue" },
        },
        {
          key: "barkey",
          label: "barlabel",
          value: "barvalue",
        },
        {
          key: "abckey",
          label: "abclabel",
          value: { age: 3, job: "abcvalue" },
        },
      ],
      default: "barvalue",
    },
  },
  options: {
    names: {
      description: "options 名称",
      choices: [
        { key: "xkey", label: "xlabel", value: { age: 4, job: "xvalue" } },
        { key: "ykey", label: "ylabel", value: { age: 5, job: "yvalue" } },
        { key: "zkey", label: "zlabel", value: { age: 6, job: "zvalue" } },
      ],
      default: "ykey",
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
