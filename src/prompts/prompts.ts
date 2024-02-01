import { input, select, confirm } from "@inquirer/prompts";
import { multiAnswer } from "./multi-answer";

export async function askProjectName() {
  return await input({
    message: "What is the name of your package?",
    default: "my-package",
  });
}

export async function askProjectDescription() {
  return await input({ message: "What is the description of your package?" });
}

export async function askProjectLicense() {
  return await select({
    message: "What license do you want to use?",
    choices: [
      {
        name: "MIT",
        value: "MIT",
        description: "A permissive license that is short and to the point.",
      },
      {
        name: "ISC",
        value: "ISC",
        description:
          "A permissive license that lets people do anything with your code with proper attribution and without warranty.",
      },
      {
        name: "Apache-2.0",
        value: "Apache-2.0",
        description:
          "A permissive license whose main conditions require preservation of copyright.",
      },
      {
        name: "Unlicense",
        value: "Unlicense",
        description: "A public domain dedication for your code.",
      },
      {
        name: "GPL-3.0",
        value: "GPL-3.0",
        description:
          "A copyleft license that requires anyone who distributes your code to make the source available.",
      },
      {
        name: "AGPL-3.0",
        value: "AGPL-3.0",
        description:
          "A modified version of GPL that requires anyone who uses your code to make the source available.",
      },
      {
        name: "LGPL-3.0",
        value: "LGPL-3.0",
        description:
          "A copyleft license that allows proprietary software to link to your code.",
      },
    ],
  });
}

export async function askProjectAuthors() {
  return await multiAnswer({
    message: "Who are the authors of your package?",
  });
}

export async function askProjectKeywords() {
  return await multiAnswer({
    message: "What are the keywords of your package?",
  });
}

export async function askInitGitRepoConfirmation() {
  return await confirm({
    message: "Do you want to initialize a git repository?",
  });
}

export async function askInstallDependenciesConfirmation() {
  return await confirm({
    message: "Do you want to install the dependencies?",
  });
}
