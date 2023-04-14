import { CliCommand } from "../../lib";

export default new CliCommand({
  name: "cmd1",
  arguments: {
    names: {
      choices: ["1", "2", "3"],
    },
  },
  action(props) {
    console.log(props.data);
  },
});
