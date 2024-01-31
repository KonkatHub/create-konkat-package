#!/usr/bin/env node

import { exec as execAsync } from "child_process";
import util from "util";
import gradient from "gradient-string";
import figlet from "figlet";
import fs from "fs/promises";
import {
  askProjectAuthors,
  askProjectDescription,
  askProjectLicense,
  askProjectName,
} from "./prompts/prompts";

const exec = util.promisify(execAsync);

async function init() {
  const projectName = await askProjectName();

  const projectDirectory = `./${projectName}`;

  await createProject(projectDirectory);
  await editPackageJson(projectDirectory);

  displayEndMessage();
}

async function createProject(projectDirectory: string) {
  await fs.mkdir(projectDirectory);
  await exec("pnpm init", { cwd: projectDirectory });
}

async function editPackageJson(projectDirectory: string) {
  const packageJsonPath = `${projectDirectory}/package.json`;

  const data = await fs.readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(data);

  packageJson.version = "0.0.1";
  packageJson.license = await askProjectLicense();
  packageJson.description = await askProjectDescription();
  packageJson.authors = await askProjectAuthors();
  packageJson.type = "module";
  packageJson.main = "dist/index.js";
  packageJson.types = "dist/index.d.ts";
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.build = "tsup src/index.ts --format esm --dts";
  packageJson.scripts.dev =
    "tsup src/index.ts --format esm --dts --silent && node dist/index.js";
  packageJson.scripts.lint = "tsc";
  packageJson.scripts.release = "pnpm run build && changeset publish";

  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf8"
  );
}

function displayEndMessage() {
  console.clear();
  console.log(
    `\n\n${gradient.pastel.multiline(figlet.textSync("Project created!"))}\n\n`
  );
}

await init();
