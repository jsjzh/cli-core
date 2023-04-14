import { createPrompt } from "../../lib";

// 支持 input 输入
// 支持 list 单选
// 支持 checkbox 多选
// 修改 prompt 的输入 key 和 arguments options 的 choices 一致

// createPrompt({
//   prefix: "cli-demo",
// })
//   // .addInput({
//   //   name: "addInput",
//   //   description: " addInputdescription",
//   //   default: "addInputdefault",
//   // })
//   // .addNumber({
//   //   name: "addNumber",
//   //   default: "addNumberdefault",
//   // })
//   // .addConfirm({
//   //   name: "addConfirm",
//   //   default: true,
//   // })
//   .addList({
//     name: "addList",
//     description: " addListdescription",
//     choices: [
//       {
//         key: "addListdefault",
//         label: "addListlabel1",
//         value: { name: "king" },
//       },
//       {
//         key: "addListdefault2",
//         label: "addListlabel2",
//         value: { name: "king2" },
//       },
//     ],
//     default: "addListdefault2",
//   })
//   .addRawList({
//     name: "addRawList",
//     description: " addRawListdescription",
//     choices: [
//       {
//         key: "addRawListdefault",
//         label: "addRawListlabel1",
//         value: { name: "king" },
//       },
//       {
//         key: "addRawListdefault2",
//         label: "addRawListlabel2",
//         value: { name: "king2" },
//       },
//     ],
//     default: "addRawListdefault2",
//   })
//   .addCheckbox({
//     name: "addCheckbox",
//     description: " addCheckboxdescription",
//     choices: [
//       {
//         key: "addCheckboxdefault",
//         label: "addCheckboxlabel1",
//         value: { name: "king" },
//       },
//       {
//         key: "addCheckboxdefault2",
//         label: "addCheckboxlabel2",
//         value: { name: "king2" },
//       },
//     ],
//     default: ["addCheckboxdefault", "addCheckboxdefault2"],
//   })
//   // .addPassword({
//   //   name: "addPassword",
//   //   description: " addPassworddescription",
//   //   default: "addPassworddefault",
//   // })
//   // .addEditor({
//   //   name: "addEditor",
//   //   description: " addEditordescription",
//   //   default: "addEditordefault",
//   // })
//   .execute((values) => {
//     console.log(values);
//   });
