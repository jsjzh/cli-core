import type { BaseParams, CliCommandChoices } from "@/cliCommand";
import { Choice, Choices } from "@/shared/prompt";

// DONE
// InputQuestion,
// ListQuestion,
// CheckboxQuestion,

// TODO
// NumberQuestion,
// ConfirmQuestion,
// RawListQuestion,
// PasswordQuestion,
// EditorQuestion,

export const isInput = (config: BaseParams) => !config.optional;

export const isList = (config: BaseParams) =>
  !config.optional && Array.isArray(config.choices);

export const isCheckbox = (config: BaseParams) =>
  !config.optional && Array.isArray(config.choices) && config.multiple;

export const haveLenArray = (arr: any) =>
  !!(Array.isArray(arr) && arr.length > 0);

export const formatChoices = (choices: CliCommandChoices) => {
  let _choices: Choices;

  if (typeof choices === "function") {
    _choices = choices();
  } else {
    _choices = choices;
  }

  return _choices.reduce(
    (prev, curr) => [
      ...prev,
      typeof curr === "string" ? { name: curr, value: curr } : curr,
    ],
    [] as Choice[],
  );
};
