// The rule holding the outside inside a door. The tree's rules prove it fires
// on a module, a Go file and the extension, and stands off every path a door
// or a root holds, read through the same door the write door reads.
// [[spec/design_output/doors#a-door-reads-the-outside]] [[spec/tickets/vale-leaves-the-tree]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { it } from "../../src/scripts/cli-doors.js";
import { at, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const { ifRules, proves, read } = rulesIn(root);

const RULE = "OutsideInDoors";
const GUARD = "DoorsOnly";

const AT = "spec/config/styles/VoiceVale/OutsideInDoors.yml";

// Every root the approach names passes, and the rule file says so in one place. [[spec/design_output/doors#a-door-reads-the-outside]]
const ROOTS = [
  "src/scripts/cli-doors.js",
  "src/scripts/precommit.js",
  "src/scripts/prepush.js",
  "src/scripts/trust.js",
  "src/scripts/copilot.js",
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

const MODULE = "src/bridge/findings.js";
const EXTENSION = "src/extension/extension.js";

ifRules(
  "the rule refuses a module past a root reading the environment, and a Go file importing the command package",
  proves(
    {
      reads: at(READS, MODULE),
      argv: at(ARGV, MODULE),
      platform: at(PLATFORM, MODULE),
      spawn: at(SPAWN, "src/index/answers.go"),
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

// Whether the rule fires on a path, over a text that breaks it there: a Go import for a Go file, an environment read for the rest. [[spec/design_output/doors#a-door-reads-the-outside]]
const fires = (path, rule = RULE) =>
  read(path.endsWith(".go") ? SPAWN : READS, path).some((one) => one.rule === rule);
const off = (path) => !fires(path);

ifRules("the rules hold the rule over a module and a Go file, and the guard over the extension", () => {
  assert.equal(off(MODULE), false, MODULE);
  assert.equal(off("src/index/answers.go"), false, "src/index/answers.go");
  assert.ok(read(NODE, EXTENSION).some((one) => one.rule === GUARD), EXTENSION);
});

ifRules("the rules stand the rule off every root the approach names", () => {
  for (const where of ROOTS) assert.ok(off(where), where);
});

ifRules("the rules stand the rule off a door, a case, a Go door file and a note", () => {
  for (const where of [
    "src/doors/proc.js",
    "src/doors/fake/proc.js",
    "test/level0/work.test.js",
    "test/contract/proc.test.js",
    "src/index/door.go",
    "notes.md",
  ]) {
    assert.ok(off(where), where);
  }
});

ifRules("the rule stands in a file of its own", () => {
  assert.ok(files.exists(join(root, AT)), AT);
});

// A Go package names the outside in its door.go, so an import of os anywhere else is a module reading the box in place. [[spec/tickets/a-door-holds-file-calls]]
const OS = 'import (\n\t"fmt"\n\t"os"\n)\n';
const OS_SIGNAL = 'import "os/signal"\n';

// A module reading the pid, the node version or the exec path in place takes the box into every case of it. [[spec/design_output/doors#a-door-reads-the-outside]]
const PID = "const owner = String(process.pid);\n";
const VERSION = 'const node = process.version.replace(/^v/, "");\n';
const EXEC = "const argv = [process.execPath, script];\n";

ifRules(
  "the rule refuses a Go import of os outside the package's door, and a module past a root reading the pid, the version or the exec path",
  proves(
    {
      os: at(OS, "src/front/mint.go"),
      signal: at(OS_SIGNAL, "src/index/main.go"),
      swap: at(OS, "src/engine/swap/swap.go"),
      pid: at(PID, "src/scripts/vehicle.js"),
      version: at(VERSION, "src/bridge/review.js"),
      exec: at(EXEC, "src/bridge/review.js"),
    },
    (said) => {
      for (const key of ["os", "signal", "swap", "pid", "version", "exec"])
        assert.ok(said.rules(key).includes(RULE), key);
    },
  ),
);

ifRules("the rules stand the rule off every Go door, a Go case, and every door reading the pid, the version or the exec path", () => {
  for (const where of [
    "src/engine/swap/door.go",
    "src/front/front_test.go",
    "src/doors/session.js",
  ]) {
    assert.ok(off(where), where);
  }
});

// The hand the command root builds carries the pid and the node path, so a module past it reads neither in place. [[spec/design_output/doors#a-door-reads-the-outside]]
test("the hand a root builds carries the pid and the node path", () => {
  assert.equal(typeof it.pid, "number");
  assert.equal(typeof it.node, "string");
  assert.ok(it.node.length > 0);
});

// The stale read asks the index for the hash of a note, so the hand a root builds carries the index door. [[spec/design_output/pull#an-input-marks-its-steps]]
test("the hand a root builds carries an index door that answers a question", () => {
  assert.equal(typeof it.index?.ask, "function");
  assert.equal(typeof it.index?.dead, "function");
});
