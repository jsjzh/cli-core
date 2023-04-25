import { CliCommand } from "../../lib";

export default new CliCommand({
  name: "cmd1",
  arguments: {
    argInput: {},
    argSelect: {
      default: "bar",
      choices: [
        {
          key: "foo",
          value: { name: "oh yeah" },
          label: "选我选我选我",
        },
        "bar",
        "baz",
        "qux",
      ],
    },
    argCheck: {
      multiple: true,
      default: ["foo", "bar"],
      choices: ["foo", "bar", "baz", "qux"],
    },
  },
  options: {
    optInput: {},
    optSelect: {
      choices: ["foo", "bar", "baz", "qux"],
    },
    optCheck: {
      multiple: true,
      choices: ["foo", "bar", "baz", "qux"],
    },
  },
  action(props) {
    console.log(props.data);
  },
});
