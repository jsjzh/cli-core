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

interface IPromptConfig {
  prefix?: string;
  suffix?: string;
}

export class Prompt {
  promptModule: PromptModule;
  prompts: Question[];
  baseConfig: IPromptConfig;
  initialAnswers: Partial<Answers>;

  constructor(
    config: IPromptConfig = {},
    initialAnswers: Partial<Answers> = {},
  ) {
    this.promptModule = createPromptModule();
    this.baseConfig = config;
    this.initialAnswers = initialAnswers;
    this.prompts = [];
  }

  addInput(inputConfig: { name: string; message: string; default?: string }) {
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

  addNumber(numberConfig: { name: string; message: string; default?: number }) {
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

  addConfirm(confirmConfig: {
    name: string;
    message: string;
    default?: boolean;
  }) {
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

  addList(listConfig: {
    name: string;
    message: string;
    choices: ({ name: string; value: string } | string)[];
    default?: string;
  }) {
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

  addRawList(rawlistConfig: {
    name: string;
    message: string;
    choices: ({ name: string; value: string } | string)[];
    default?: string;
  }) {
    const rawListQuestion: RawListQuestion = {
      type: "rawlist",
      name: rawlistConfig.name,
      message: rawlistConfig.message,
      choices: rawlistConfig.choices,
      default: rawlistConfig.default || this.initialAnswers[rawlistConfig.name],
      ...this.baseConfig,
    };

    this.prompts.push(rawListQuestion);

    return this;
  }

  // addExpand(expandConfig: {}) {}

  addCheckbox(checkboxConfig: {
    name: string;
    message: string;
    choices: ({ name: string; value: string } | string)[];
    default?: string[];
  }) {
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

  addPassword(passwordConfig: {
    name: string;
    message: string;
    default?: string;
  }) {
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

  addEditor(editorConfig: { name: string; message: string; default?: string }) {
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
    if (this.__validate()) {
      console.log("TODO");
    }
    return this.promptModule(this.prompts).then(callback);
  }

  __validate() {
    const names = this.prompts.map((prompt) => prompt.name);
    return names.length === [...new Set(names)].length;
  }
}
