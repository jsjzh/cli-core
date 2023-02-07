import type { IBaseParams } from "@/cliCommand";

// TODO 还可以补充更多的类型
// InputQuestion,
//   NumberQuestion,
//   ConfirmQuestion,
// ListQuestion,
//   RawListQuestion,
// CheckboxQuestion,
//   PasswordQuestion,
//   EditorQuestion,

export const isInput = (config: IBaseParams) => !config.optional;

export const isList = (config: IBaseParams) =>
  !config.optional && Array.isArray(config.choices);

export const isCheckbox = (config: IBaseParams) =>
  !config.optional && Array.isArray(config.choices) && config.multiple;
