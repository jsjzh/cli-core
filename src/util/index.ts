import type { BaseParams } from "@/cliCommand";

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
