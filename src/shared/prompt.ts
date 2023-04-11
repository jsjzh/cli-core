import { Choices } from "@/cliCommand";
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
interface RawListConfig extends BaseConfig {
  choices: Choices;
  default?: string;
}
interface CheckboxConfig extends BaseConfig {
  choices: Choices;
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
  prompts: Question[];

  constructor(config: PromptConfig) {
    this.baseConfig = this.normalizeConfig(config);
    this.promptModule = createPromptModule();
    this.prompts = [];
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

    this.prompts.push(inputQuestion);

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

    this.prompts.push(numberQuestion);

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

    this.prompts.push(confirmQuestion);

    return this;
  }

  addList(listConfig: ListConfig) {
    const listQuestion: ListQuestion = {
      type: "list",
      name: listConfig.name,
      message: listConfig.description ?? listConfig.name,
      choices: listConfig.choices,
      default:
        listConfig.default ?? this.baseConfig.initialAnswers[listConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(listQuestion);

    return this;
  }

  addRawList(rawListConfig: RawListConfig) {
    const rawListQuestion: RawListQuestion = {
      type: "rawlist",
      name: rawListConfig.name,
      message: rawListConfig.description ?? rawListConfig.name,
      choices: rawListConfig.choices,
      default:
        rawListConfig.default ??
        this.baseConfig.initialAnswers[rawListConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(rawListQuestion);

    return this;
  }

  // TODO
  // addExpand(expandConfig: {}) {}

  addCheckbox(checkboxConfig: CheckboxConfig) {
    const checkboxQuestion: CheckboxQuestion = {
      type: "checkbox",
      name: checkboxConfig.name,
      message: checkboxConfig.description ?? checkboxConfig.name,
      choices: checkboxConfig.choices,
      default:
        checkboxConfig.default ??
        this.baseConfig.initialAnswers[checkboxConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(checkboxQuestion);

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

    this.prompts.push(passwordQuestion);

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

    this.prompts.push(editorQuestion);

    return this;
  }

  execute(callback?: (values: T) => void) {
    // TODO
    // if (!this.__validate()) {}
    return this.promptModule<T>(this.prompts).then(callback);
  }

  // TODO
  // __validate() {
  //   const names = this.prompts.map((prompt) => prompt.name);
  //   return names.length === [...new Set(names)].length;
  // }
}

export const createPrompt = <T extends Answers>(config?: PromptConfig) =>
  new Prompt<T>(config ?? {});
