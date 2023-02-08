# @oishi/cli-core

## 说明

这是一个整合了 commander 和 inquirer，用作创建脚本的底层框架。

使用该框架创建的命令行工具，一份配置通行交互式命令行和命令式命令行。

## API

### CliCore

框架的核心壳，用来创建声明初始命令行。

如下，创建一个空壳子，框架会自动注入 `help` 和 `version` 等指令。

```ts
import { CliCore } from "@oishi/cli-core";

const cli = new CliCore({
  name: "cli",
  description: "常用命令行合集",
  version: "0.0.1",
  commands: [],
});

cli.execute();
```

使用，`cli -h` 和 `cli --version` 查看信息。

```sh
# 查看帮助
$ cli -h

Usage: cli [options]

常用命令行合集

Options:
  -V, --version      output the version number
  -i, --interactive  交互式命令行 (default: false)
  -h, --help         display help for command
```

#### interactive

框架会自动注入 `interactive` 选项，当运行 `cli -i` 时，框架将会自动生成交互式命令行。

### CliCommand

子命令对象，用来创建命令行的子命令集。

如下，创建一个最简单的命令行，我们希望程序给我们打个招呼，使用 `cli say xxx` 调用。

```ts
import { CliCommand } from "@oishi/cli-core";

interface IArgs {
  name: string;
}

interface IOpts {}

const say = new CliCommand<IArgs, IOpts>({
  command: "say",
  description: "say hello",
  arguments: {
    name: { description: "请输入您的名称" },
  },
  options: {},
  action({ data, logger, helper }) {
    logger.info(`hello ${data.name}`);
  },
});
```

创建完 `CliCommand` 之后，加入到 `CliCore` 的 `commands` 中即可。

```ts
import { CliCore } from "@oishi/cli-core";

const cli = new CliCore({
  name: "cli",
  description: "常用命令行合集",
  version: "0.0.1",
  commands: [say],
});

cli.execute();
```

如下调用，命令行将会输入对应信息。

```sh
# 执行指令
$ cli say jsjzh
20XX-XX-XXTXX:XX:XX.XXXZ [cli] info: hello jsjzh
```

#### command

**required**

子命令的名称，**必传**，接受字符串，比如传入了 `say`，则可以使用 `cli say` 调用。

#### description

**required**

子命令的描述，**必传**，接受字符串，传入的讯息将在 `cli say -h` 时显示。

#### arguments

**optional**

```ts
interface IArguments {
  description: string;
  default?: any | [any, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}
```

子命令的参数，这个和下面的 `options` 有些不同，该处参数一般为必填，且不用带前缀说明。

例子如下。

```ts
...
arguments: {
  name: { description: "请输入您的名称" }
}
...
```

如下，只需要直接输入 xxx 即可。

```sh
$ cli say xxx
```

#### options

**optional**

```ts
interface IOptions {
  description: string;
  default?: any | [any, string];
  alias?: string;
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}
```

子命令的参数，需要携带前缀说明。

如果同上面的 `arguments` 的例子一样，`options` 也想要一个 `name` 的参数，该如何写呢？

例子如下。

```ts
...
options: {
  name: { description: "请输入您的名称" }
}
...
```

如下，需要增加前缀 `--name` 才行。

```sh
$ cli say --name xxx
```

#### commands

**optional**

子命令的命令集，`CliCommand` 支持嵌套方式，且命令行的命中模式为优先匹配命令集，直接说有些难理解，请看如下的例子。

```ts
const child = new CliCommand({
  command: "child",
  description: "child",
  action({ data, logger, helper }) {
    logger.info(`child`);
  },
});

const parent = new CliCommand({
  command: "parent",
  commands: [child],
  description: "parent",
  arguments: {
    name: { description: "请输入您的名称" },
  },
  options: {},
  action({ data, logger, helper }) {
    logger.info(`hello ${data.name}`);
  },
});
```

