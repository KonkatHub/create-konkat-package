import { input, select } from "@inquirer/prompts";
import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
  isBackspaceKey,
} from "@inquirer/core";
import chalk from "chalk";

export const multiAnswer: any = createPrompt<
  string[],
  { message: string; default?: string[] }
>((config, done) => {
  const [status, setStatus] = useState("pending");
  const [values, setValues] = useState(config.default ?? ([] as string[]));
  const [currentValue, setCurrentValue] = useState("");

  useKeypress((key, rl) => {
    setCurrentValue(rl.line.trim());

    const updateValues = () => {
      setValues([...values, currentValue]);
      rl.clearLine(0);
      setCurrentValue("");
    };

    if (key.name === "tab") {
      updateValues();
    }

    if (isBackspaceKey(key)) {
      if (currentValue === "") {
        setValues(values.slice(0, values.length - 1));
      }
    }

    if (isEnterKey(key)) {
      if (currentValue === "") {
        setStatus("done");
        done(values);
      } else {
        updateValues();
      }
    }
  });

  const displayValues =
    values.map((v) => chalk.bgGray(` ${v} `)).join(" ") + " | ";
  let formattedValues = displayValues + currentValue;
  let defaultValue = "";
  if (status === "done") {
    formattedValues = displayValues.slice(0, displayValues.length - 3);
  } else {
    defaultValue = chalk.dim("");
  }

  const message = chalk.bold(config.message);
  return `${message}${defaultValue} ${formattedValues}`;
});

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
