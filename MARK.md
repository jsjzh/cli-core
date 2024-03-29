# MARK

这里全部都是没有什么逻辑的随思随想，平时写代码的时候突然有想法了就会在这里记一条，**最终这些想法落地成了 CliCore 框架**。

```ts
interface App {
  name: string;
  version: string;
  description: string;
  commands?: Command[];
}

interface Command {
  command: string;
  description: string;
  commands?: Command[];
  arguments?: { [k: string]: IArguments };
  options?: { [k: string]: IOptions };
}

interface IBaseParams {
  description: string;
  default?: string | [string, string];
  choices?: string[];
  optional?: boolean;
  multiple?: boolean;
}

interface IArguments extends IBaseParams {}

interface IOptions extends IBaseParams {
  alias?: string;
}
```

## 待办

1. requireOption
2. 日志文件有问题，不能把日志都放在项目的目录下
3. 允许 CliCommand 传入 args opts 的类型
4. index.d.ts 文件需要完善一下
5. 是否可以做到事务回滚？
6. 是否需要把每个 command 的 context 都传到他的子 command？
7. 将 command 变成一个插件，可以接受外部的 command
8. 监听文件变化，自动触发任务模式
9. cron 模式
10. inquirer 终端交互是不是可以作为功能接入？
11. 改名执行都为 run or execute
12. 修改 arguments options 传入模式，然后可以结合 inquirer 的传入
    1. 希望实现的一个效果就是，如果是通过 cli 的方式传入参数，那就直接用 cli，如果是缺少什么参数，就会弹出 inquirer 的方式来引导输入，哦对没错，就只有缺少参数的时候，才需要 inquirer 的方式来输入，如果不是必要参数，那就不需要输入，对，这样才对，懂了，牛逼，老子牛逼，哈哈哈哈
    2. 但其实，不一定是缺少参数才要 inquirer？或许还是可以因为 CliCommand 定义一个全局（CliCommand 的全局）的 isPrompt 来开启使用 inquirer？这个可能可以当成一个 feature 来做
13. 定时任务应该给做到框架外，比如能通过参数的形式传进去
14. --interactive -i
    1. 这个是表示要用交互式
    2. 另外，交互式也要加到 helper 里面，用户可以自定义
15. --schedule -s 或者 --cron -c
    1. 这个考虑一下，是不是要加进入，因为不是所有人都有这个需求，还是
16. 想办法是不是可以 新的 arguments options 和旧的 arguments options 都接受，想想办法
17. 用 object 的方式还有一个好处就是可以确切的知道传入了啥，props.args 可以知道
18. 说不定有可能 arguments 都可以直接剔除，不需要它了（好像的确可以，不用 arguments 也行的）
    1. 不行，这样就不能实现 cli demo xxx xxx xxx 了
19. 遇阻，遇阻，发现问题，在合并 inquirer 和 commander 的时候，我一开始把 inquirer 包裹在 commander 的 action 中，但发现如果缺少参数，action 根本就执行不到，找了文档，发现有个可以重写 commander 的 errorHandler 的方法，把 inquirer 从这里插进去，好的，程序倒是起来了，但是有个问题就是，commander 在执行完 errorHandler 之后，就直接 process.exit() 了，我干他妈的，直接进程给结束掉了，现在，有两个想法
    1. 第一，是在 commander 干掉进程之前，重启一个进程，这个进程跑 inquirer，这个需要调查一下能不能实现
    2. 第二，直接在 cli-core 的最外层，CliCore 层，接收 -i 参数，执行 cli -i 可以通过选择 npm git demo 的方式，一层层下去
