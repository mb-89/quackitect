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
