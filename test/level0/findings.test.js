// The findings every front reads, driven through fake doors. The check and the
// problems panel read this one list, so a rule reaches both or neither.
// [[spec/design_output/lsp]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { FROM, findingsOver } from "../../src/bridge/findings.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const LOOSE_NUMBER = "package main\n\nfunc one() int {\n\treturn 7\n}\n";

function doors(answers = {}) {
  return {
    disk: fakeDisk({
      [join(ROOT, "src/one/one.go")]: LOOSE_NUMBER,
      [join(ROOT, "notes.md")]: "# One\n",
    }),
    proc: fakeProc({ vale: { stdout: "{}" }, biome: { stdout: "{}" }, ...answers }),
    join,
    root: ROOT,
    vale: "vale",
    biome: "biome",
    ceilings: { function: 150, file: 600 },
  };
}

test("a rule written in JavaScript reaches the list, named by the front it comes from", async () => {
  const got = await findingsOver(doors(), ["."]);

  assert.equal(got.fault, "");
  const loose = got.found.find((one) => one.rule === "MagicNumber");
  assert.ok(loose, "the loose number stands in the list");
  assert.equal(loose.file, "src/one/one.go");
  assert.equal(loose.source, FROM.tree);
});

test("Vale reading nothing is the fault, and the list stays empty", async () => {
  const got = await findingsOver(
    doors({ vale: { exitCode: 2, stderr: "no config" } }),
    ["."],
  );

  assert.equal(got.fault, "no config");
  assert.deepEqual(got.found, []);
});

// [[spec/design_output/level0#a-crash-writes-its-error]]
test("a path the disk no longer holds reads as no finding, and throws nothing", async () => {
  const got = await findingsOver(doors(), ["HANDOVER.md"]);

  assert.equal(got.fault, "");
  assert.deepEqual(got.found, []);
});
