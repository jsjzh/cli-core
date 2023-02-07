import type { IBaseParams } from "@/cliCommand";

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

export const isInput = (config: IBaseParams) => !config.optional;

export const isList = (config: IBaseParams) =>
  !config.optional && Array.isArray(config.choices);

export const isCheckbox = (config: IBaseParams) =>
  !config.optional && Array.isArray(config.choices) && config.multiple;

export const isHaveLenArray = (arr: any) =>
  Array.isArray(arr) && arr.length > 0 ? true : false;
