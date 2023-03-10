import { createPromptModule } from "inquirer";
import { omit } from "lodash";

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

interface IPromptConfig {
  prefix?: string;
  suffix?: string;
  initialAnswers?: Partial<Answers>;
}

interface IBaseConfig {
  name: string;
  message: string;
}

interface IInputConfig extends IBaseConfig {
  default?: string;
}
interface INumberConfig extends IBaseConfig {
  default?: number;
}
interface IConfirmConfig extends IBaseConfig {
  default?: boolean;
}
interface IListConfig extends IBaseConfig {
  choices: ({ name: string; value: any } | string)[];
  default?: string;
}
interface IRawListConfig extends IBaseConfig {
  choices: ({ name: string; value: any } | string)[];
  default?: string;
}
interface ICheckboxConfig extends IBaseConfig {
  choices: ({ name: string; value: any } | string)[];
  default?: string[];
}
interface IPasswordConfig extends IBaseConfig {
  default?: string;
}
interface IEditorConfig extends IBaseConfig {
  default?: string;
}

export class Prompt {
  promptModule: PromptModule;
  prompts: Question[];
  baseConfig: Omit<IPromptConfig, "initialAnswers">;
  initialAnswers: Partial<Answers>;

  constructor(config: IPromptConfig) {
    this.promptModule = createPromptModule();
    this.baseConfig = omit(config, "initialAnswers");
    this.initialAnswers = config.initialAnswers || {};
    this.prompts = [];
  }

  addInput(inputConfig: IInputConfig) {
    const inputQuestion: InputQuestion = {
      type: "input",
      name: inputConfig.name,
      message: inputConfig.message,
      default: inputConfig.default || this.initialAnswers[inputConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(inputQuestion);

    return this;
  }

  addNumber(numberConfig: INumberConfig) {
    const numberQuestion: NumberQuestion = {
      type: "number",
      name: numberConfig.name,
      message: numberConfig.message,
      default: numberConfig.default || this.initialAnswers[numberConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(numberQuestion);

    return this;
  }

  addConfirm(confirmConfig: IConfirmConfig) {
    const confirmQuestion: ConfirmQuestion = {
      type: "confirm",
      name: confirmConfig.name,
      message: confirmConfig.message,
      default: confirmConfig.default || this.initialAnswers[confirmConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(confirmQuestion);

    return this;
  }

  addList(listConfig: IListConfig) {
    const listQuestion: ListQuestion = {
      type: "list",
      name: listConfig.name,
      message: listConfig.message,
      choices: listConfig.choices,
      default: listConfig.default || this.initialAnswers[listConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(listQuestion);

    return this;
  }

  addRawList(rawListConfig: IRawListConfig) {
    const rawListQuestion: RawListQuestion = {
      type: "rawlist",
      name: rawListConfig.name,
      message: rawListConfig.message,
      choices: rawListConfig.choices,
      default: rawListConfig.default || this.initialAnswers[rawListConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(rawListQuestion);

    return this;
  }

  // addExpand(expandConfig: {}) {}

  addCheckbox(checkboxConfig: ICheckboxConfig) {
    const checkboxQuestion: CheckboxQuestion = {
      type: "checkbox",
      name: checkboxConfig.name,
      message: checkboxConfig.message,
      choices: checkboxConfig.choices,
      default:
        checkboxConfig.default || this.initialAnswers[checkboxConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(checkboxQuestion);

    return this;
  }

  addPassword(passwordConfig: IPasswordConfig) {
    const passwordQuestion: PasswordQuestion = {
      type: "password",
      name: passwordConfig.name,
      message: passwordConfig.message,
      default:
        passwordConfig.default || this.initialAnswers[passwordConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(passwordQuestion);

    return this;
  }

  addEditor(editorConfig: IEditorConfig) {
    const editorQuestion: EditorQuestion = {
      type: "editor",
      name: editorConfig.name,
      message: editorConfig.message,
      default: editorConfig.default || this.initialAnswers[editorConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(editorQuestion);

    return this;
  }

  execute(callback?: (value: Answers) => void) {
    // if (!this.__validate()) {}
    return this.promptModule(this.prompts).then(callback);
  }

  // __validate() {
  //   const names = this.prompts.map((prompt) => prompt.name);
  //   return names.length === [...new Set(names)].length;
  // }
}

const createPrompt =
  (config: IPromptConfig = {}) =>
  (initialAnswers: Partial<Answers> = {}) =>
    new Prompt({ ...config, initialAnswers });

export default createPrompt;
