// The shell door over the bless: a command naming the bless file, a command
// setting a variable naming the hand or the box, and a script under .se doing
// either, all come back refused.
// [[spec/design_output/pull#the-bless]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { HARNESS } from "../../src/scripts/pull-hand-of.js";
import { NAMED, named } from "./fixtures.js";

const ROOT = "/tree";
const BLESS_FILE = ".se/.runtime/bless.json";

function box(seed = {}) {
  return {
    env: {},
    disk: fakeDisk({ ...named(ROOT), ...seed }),
    proc: fakeProc({}),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");
const run = (command, seed) =>
  onBash({ command, description: `${NAMED}: runs a command` }, box(seed));

// [[spec/design_output/pull#the-bless]]
test("the shell door refuses a command naming the bless file", async () => {
  for (const command of [
    `cat ${BLESS_FILE}`,
    `echo '{"agent": true}' > ${BLESS_FILE}`,
    `cp /tmp/yes.json ${BLESS_FILE}`,
    `rm ${BLESS_FILE}`,
  ]) {
    assert.match(denied(await run(command)), /bless\.json/, command);
  }
});

// [[spec/design_output/pull#the-bless]]
test("the shell door refuses a command setting, exporting, unsetting or clearing a harness variable", async () => {
  assert.ok(HARNESS.length, "the list names the variables");
  for (const [name] of HARNESS) {
    for (const command of [
      `${name}= ./RUNME.sh ticket bless a-ticket`,
      `${name}=1 ./RUNME.sh ticket bless a-ticket`,
      `export ${name}=1`,
      `unset ${name}`,
      `env -u ${name} ./RUNME.sh ticket bless a-ticket`,
    ]) {
      assert.match(denied(await run(command)), new RegExp(name), command);
    }
  }
});

// [[spec/tickets/bless-guard-reads-scripts]]
test("the shell door refuses a script under .se that writes the bless file", async () => {
  const said = await run("node .se/scripts/x.js", {
    [`${ROOT}/.se/scripts/x.js`]: `require("fs").writeFileSync("${BLESS_FILE}", '{"agent": true}');\n`,
  });
  assert.match(denied(said), /bless\.json/);
});

// [[spec/tickets/bless-guard-reads-scripts]]
test("the shell door refuses a script under .se that clears a harness variable", async () => {
  const said = await run("node .se/scripts/y.js", {
    [`${ROOT}/.se/scripts/y.js`]:
      'delete process.env.CLAUDECODE;\nrequire("child_process").execSync("./RUNME.sh ticket bless a-ticket");\n',
  });
  assert.match(denied(said), /CLAUDECODE/);

  const shell = await run("bash .se/scripts/z.sh", {
    [`${ROOT}/.se/scripts/z.sh`]:
      "unset CLAUDECODE\n./RUNME.sh ticket bless a-ticket\n",
  });
  assert.match(denied(shell), /CLAUDECODE/);
});

// [[spec/design_output/pull#the-bless]]
test("a plain command, a read of a harness variable and a script writing under .se pass", async () => {
  for (const command of ["git status", "ls .se/scripts", "printenv CLAUDECODE"]) {
    assert.equal(denied(await run(command)), "", command);
  }
  const said = await run("node .se/scripts/ok.js", {
    [`${ROOT}/.se/scripts/ok.js`]:
      'require("fs").writeFileSync(".se/scripts/out.txt", "one");\n',
  });
  assert.equal(denied(said), "");
});
