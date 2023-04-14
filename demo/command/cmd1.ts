import { CliCommand } from "../../lib";

export default new CliCommand({
  name: "cmd1",
  options: { names: {} },
  action(props) {
    console.log(props.data);
  },
});