20. 类型转换还是有问题，无法通过 ts 的传入类型来强行修改值类型
21. choices 和 default 允许传入 name value 的方式
22. 比如我有 cli npm publish 的指令，其中会涉及到 git push，而我已经写过了 cli git push，那如何让 cli npm publish 可以复用 cli git push 的逻辑？
23. 是否可以增加一个参数，memory，意思就是，该 option 或者 argument 参数会记忆上次的输入值
24. 需要增加一个 cron 的使用说明，如何在后台运行
25. 如果添加了很多 command，需要有一个标识，不在 inquirer 中显示
26. 可选项是不是可以通过一个函数来返回，比如 git branch 获取来的东东
27. Confirm 的 inquired 可以通过一个参数，然后框架主动传入 true false，然后判断 "true" "false"
28. 是不是可以出一个，统计命令使用次数的功能
29. props 里面要有一个 config，把一些 cli-core 的基础参数放进去
30. 是否可以添加一个 globalCache，意思就是程序结束之后，也能获取到这些数据，等于说在本机持久化了数据
31. 如何获取到上一个 inquirer 的数据？比如，根据上一个选项的答案，下一个选项的类别也不同
32. 运行错误的时候，不要把代码错误都抛出来

```ts
// isPrompt: boolean
// usePrompt: boolean

// 若给值 choices，inquirer 就用 list
// 若无 choices，则根据 default 来确定是 input 还是 number
// 若无 params，则使用 confirm
// checkbox
// password

// Input: 默认
// List: 若传值 choinces:[xxx, xxx]
// Checkbox: isCheckbox:true choices
// Confirm: isConfirm:true
// Password: isVisible:false
// Editor: 若传值 isLong:true
// Number: 根据 default 为 string 还是 number 来决定
// RawList: 若传值 isRow:true

// isRequired?: boolean;

interface IInput {}

interface IList {
  choices?: (string | number)[];
}

// <xxx...>
interface ICheckbox {
  choices?: (string | number)[];
}

interface IConfirm {}

interface IPassword {
  isPassword: boolean;
}

interface IEditor {
  isEditor: boolean;
}

interface INumber {}

interface IRawList {}

const arguments = [
  {
    name: "<message>",
    description: "message",
    default: [1, "1"],
    selects: ["1", "2", "3", "4", "5"],
  },
];

const arguments = {
  message: {
    description: "message",
    default: [1, "1"],
    choices: ["1", "2", "3", "4", "5"],
  },
};

type IArgument = {
  name: string;
  description: string;
  default?: [any, string];
  selects?: string[];
}[];

type INewArgument = {
  [k: string]: {
    description?: string;
    default?: any | [any, string];
    choices?: (string | number)[];
    // 决定 <xxx> or [xxx]
    isRequired?: boolean;
  };
};

const options = [
  {
    name: "-v, --version <version>",
    description: "输入发布时的版本升级方式",
    default: ["patch", "patch"],
    selects: ["major", "minor", "patch", "premajor", "preminor", "prepatch"],
  },
  {
    name: "-r, --registry [registry]",
    description: "输入要发布的 registry",
    default: ["https://registry.npmjs.org/", "https://registry.npmjs.org/"],
  },
];

const options = {
  version: {
    alias: "v",
    description: "输入发布时的版本升级方式",
    default: ["patch", "patch"],
    required: true,
    selects: ["major", "minor", "patch", "premajor", "preminor", "prepatch"],
  },
  registry: {
    alias: "r",
    description: "输入要发布的 registry",
    default: ["https://registry.npmjs.org/", "https://registry.npmjs.org/"],
  },
};

type IOption = {
  name: string;
  description: string;
  default?: [any, string];
  selects?: string[];
}[];

type INewOption = {
  [k: string]: {
    description?: string;
    default?: any | [any, string];
    alias?: string;

    // 决定 <xxx> or [xxx]
    isRequired?: boolean;

    choices?: (string | number)[];
  };
};

// const commandArguments = this.baseConfig.arguments.map((arg) => {
//   const argument = createArgument(arg.name, arg.description);

//   arg.selects && argument.choices(arg.selects);
//   arg.default && argument.default.apply(argument, arg.default);

//   return argument;
// });

// const commandOptions = this.baseConfig.options.map((opt) => {
//   const option = createOption(opt.name, opt.description);

//   opt.selects && option.choices(opt.selects);
//   opt.default && option.default.apply(option, opt.default);

//   return option;
// });
```

## 草稿

把这个想象成是一个 http 请求的处理模式，有一个中心的 context，感觉有点类似于 egg

