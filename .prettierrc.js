module.exports = {
  // 箭头函数，只有一个参数的时候，也需要括号
  arrowParens: 'always',
  // 标签的反尖括号需要换行
  bracketSameLine: false,
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  cursorOffset: -1,
  editorconfig: false,
  embeddedLanguageFormatting: 'auto',
  // 换行符使用 lf
  endOfLine: 'lf',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // jsx 不使用单引号，而使用双引号
  jsxSingleQuote: false,
  // 一行最多 80 字符
  printWidth: 80,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  rangeEnd: null,
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 行尾需要有分号
  semi: true,
  // 在 HTML、Vue 和 JSX 中强制每行使用一个属性
  singleAttributePerLine: false,
  // 使用单引号
  singleQuote: false,
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 末尾一直需要逗号
  trailingComma: 'all',
  // 不使用缩进符，而使用空格
  useTabs: false,
  vueIndentScriptAndStyle: false,
};
