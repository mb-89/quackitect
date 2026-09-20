// The rule holding the outside inside a door. One run of the real Vale proves
// the rule fires on a module, a Go file and the extension. Every path it
// stands off is read off the config's own sections in memory, because a
// section switching a rule off is what the rule reads there too.
// [[spec/design_output/doors#a-door-reads-the-outside]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { at, configSections, ruleAt, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const { ifVale, proves } = rulesIn(root);

const RULE = "OutsideInDoors";
const GUARD = "DoorsOnly";

const AT = "spec/config/styles/VoiceVale/OutsideInDoors.yml";

// Every root the approach names passes, and the rule file says so in one place. [[spec/design_output/doors#a-door-reads-the-outside]]
const ROOTS = [
  "src/scripts/cli-doors.js",
  "src/scripts/cli-check.js",
  "src/scripts/precommit.js",
  "src/scripts/prepush.js",
  "src/scripts/trust.js",
  "src/scripts/copilot.js",
  "src/scripts/editor.js",
  "src/bridge/server.js",
  "src/extension/extension.js",
  "src/extension/sidebar.js",
  ".claude/skills/level0/hooks/level0.js",
  "src/stub/.claude/skills/level0/hooks/bridgehead.js",
];

const READS = "const here = process.env.HOME;\n";
const ARGV = "const said = process.argv.slice(2);\n";
const PLATFORM = 'const win = process.platform === "win32";\n';
const SPAWN = 'import "os/exec"\n';
// The guard reads the raw line, so the fixture carries no import of its own. [[spec/design_output/private#a-fixture-carries-no-shape]]
const NODE = ['import { readFileSync } from "node', ':fs";\n'].join("");

const MODULE = "src/bridge/stop.js";
const EXTENSION = "src/extension/extension.js";

ifVale(
  "the rule refuses a module past a root reading the environment, and a Go file importing the command package",
  proves(
    {
      reads: at(READS, MODULE),
      argv: at(ARGV, MODULE),
      platform: at(PLATFORM, MODULE),
      spawn: at(SPAWN, "src/lsp/check.go"),
      node: at(NODE, EXTENSION),
    },
    (said) => {
      for (const key of ["reads", "argv", "platform", "spawn"])
        assert.ok(said.rules(key).includes(RULE), key);
      // The extension takes a section of its own, so the import guard holds where it stands. [[spec/design_output/doors#a-door-reads-the-outside]]
      assert.ok(said.rules("node").includes(GUARD));
    },
  ),
);

// The sections of the config, read once, because every case below reads them the way Vale does. [[spec/design_output/doors#a-door-reads-the-outside]]
const sections = configSections(root);
const off = (path) => ruleAt(sections, `VoiceVale.${RULE}`, path) === "NO";

test("the config holds the rule over a module and a Go file", () => {
  assert.equal(off(MODULE), false, MODULE);
  assert.equal(off("src/lsp/check.go"), false, "src/lsp/check.go");
  assert.equal(ruleAt(sections, `VoiceVale.${GUARD}`, EXTENSION), "YES", EXTENSION);
});

test("the config stands the rule off every root the approach names", () => {
  for (const where of ROOTS) assert.ok(off(where), where);
});

test("the config stands the rule off a door, a case, a Go door file and a note", () => {
  for (const where of [
    "src/doors/proc.js",
    "src/doors/fake/proc.js",
    "test/level0/work.test.js",
    "test/contract/proc.test.js",
    "src/lsp/door.go",
    "src/index/door.go",
    "notes.md",
  ]) {
    assert.ok(off(where), where);
  }
});

test("the rule stands in a file of its own, and one section a path names it", () => {
  assert.ok(files.exists(join(root, AT)), AT);
  const held = new Map();
  for (const one of sections) {
    if (!(`VoiceVale.${RULE}` in one.sets)) continue;
    held.set(one.head, (held.get(one.head) ?? 0) + 1);
  }
  assert.ok(held.size > 0, "the config names the rule");
  assert.deepEqual(
    [...held.entries()].filter(([, count]) => count > 1),
    [],
    "one section names it once",
  );
});
