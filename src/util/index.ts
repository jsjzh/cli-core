import type { InnerBaseParams } from "@/cliCommand";

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

export const isInput = (config: InnerBaseParams) => !config.optional;

export const isList = (config: InnerBaseParams) =>
  !config.optional && Array.isArray(config.choices);

export const isCheckbox = (config: InnerBaseParams) =>
  !config.optional && Array.isArray(config.choices) && config.multiple;

export const haveLenArray = (arr: any) =>
  !!(Array.isArray(arr) && arr.length > 0);
