// The write door reads the file as it stands after the edit, so a rule over
// the whole file reads the whole file, and an edit far from a header passes
// the way the header does.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { posix } from "node:path";
import settings from "../../.claude/settings.json" with { type: "json" };
import { test } from "node:test";
import { wholeAfter } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { boots, stampOf } from "../../src/scripts/boot.js";

const PATH = "/tree/spec/vocabulary/terms.yml";
const WAS = [
  "# The terms: the words this tree writes past the core.",
  "",
  "terms:",
  '  - {word: shim, means: "a script that finds the vehicle"}',
  '  - {word: stub, means: "a bare project"}',
  "",
].join("\n");

test("an edit far from the header reads as the whole file with the edit in place", () => {
  const disk = fakeDisk({ [PATH]: WAS });
  const e = {
    tool: "Edit",
    file_path: PATH,
    old_string: '  - {word: stub, means: "a bare project"}',
    new_string: '  - {word: stub, means: "a bare project the vehicle drives"}',
  };
  const whole = wholeAfter(e, { path: PATH, text: e.new_string }, disk);
  assert.ok(whole.startsWith("# The terms"), "the header stands, far above the edit");
  assert.match(whole, /a bare project the vehicle drives/);
  assert.equal(
    whole.split("\n").length,
    WAS.split("\n").length,
    "one line changed, none added",
  );
});

test("a multi-edit applies every edit in order, and a write is the text itself", () => {
  const disk = fakeDisk({ [PATH]: WAS });
  const e = {
    tool: "MultiEdit",
    file_path: PATH,
    edits: [
      { old_string: "word: shim", new_string: "word: shimmed" },
      { old_string: "word: stub", new_string: "word: stubbed" },
    ],
  };
  const whole = wholeAfter(e, { path: PATH, text: "" }, disk);
  assert.match(whole, /word: shimmed/);
  assert.match(whole, /word: stubbed/);
  assert.equal(
    wholeAfter({ tool: "Write", file_path: PATH }, { path: PATH, text: "fresh" }, disk),
    "fresh",
  );
});

test("an edit to a file nobody wrote yet reads as the new text alone", () => {
  const disk = fakeDisk({});
  const e = { tool: "Edit", file_path: PATH, old_string: "a", new_string: "b" };
  assert.equal(wholeAfter(e, { path: PATH, text: "b" }, disk), "b");
});

// The session start installs what the tree needs, and a box where it all stands pays nothing. [[spec/design_input/the-cloud-runs-itself#the-boot]]
const BOOT_ROOT = "/tree";
const INSTALL = `${BOOT_ROOT}/src/scripts/install.sh`;
const STAMP_AT = `${BOOT_ROOT}/.se/.runtime/boot.json`;
const STANDING = {
  [INSTALL]: "#!/usr/bin/env sh\necho installs\n",
  [`${BOOT_ROOT}/.claude/skills/level0/.claude-plugin/plugin.json`]: "{}",
  [`${BOOT_ROOT}/node_modules/wink-nlp/package.json`]: "{}",
};

function booting(files) {
  const disk = fakeDisk(files);
  const proc = fakeProc({ [`sh ${INSTALL}`]: { exitCode: 0 } });
  return { it: { root: BOOT_ROOT, disk, proc, join: posix.join, env: {} }, disk, proc };
}

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("the project settings carry a SessionStart hook running src/scripts/boot.js", () => {
  const said = settings;
  const commands = (said.hooks?.SessionStart ?? []).flatMap((one) =>
    (one.hooks ?? []).map((hook) => String(hook.command ?? "")),
  );
  assert.ok(
    commands.some((one) => /^node \S*src\/scripts\/boot\.js\S*$/.test(one)),
    `a SessionStart hook runs node over src/scripts/boot.js, and these stand: ${JSON.stringify(commands)}`,
  );
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot runs no install where the stamp matches and every tool stands", () => {
  const { it, proc } = booting({
    ...STANDING,
    [STAMP_AT]: JSON.stringify({ install: stampOf(STANDING[INSTALL]) }),
  });
  assert.equal(boots(it), 0);
  assert.deepEqual(proc.ran, []);
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot runs the install under the skip list, and writes the stamp, where the stamp is stale", () => {
  const { it, proc, disk } = booting({
    ...STANDING,
    [STAMP_AT]: JSON.stringify({ install: "old" }),
  });
  assert.equal(boots(it), 0);
  assert.deepEqual(
    proc.ran.map((one) => one.argv.join(" ")),
    [`sh ${INSTALL}`],
  );
  assert.equal(
    proc.ran[0].init.env.SE_INSTALL_SKIP,
    "editor-link editor-extensions editor-client go index se-lsp",
  );
  assert.equal(JSON.parse(disk.read(STAMP_AT)).install, stampOf(STANDING[INSTALL]));
  assert.notEqual(stampOf(STANDING[INSTALL]), "", "the stamp holds a hash");
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot answers 0 where the install fails, and writes no stamp", () => {
  const { it, proc, disk } = booting({ ...STANDING });
  proc.teach(["sh", INSTALL], { exitCode: 1, stderr: "no network" });
  assert.equal(boots(it), 0);
  assert.equal(proc.ran.length, 1);
  assert.equal(disk.exists(STAMP_AT), false);
});
