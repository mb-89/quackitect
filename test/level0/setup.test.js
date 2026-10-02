// The setup verb: the install's steps that run JavaScript, on fake doors.
// [[spec/tickets/setup-verb-stands-red]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { EXTENSIONS } from "../../.claude/skills/level0/lib/servers.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { setup } from "../../src/scripts/verbs/setup.js";

const ROOT = "/tree";
// A script under the tree, joined the way the setup joins it, so the line reads alike on Windows. [[spec/tickets/setup-reaches-windows-shims]]
const script = (...parts) => join(ROOT, "src", "scripts", ...parts);
const HOME = "/home/nobody";
const CLIENT = `${ROOT}/src/extension/node_modules/vscode-languageclient/package.json`;
const TOOLS = `${ROOT}/${RUN}/tools.json`;

function itOf(seed, answers, env = {}) {
  const said = [];
  return {
    root: ROOT,
    node: "node",
    env: { HOME, ...env },
    disk: fakeDisk(seed),
    proc: fakeProc(answers),
    say: (line) => said.push(line),
    said,
  };
}

const lineOf = (ran) => ran.argv.join(" ");

const HELD = {
  "code --list-extensions": { stdout: EXTENSIONS.join("\n") },
};

function failing(name) {
  return (argv) => ({ exitCode: argv.some((one) => one.endsWith(name)) ? 1 : 0 });
}

test("the setup gets each missing item, and skips the ones SE_INSTALL_SKIP names", () => {
  let it;
  it = itOf(
    { [`${HOME}/.vscode/extensions/extensions.json`]: "[]", [TOOLS]: "{}" },
    {
      node: { exitCode: 1 },
      npm: () => {
        it.disk.write(CLIENT, "{}");
        return { exitCode: 0 };
      },
      "code --list-extensions": { stdout: "" },
      code: { exitCode: 0 },
    },
    { SE_INSTALL_SKIP: "browser editor-link" },
  );

  setup(it, []);

  const lines = it.proc.ran.map(lineOf);
  assert.ok(lines.includes("npm install --no-audit --no-fund --silent"), "the client installs");
  for (const id of EXTENSIONS) {
    assert.ok(lines.includes(`code --install-extension ${id} --force`), `${id} installs`);
  }
  assert.ok(!lines.some((one) => one.includes("browser.js")), "the browser stands skipped");
  assert.ok(!lines.some((one) => one.includes("playwright")), "no browser downloads");
  assert.ok(!lines.some((one) => one.includes("editor.js")), "the editor link stands skipped");
  assert.ok(it.said.some((one) => one.startsWith("editor-client:")), "the client names why");
  assert.ok(!it.said.some((one) => one.startsWith("browser:")), "a skipped item names nothing");
});

test("the setup writes the survey, then runs the Copilot setup and the brand", () => {
  const answers = {
    node: { exitCode: 0 },
    "code --list-extensions": { stdout: EXTENSIONS.join("\n") },
  };
  const it = itOf({ [CLIENT]: "{}", [TOOLS]: "{}" }, answers);

  setup(it, ["--landed"]);

  assert.deepEqual(it.proc.ran.slice(-3).map(lineOf), [
    `node ${script("verbs", "tools.js")}`,
    `node ${script("copilot.js")} setup auto`,
    `node ${script("brand.js")}`,
  ]);
  assert.deepEqual(it.said, [], "a box holding every item says nothing");

  const quiet = itOf({ [CLIENT]: "{}", [TOOLS]: "{}" }, answers);
  setup(quiet, []);
  assert.ok(
    !quiet.proc.ran.some((one) => lineOf(one).includes("verbs/tools.js")),
    "a survey standing, with nothing landed, runs no survey",
  );
});

// A box with no code on the PATH skips the extensions, and a code that answers an error still installs them. [[spec/tickets/code-failure-reads-missing]]
test("a code list exiting past zero reads as missing, and the setup installs the extensions", () => {
  const it = itOf(
    { [CLIENT]: "{}", [TOOLS]: "{}" },
    { node: { exitCode: 0 }, "code --list-extensions": { exitCode: 1 }, code: { exitCode: 0 } },
  );

  setup(it, []);

  const lines = it.proc.ran.map(lineOf);
  for (const id of EXTENSIONS) {
    assert.ok(lines.includes(`code --install-extension ${id} --force`), `${id} installs`);
  }
});

// Windows ships the three as cmd shims, so the setup reaches each through cmd. [[spec/tickets/setup-reaches-windows-shims]]
test("on Windows the setup reaches npm, npx and code through cmd, and node itself", () => {
  const it = itOf(
    {},
    {
      node: failing("browser.js"),
      "cmd /c code --list-extensions": { stdout: "" },
      cmd: { exitCode: 0 },
    },
  );
  it.windows = true;

  setup(it, []);

  const lines = it.proc.ran.map(lineOf);
  assert.ok(lines.includes("cmd /c npm install --no-audit --no-fund --silent"), "npm runs through cmd");
  assert.ok(lines.includes("cmd /c npx --yes playwright-core install chromium"), "npx runs through cmd");
  assert.ok(lines.includes(`cmd /c code --install-extension ${EXTENSIONS[0]} --force`), "code runs through cmd");
  assert.ok(lines.includes(`node ${script("browser.js")}`), "node runs as it stands");
});

// cmd answers its own exit where no code stands, and that reads as no code. [[spec/tickets/windows-missing-code-reads-absent]]
test("on Windows a cmd answering no such command reads as no code, and the setup installs no extension", () => {
  const it = itOf(
    { [CLIENT]: "{}", [TOOLS]: "{}" },
    { node: { exitCode: 0 }, "cmd /c code --list-extensions": { exitCode: 9009 }, cmd: { exitCode: 0 } },
  );
  it.windows = true;

  setup(it, []);

  assert.ok(!it.proc.ran.some((one) => lineOf(one).includes("--install-extension")), "no extension installs");
  assert.ok(!it.said.some((one) => one.startsWith("editor-extensions:")), "the item stands here");
});

// The setup runs before every verb, so a step that stops says a warning and the next one runs. [[spec/design_output/copilot#setup-and-discovery]]
test("a Copilot setup that stops says a warning, and the brand still runs", () => {
  const it = itOf({ [CLIENT]: "{}", [TOOLS]: "{}" }, { ...HELD, node: failing("copilot.js") });

  assert.equal(setup(it, []), 0);
  assert.ok(it.said.some((one) => one.includes("the copilot setup stopped")), "the stop names itself");
  assert.equal(lineOf(it.proc.ran.at(-1)), `node ${script("brand.js")}`);
});

// The browser is a want, so a box with no browser still runs every verb, and the drawing ships in git. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
test("the setup resolves a browser as a want, and bundles no drawing", () => {
  const it = itOf(
    { [CLIENT]: "{}", [TOOLS]: "{}" },
    { ...HELD, node: failing("browser.js"), npx: { exitCode: 1 } },
  );

  assert.equal(setup(it, []), 0);
  const lines = it.proc.ran.map(lineOf);
  assert.ok(lines.includes(`node ${script("browser.js")}`), "the want asks the resolver");
  assert.ok(lines.includes("npx --yes playwright-core install chromium"), "the want downloads");
  assert.ok(it.said.some((one) => one.includes("no browser here")), "the miss names what the box loses");
  assert.ok(!lines.some((one) => one.includes("bundle.js")), "no step bundles the drawing");
  assert.equal(lineOf(it.proc.ran.at(-1)), `node ${script("brand.js")}`, "the setup goes on");
});
