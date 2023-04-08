import { CliCore, CliCommand } from "../lib";

const demo = new CliCommand({
  command: "demo",
  description: "测试指令",
  arguments: {
    // hello: {
    //   description: "arguments hello",
    //   choices: [
    //     { key: "fookey", value: { age: 1, job: "foovalue" } },
    //     { key: "barkey", value: "barvalue" },
    //     { key: "abckey", value: { age: 3, job: "abcvalue" } },
    //   ],
    //   default: "abckey",
    // },
  },
  options: {
    // world: {
    //   description: "options world",
    //   choices: [
    //     { key: "xkey", label: "xlabel", value: { age: 4, job: "xvalue" } },
    //     { key: "ykey", label: "ylabel", value: { age: 5, job: "yvalue" } },
    //     { key: "zkey", label: "zlabel", value: { age: 6, job: "zvalue" } },
    //   ],
    //   default: "ykey",
    // },
    deep: {
      description: "options deep",
      multiple: true,
      choices: [
        { key: "xkey", label: "xlabel", value: { age: 4, job: "xvalue" } },
        { key: "ykey", label: "ylabel", value: { age: 5, job: "yvalue" } },
        { key: "zkey", label: "zlabel", value: { age: 6, job: "zvalue" } },
      ],
      default: ["zkey", "ykey"],
      // default: ["ykey", "zkey"],
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