数据如何向下传递？

helper 是包装过的 axios 或者 exec 的代码，然后可以通过 npm 包引入

command 是已经可以运行的脚本，比如 git hosts update，然后这里面也会有用到 helper，这个该怎么设计？

或许，command 也是 new Cli 生成的，command 也有 commands 和 helper 的参数

container 只是将他们串起来的方法，比如一个外层的 container 有一个 commands，这个 commands 的 command 是 git，如果只是在第一层添加了 commands，那就运行 cli git 就行，如果这个 command 传了 commands 的参数，也是这个 git，那么，就得 cli git git 才可以使用

所以，我只是要做一个壳子，把他们套起来，然后，需要想想怎么给 helper 和 context 添加进去，有 logger，但是有一点，就是 axios 库，不应该被包装吧，因为 axios 一般是把 host 提炼出来用的，就是单成一个 service，那或者，又提供 helper.api 又可以直接用 axios，command 写的时候，如果有发起请求的需求，需要检测一下是否 helper 是否有 api？不过没事，axios 这种不是强需求，因为外部也可以用

我这个比较特别的就是，有包装了 logger cron exec runTask 的方法

还有一个就是，我这些 helper 里面，也是有 logger 输出的，怎么正确的取到 logger？

可以设计成洋葱模型么？就是用 pipe 或者是就 compose，一层一层传递下去，每层都有一个解析？或许不需要？但是 cli 的参数的解析，比如说类型的转换？但其实怎么说呢，洋葱模型一层一层是每层都有效的，哦？等会，那我的 helper 和 context 是不是可以用洋葱模型给他一个个放进去，当 cli xxx xxx xxx 来的时候，洋葱模型用来套入 helper，但是感觉没有太大的必要啊，因为 egg 是一个持久化的服务，而我这个是 cli 等于说是一次运行的玩意儿，当然，也有 cron 的功能，但是真的需要这种一层一层的处理方式么？我觉得是不是有必要去看看 egg 的 compose 的源码那里

如果是多个的，比如 npm 和 npx 还有其他的啥的，是写在一个仓库的，哦，那其实也没事，因为用多入口就好了，然后 bin 那里用 xxx: xxx 来表示即可

哦，还有一点，就是得有一个办法，能够获取到 Container 也就是 Cli 的一些信息，比如 name 或者 version 等等的？真的需要吗？想一想

我发现 logger 有点问题，在哪里运行就会有一大堆 logs 文件，得改改，因为这个可能会和项目本身的 logs 文件冲突

每个 command 的 context 都是不一样的，然后输入的参数，是否要变成 name? 这种，也就是说，不用 options[] 的方法传入

测试案例需要补充

还可以增加功能就是可以选择的，就比如运行了指令之后，有 abc 选项

还可以增加一种会自动在后台运行的脚本，可以通过 cron 来控制运行时间，再通过 pm2 来保证服务稳定运行，接着

用 log 日志记录的工具，给记录到文件里，并且，这个 log 日志记录不仅仅可以用在长时间挂在后台的脚本上，平时的日志也可以记录。

容器可以做的事情，统一增加 command 指令，比如 -q 指令，就是 quiet，意思就是禁止显示信息

Generic options 和 Specific git-branch actions: 的区别

div 的底层显示虚幻的名称如何实现

我也需要整理出来整体的架构，各种东西的架构，就像之前看到的 xm 整理的供应链上下游，个中环节

我应该总结一下，现在公司拥有的能力架构，比如说，大数据是一个趋势，那么是不是大数据、可视化、是一个方向

cli git pull 可以修改

我要在统一一个地方，把所有 ? 的值，都变成默认的，这就叫 normalize

```shell
# 三个维度 Command Argument Option
# createCommand
# createOption
# createArgument

# 两种表达方式
# cli start dev
command: cli
command: start
argument: dev

command: cli
command: start
command: dev

# cli start --dev
command: cli
command: start
option: dev

# 存疑
# cli start name --dev
command: cli
command: start
argument: name
option: dev
```
