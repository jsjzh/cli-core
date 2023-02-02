const { CliCore, CliCommand } = require("../lib");

const demo = new CliCommand({
  command: "demo",
  description: "测试指令",
  action(props) {
    props.helper.logger.error("hello world");
  },
});

const cli = new CliCore({
  name: "cli",
  description: "自用 cli 合集",
  version: "0.0.1",
  commands: [demo],
});

cli.execute();
