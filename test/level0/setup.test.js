// The setup verb: the install's steps that run JavaScript, on fake doors.
// [[spec/tickets/setup-verb-stands-red]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { EXTENSIONS } from "../../.claude/skills/level0/lib/servers.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { setup } from "../../src/scripts/verbs/setup.js";

const ROOT = "/tree";
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
    `node ${ROOT}/src/scripts/verbs/tools.js`,
    `node ${ROOT}/src/scripts/copilot.js setup auto`,
    `node ${ROOT}/src/scripts/brand.js`,
  ]);
  assert.deepEqual(it.said, [], "a box holding every item says nothing");

  const quiet = itOf({ [CLIENT]: "{}", [TOOLS]: "{}" }, answers);
  setup(quiet, []);
  assert.ok(
    !quiet.proc.ran.some((one) => lineOf(one).includes("verbs/tools.js")),
    "a survey standing, with nothing landed, runs no survey",
  );
});

// The setup runs before every verb, so a step that stops says a warning and the next one runs. [[spec/design_output/copilot#setup-and-discovery]]
test("a Copilot setup that stops says a warning, and the brand still runs", () => {
  const it = itOf({ [CLIENT]: "{}", [TOOLS]: "{}" }, { ...HELD, node: failing("copilot.js") });

  assert.equal(setup(it, []), 0);
  assert.ok(it.said.some((one) => one.includes("the copilot setup stopped")), "the stop names itself");
  assert.equal(lineOf(it.proc.ran.at(-1)), `node ${ROOT}/src/scripts/brand.js`);
});

// The browser is a want, so a box with no browser still runs every verb, and the drawing ships in git. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
test("the setup resolves a browser as a want, and bundles no drawing", () => {
  const it = itOf(
    { [CLIENT]: "{}", [TOOLS]: "{}" },
    { ...HELD, node: failing("browser.js"), npx: { exitCode: 1 } },
  );

  assert.equal(setup(it, []), 0);
  const lines = it.proc.ran.map(lineOf);
  assert.ok(lines.includes(`node ${ROOT}/src/scripts/browser.js`), "the want asks the resolver");
  assert.ok(lines.includes("npx --yes playwright-core install chromium"), "the want downloads");
  assert.ok(it.said.some((one) => one.includes("no browser here")), "the miss names what the box loses");
  assert.ok(!lines.some((one) => one.includes("bundle.js")), "no step bundles the drawing");
  assert.equal(lineOf(it.proc.ran.at(-1)), `node ${ROOT}/src/scripts/brand.js`, "the setup goes on");
});
