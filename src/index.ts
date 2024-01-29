#!/usr/bin/env node

import { exec as execAsync } from "child_process";
import util from "util";
import { input } from "@inquirer/prompts";
import gradient from "gradient-string";
import figlet from "figlet";
import fs from "fs";

const exec = util.promisify(execAsync);

async function init() {
  const projectName = await input({
    message: "What is the name of your package?",
    default: "my-package",
  });

  const projectDirectory = `./${projectName}`;

  fs.mkdirSync(projectDirectory);
  exec("pnpm init", { cwd: projectDirectory });

  displayEndMessage();
}

function displayEndMessage() {
  console.clear();
  console.log(
    `\n\n${gradient.pastel.multiline(figlet.textSync("Project created!"))} \n\n`
  );
}

await init();