如上，在 `parent` 接收一个 `arguments` 时，`parent` 还有一个 `commands`，那程序如果运行 `cli parent child`，程序将如何匹配？

答案是优先匹配子命令集，将 `cli parent child` 传入的 `child` 当做是子命令集的触发，也就是会输出 `child`。

所以，即使 `parent 的参数中有 arguments`，但如果传入的 arguments 和其子命令集的 `command` 重复，将会命中子命令集的任务。

### Arguments

`arguments` 的对象描述如下

```ts
interface IArguments {
  description: string;
  default?: any | [any, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}
```

- **default** 表示默认值，当没有传入值时，框架会传入默认值。
- **choices** 表示可以输入的值，交互式的呈现是 `list` or `checkbox`(若开启 `multiple`) 选择，命令式的呈现是对输入进行验证。
- **optional** 表示该参数是否可选，默认参数都为必选。若配置为 `true`，则交互式会跳过生成该条交互命令。
- **multiple** 与 `choices` 配合使用，表示多选，输入的值会以数组的形式传入。

### Options

```ts
interface IOptions {
  description: string;
  default?: any | [any, string];
  alias?: string;
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}
```

- **alias** 表示短缀，如 `--build` 设置 `alias` 为 `b`，则可使用 `-b` 调用。
- **default** 表示默认值，当没有传入值时，框架会传入默认值。
- **choices** 表示可以输入的值，交互式的呈现是 `list` or `checkbox`(若开启 multiple) 选择，命令式的呈现是对输入进行验证。
- **optional** 表示该参数是否可选，默认参数都为必选。若配置为 `true`，则交互式会跳过生成该条交互命令。
- **multiple** 与 `choices` 配合使用，表示多选，输入的值会以数组的形式传入。

### Logger

如下为日志的严重程度，error 为 0，是最大 P0 级错误日志。

```ts
enum levels {
  error = 0,
  warn = 1,
  info = 2,
  http = 3,
  verbose = 4,
  debug = 5,
  silly = 6,
}
```

`CliCommand` 的 `action` 中接收一个 `logger` 方法，该方法是包装的 `winston`，该日志工具会以天为维度，记录 `warn` 和 `error` 等级的内容到 `~/logs/oishi/${cli}` 中，文件最大为 20mb，会以滑动窗口的方式滚动记录最近 14 天的日志。

```ts
...
action({ data, logger, helper }) {
  logger.warn(`hello ${data.name}`);
}
...
```

### Helper

框架提供了几个常用的工具。

#### runPrompt

创建交互式命令行。

```ts
const prompt = helper.runPrompt();

prompt.addInput({ name: "name", message: "请输入你的名字" });

prompt.execute((answers) => {
  console.log(answers);
});
```

#### runCron

创建定时任务。

```ts
helper.runCron({
  cronTime: "* * * * * *",
  onTick() {
    console.log("hello wrold");
  },
});
```

#### runCmd

创建命令行运行工具。

```ts
const run = helper.runCmd();

run("echo hello world");
```

#### runTask

创建任务链，方便管理任务顺序。

```ts
await helper
  .runTask({ hasTip: true })
  .add({
    title: "切换 registry 至 npm 源",
    async task() {
      run("npm set registry=https://registry.npmjs.org/");
    },
  })
  .add({
    title: "执行项目构建和发布",
    async task() {
      run("npm run build");
      run("npm publish");
    },
  })
  .add({
    title: "切换 registry 至国内镜像",
    async task() {
      run("npm set registry=https://registry.npmmirror.com/");
    },
  })
  .run();
```

## 待办

- [ ] choices 和 default 允许传入 name value 的方式
- [ ] 类型转换有问题，因为命令行解析的结果都是字符串，无法通过 ts 传入值来修改获取值
- [ ] 后续 logger 可能可以支持自定义 winston transports
- [ ] 添加更多的 inquirer 的输入类型支持
