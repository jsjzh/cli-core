import { createPromptModule } from "inquirer";

import type {
  PromptModule,
  Question,
  Answers,
  InputQuestion,
  NumberQuestion,
  ConfirmQuestion,
  ListQuestion,
  RawListQuestion,
  ExpandQuestion,
  CheckboxQuestion,
  PasswordQuestion,
  EditorQuestion,
} from "inquirer";
import { ChoiceItem, Choices, formatChoices } from "@/core/cliCommand";

interface BaseConfig {
  name: string;
  description?: string;
}

interface InputConfig extends BaseConfig {
  default?: string;
}
interface NumberConfig extends BaseConfig {
  default?: number;
}
interface ConfirmConfig extends BaseConfig {
  default?: boolean;
}
interface ListConfig extends BaseConfig {
  choices: Choices;
  default?: string;
}

interface InnerListConfig extends BaseConfig {
  choices: ChoiceItem[];
  default?: string;
}

interface RawListConfig extends BaseConfig {
  choices: Choices;
  default?: string;
}

interface InnerRawListConfig extends BaseConfig {
  choices: ChoiceItem[];
  default?: string;
}

interface CheckboxConfig extends BaseConfig {
  choices: Choices;
  default?: string[];
}

interface InnerCheckboxConfig extends BaseConfig {
  choices: ChoiceItem[];
  default?: string[];
}

interface PasswordConfig extends BaseConfig {
  default?: string;
}
interface EditorConfig extends BaseConfig {
  default?: string;
}

interface PromptConfig {
  prefix?: string;
  suffix?: string;
  initialAnswers?: Answers;
}

export default class Prompt<T extends Answers> {
  promptModule: PromptModule;
  baseConfig: Required<PromptConfig>;
  prompts: Record<string, Question>;
  configs: Record<
    string,
    | InputConfig
    | NumberConfig
    | ConfirmConfig
    | InnerListConfig
    | InnerRawListConfig
    | InnerCheckboxConfig
    | PasswordConfig
    | EditorConfig
  >;

  constructor(config: PromptConfig) {
    this.baseConfig = this.normalizeConfig(config);
    this.promptModule = createPromptModule();
    this.prompts = {};
    this.configs = {};
  }

  private normalizeConfig(config: PromptConfig) {
    return {
      prefix: config.prefix ?? "",
      suffix: config.suffix ?? "",
      initialAnswers: config.initialAnswers ?? {},
    };
  }

  addInput(inputConfig: InputConfig) {
    const inputQuestion: InputQuestion = {
      type: "input",
      name: inputConfig.name,
      message: inputConfig.description ?? inputConfig.name,
      default:
        inputConfig.default ?? this.baseConfig.initialAnswers[inputConfig.name],
      ...this.baseConfig,
    };

    this.prompts[inputConfig.name] = inputQuestion;
    this.configs[inputConfig.name] = inputConfig;

    return this;
  }

  addNumber(numberConfig: NumberConfig) {
    const numberQuestion: NumberQuestion = {
      type: "number",
      name: numberConfig.name,
      message: numberConfig.description ?? numberConfig.name,
      default:
        numberConfig.default ??
        this.baseConfig.initialAnswers[numberConfig.name],
      ...this.baseConfig,
    };

    this.prompts[numberConfig.name] = numberQuestion;
    this.configs[numberConfig.name] = numberConfig;

    return this;
  }

  addConfirm(confirmConfig: ConfirmConfig) {
    const confirmQuestion: ConfirmQuestion = {
      type: "confirm",
      name: confirmConfig.name,
      message: confirmConfig.description ?? confirmConfig.name,
      default:
        confirmConfig.default ??
        this.baseConfig.initialAnswers[confirmConfig.name],
      ...this.baseConfig,
    };

    this.prompts[confirmConfig.name] = confirmQuestion;
    this.configs[confirmConfig.name] = confirmConfig;

    return this;
  }

