import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
  isBackspaceKey,
  usePrefix,
} from "@inquirer/core";
import chalk from "chalk";
import { Prompt } from "./prompt";

function displayValuesAsTag(values: string[]) {
  return values.map((v) => chalk.bgGray(` ${v} `)).join(" ");
}

function displaySeparator(isDisplayed: boolean) {
  return isDisplayed ? " | " : "";
}

function resetEndOfLineChar(status: string) {
  return status === "done" ? chalk.reset(" ") : "";
}

export const multiAnswer: Prompt<
  string[],
  {
    message: string;
    default?: string[] | undefined;
  }
> = createPrompt<string[], { message: string; default?: string[] }>(
  (config, done) => {
    const [status, setStatus] = useState("pending");
    const [values, setValues] = useState(config.default ?? ([] as string[]));
    const [currentValue, setCurrentValue] = useState("");
    const prefix = usePrefix();

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

    const displayedValues = displayValuesAsTag(values);
    const separator = displaySeparator(values.length > 0);

    let formattedValues = displayedValues + separator + currentValue;

    let defaultValue = "";
    if (status === "done") {
      formattedValues = displayedValues;
    } else {
      defaultValue = chalk.dim("");
    }

    const message = chalk.bold(config.message);
    const resetChar = resetEndOfLineChar(status);
    return `${prefix} ${message}${defaultValue} ${formattedValues}${resetChar}`;
  }
);
