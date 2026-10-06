// The write door reads the file as it stands after the edit, so a rule over
// the whole file reads the whole file, and an edit far from a header passes
// the way the header does.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { posix } from "node:path";
import { test } from "node:test";
import settings from "../../.claude/settings.json" with { type: "json" };
import { STARTING } from "../../.claude/skills/level0/hooks/level0.ts";
import { wholeAfter } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { boots, INSTALL_SKIP } from "../../src/scripts/boot.js";

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

// The session start brings the manifest to a cloud box lacking it, and the bridgehead the manifest loads brings the rest. [[spec/design_input/the-cloud-runs-itself#the-boot]]
const BOOT_ROOT = "/tree";
const INSTALL = `${BOOT_ROOT}/src/scripts/install.sh`;
const MANIFEST = `${BOOT_ROOT}/.claude/skills/level0/.claude-plugin/plugin.json`;
const CLOUD = { CLAUDE_CODE_REMOTE: "true" };
const STANDING = {
  [INSTALL]: "#!/usr/bin/env sh\necho installs\n",
  [MANIFEST]: "{}",
};

function booting(files, env = CLOUD) {
  const disk = fakeDisk(files);
  const proc = fakeProc({ [`sh ${INSTALL}`]: { exitCode: 0 } });
  return { it: { root: BOOT_ROOT, disk, proc, join: posix.join, env }, disk, proc };
}

const without = (path) =>
  Object.fromEntries(Object.entries(STANDING).filter(([at]) => at !== path));

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

// The hook takes its span in seconds, and the start road in milliseconds. [[spec/design_output/level0#the-boot-hook]]
test("the boot hook waits out the span the start road allows the same install", () => {
  const spans = (settings.hooks?.SessionStart ?? []).flatMap((one) =>
    (one.hooks ?? [])
      .filter((hook) => /src\/scripts\/boot\.js/.test(String(hook.command ?? "")))
      .map((hook) => Number(hook.timeout ?? 0) * 1000),
  );
  assert.ok(spans.length > 0, "a SessionStart hook runs src/scripts/boot.js");
  for (const span of spans)
    assert.ok(
      span >= STARTING,
      `the boot hook waits ${span} ms, and the start road allows ${STARTING}`,
    );
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot runs no install where the manifest stands", () => {
  const { it, proc } = booting(STANDING);
  assert.equal(boots(it), 0);
  assert.deepEqual(proc.ran, []);
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot runs the install under the skip list where the manifest stands nowhere", () => {
  const { it, proc } = booting(without(MANIFEST));
  assert.equal(boots(it), 0);
  assert.deepEqual(
    proc.ran.map((one) => one.argv.join(" ")),
    [`sh ${INSTALL}`],
  );
  assert.equal(proc.ran[0].init.env.SE_INSTALL_SKIP, INSTALL_SKIP);
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot runs nothing off a cloud box", () => {
  const { it, proc } = booting(without(MANIFEST), {});
  assert.equal(boots(it), 0);
  assert.deepEqual(proc.ran, []);
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot runs the install on a box SE_CLOUD marks", () => {
  const { it, proc } = booting(without(MANIFEST), { SE_CLOUD: "1" });
  assert.equal(boots(it), 0);
  assert.deepEqual(
    proc.ran.map((one) => one.argv.join(" ")),
    [`sh ${INSTALL}`],
  );
});

// [[spec/design_input/the-cloud-runs-itself#the-boot]]
test("boot answers 0 where the install fails", () => {
  const { it, proc } = booting(without(MANIFEST));
  proc.teach(["sh", INSTALL], { exitCode: 1, stderr: "no network" });
  assert.equal(boots(it), 0);
  assert.equal(proc.ran.length, 1);
});