  addList(listConfig: ListConfig) {
    const _choices = formatChoices(listConfig.choices);

    const listQuestion: ListQuestion = {
      type: "list",
      name: listConfig.name,
      message: listConfig.description ?? listConfig.name,
      choices: _choices.map((choice) => ({
        key: choice.key,
        // choices 很特殊，包括下面的 RawList 和 Checkbox
        // 因为当我传了 default 的时候，必须要 default === value，才可以保证默认被选中
        // 而这是有问题的，我应该传入的是 key
        // 所以这里 value 设置为 key，然后在 execute 之后重新解析 choices，把 value 给丢进去
        value: choice.key,
        name: choice.label,
      })),
      default:
        listConfig.default ?? this.baseConfig.initialAnswers[listConfig.name],
      ...this.baseConfig,
    };

    this.prompts[listConfig.name] = listQuestion;
    this.configs[listConfig.name] = {
      ...listConfig,
      choices: _choices,
    };

    return this;
  }

  addRawList(rawListConfig: RawListConfig) {
    const _choices = formatChoices(rawListConfig.choices);

    const rawListQuestion: RawListQuestion = {
      type: "rawlist",
      name: rawListConfig.name,
      message: rawListConfig.description ?? rawListConfig.name,
      choices: _choices.map((choice) => ({
        key: choice.key,
        value: choice.key,
        name: choice.label,
      })),
      default:
        rawListConfig.default ??
        this.baseConfig.initialAnswers[rawListConfig.name],
      ...this.baseConfig,
    };

    this.prompts[rawListConfig.name] = rawListQuestion;
    this.configs[rawListConfig.name] = {
      ...rawListConfig,
      choices: _choices,
    };

    return this;
  }

  // TODO
  // addExpand(expandConfig: {}) {}

  addCheckbox(checkboxConfig: CheckboxConfig) {
    const _choices = formatChoices(checkboxConfig.choices);

    const checkboxQuestion: CheckboxQuestion = {
      type: "checkbox",
      name: checkboxConfig.name,
      message: checkboxConfig.description ?? checkboxConfig.name,
      choices: _choices.map((choice) => ({
        key: choice.key,
        value: choice.key,
        name: choice.label,
      })),
      default:
        checkboxConfig.default ??
        this.baseConfig.initialAnswers[checkboxConfig.name],
      ...this.baseConfig,
    };

    this.prompts[checkboxConfig.name] = checkboxQuestion;
    this.configs[checkboxConfig.name] = {
      ...checkboxConfig,
      choices: _choices,
    };

    return this;
  }

  addPassword(passwordConfig: PasswordConfig) {
    const passwordQuestion: PasswordQuestion = {
      type: "password",
      name: passwordConfig.name,
      message: passwordConfig.description ?? passwordConfig.name,
      default:
        passwordConfig.default ??
        this.baseConfig.initialAnswers[passwordConfig.name],
      ...this.baseConfig,
    };

    this.prompts[passwordConfig.name] = passwordQuestion;
    this.configs[passwordConfig.name] = passwordConfig;

    return this;
  }

  addEditor(editorConfig: EditorConfig) {
    const editorQuestion: EditorQuestion = {
      type: "editor",
      name: editorConfig.name,
      message: editorConfig.description ?? editorConfig.name,
      default:
        editorConfig.default ??
        this.baseConfig.initialAnswers[editorConfig.name],
      ...this.baseConfig,
    };

    this.prompts[editorConfig.name] = editorQuestion;
    this.configs[editorConfig.name] = editorConfig;

    return this;
  }

  execute(callback?: (values: T) => void) {
    return this.promptModule<T>(Object.values(this.prompts)).then((values) => {
      Object.keys(values).forEach((key) => {
        if (["list", "rawlist"].includes(this.prompts[key].type!)) {
          (values[key] as any) = (
            this.configs[key] as InnerListConfig | InnerRawListConfig
          ).choices.find((choice) => choice.key === values[key])?.value;
        }

        if (["checkbox"].includes(this.prompts[key].type!)) {
          (values[key] as any) = values[key].map(
            (_key: string) =>
              (this.configs[key] as InnerCheckboxConfig).choices.find(
                (choice) => choice.key === _key,
              )?.value,
          );
        }
      });

      callback && callback(values);
    });
  }

  // TODO 验证，需要验证 name 是否重复
  // __validate() {
  //   const names = this.prompts.map((prompt) => prompt.name);
  //   return names.length === [...new Set(names)].length;
  // }
}

export const createPrompt = <T extends Answers>(config?: PromptConfig) =>
  new Prompt<T>(config ?? {});
