#!/usr/bin/env node

import { exec as execAsync } from "child_process";
import util from "util";
import gradient from "gradient-string";
import figlet from "figlet";
import fs from "fs/promises";
import {
  askInitGitRepoConfirmation,
  askInstallDependenciesConfirmation,
  askProjectAuthors,
  askProjectDescription,
  askProjectKeywords,
  askProjectLicense,
  askProjectName,
} from "./prompts/prompts";

const exec = util.promisify(execAsync);
const execInProject = (command: string) =>
  exec(command, { cwd: projectDirectory });

let projectName: string;
let projectDirectory: string;

async function init() {
  projectName = await askProjectName();
  projectDirectory = `./${projectName}`;

  await createProject();
  await editPackageJson();

  await execInProject("mkdir ./src");
  await execInProject("touch ./src/index.ts");

  await createTsConfig();
  await createGitIgnore();
  await createGithubActions();
  await createReadMe();

  const initGitRepoAnswer = await askInitGitRepoConfirmation();
  if (initGitRepoAnswer) {
    await execInProject("git init");
  }

  const installDepsAnswer = await askInstallDependenciesConfirmation();
  if (installDepsAnswer) {
    await execInProject("pnpm install");
    await execInProject("npx changeset init");
  }

  displayEndMessage();
}

async function createProject() {
  await fs.mkdir(projectDirectory);
  await execInProject("pnpm init");
}

async function editPackageJson() {
  const path = `${projectDirectory}/package.json`;

  const data = await fs.readFile(path, "utf8");
  const packageJson = JSON.parse(data);

  packageJson.license = await askProjectLicense();
  packageJson.description = await askProjectDescription();
  packageJson.author = undefined;
  packageJson.authors = await askProjectAuthors();
  packageJson.keywords = await askProjectKeywords();
  packageJson.version = "0.0.1";
  packageJson.type = "module";
  packageJson.main = "dist/index.js";
  packageJson.types = "dist/index.d.ts";

  packageJson.scripts = {
    build: "tsup src/index.ts --format esm --dts",
    dev: "tsup src/index.ts --format esm --dts --silent && node dist/index.js",
    lint: "tsc",
    release: "pnpm run build && changeset publish",
  };

  packageJson.devDependencies = {
    "@changesets/cli": "^2.27.1",
    tsup: "^8.0.1",
    typescript: "^5.3.3",
  };

  await fs.writeFile(path, JSON.stringify(packageJson, null, 2), "utf8");
}

async function createTsConfig() {
  const path = `${projectDirectory}/tsconfig.json`;

  const tsConfig = {
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      strict: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: "node",
      outDir: "dist",
      rootDir: "src",
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ["src"],
  };

  await fs.writeFile(path, JSON.stringify(tsConfig, null, 2), "utf8");
}

async function createGitIgnore() {
  const path = `${projectDirectory}/.gitignore`;

  const content = `node_modules
dist
`;

  await fs.writeFile(path, content, "utf8");
}

async function createGithubActions() {
  await fs.mkdir(`${projectDirectory}/.github`);
  await fs.mkdir(`${projectDirectory}/.github/workflows`);

  const mainWorkflowPath = `${projectDirectory}/.github/workflows/main.yml`;
  const mainWorkflow = `name: CI
on:
  push:
    branches:
      - "**"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 7
      - uses: actions/setup-node@v3
        with:
          node-version: 20.x
          cache: "pnpm"

      - run: pnpm install --no-frozen-lockfile
      - run: pnpm run lint && pnpm run build
`;

  const publishWorkflowPath = `${projectDirectory}/.github/workflows/publish.yml`;
  const publishWorkflow = `name: Publish
on:
  workflow_run:
    workflows: [CI]
    branches: [main]
    types: [completed]

concurrency: ${"${{ github.workflow }}"}-${"${{ github.ref }}"}

permissions:
  contents: write
  pull-requests: write

jobs:
  publish:
    if: ${"${{ github.event.workflow_run.conclusion == 'success' }}"}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 7
      - uses: actions/setup-node@v3
        with:
          node-version: 20.x
          cache: "pnpm"

      - run: pnpm install --no-frozen-lockfile
      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm run release
        env:
          GITHUB_TOKEN: ${"${{ secrets.GITHUB_TOKEN }}"}
          NPM_TOKEN: ${"${{ secrets.NPM_TOKEN }}"}
`;

  await fs.writeFile(mainWorkflowPath, mainWorkflow, "utf8");
  await fs.writeFile(publishWorkflowPath, publishWorkflow, "utf8");
}

async function createReadMe() {
  const data = await fs.readFile(`${projectDirectory}/package.json`, "utf8");
  const packageJson = JSON.parse(data);

  const path = `${projectDirectory}/README.md`;

  const content = `# ${packageJson.name}
  
${packageJson.description}
`;

  await fs.writeFile(path, content, "utf8");
}

function displayEndMessage() {
  console.clear();
  console.log(
    `\n\n${gradient.pastel.multiline(figlet.textSync("Project created!"))}\n\n`
  );
}

await init();
