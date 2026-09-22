// The rule holding the outside inside a door, through the real Vale. The path
// Vale reads picks the section, so each case hands it the name of a file and
// reads the rules that answer.
// [[spec/design_output/doors#a-door-reads-the-outside]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/engine/tools.js";
import { it } from "../../src/scripts/cli-doors.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;

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

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const ruledAt = async (text, where) => {
  const said = await lintText(text, where, { run, bin });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((one) => one.rule);
};

const READS = "const here = process.env.HOME;\n";
const ARGV = "const said = process.argv.slice(2);\n";
const PLATFORM = 'const win = process.platform === "win32";\n';
const SPAWN = 'import "os/exec"\n';
// The guard reads the raw line, so the fixture carries no import of its own. [[spec/design_output/private#a-fixture-carries-no-shape]]
const NODE = ['import { readFileSync } from "node', ':fs";\n'].join("");

ifVale("the rule refuses a module past a root reading the environment", async () => {
  assert.ok((await ruledAt(READS, "src/bridge/stop.js")).includes(RULE));
  assert.ok((await ruledAt(ARGV, "src/bridge/stop.js")).includes(RULE));
  assert.ok((await ruledAt(PLATFORM, "src/bridge/stop.js")).includes(RULE));
});

ifVale("the rule passes a door reading the environment", async () => {
  assert.ok(!(await ruledAt(READS, "src/doors/proc.js")).includes(RULE));
  assert.ok(!(await ruledAt(READS, "src/doors/fake/proc.js")).includes(RULE));
});

ifVale("the rule passes every root the approach names", async () => {
  for (const where of ROOTS) {
    assert.ok(!(await ruledAt(READS, where)).includes(RULE), where);
    assert.ok(!(await ruledAt(ARGV, where)).includes(RULE), where);
    assert.ok(!(await ruledAt(PLATFORM, where)).includes(RULE), where);
  }
});

ifVale("the rule passes a case reading the environment", async () => {
  assert.ok(!(await ruledAt(READS, "test/level0/work.test.js")).includes(RULE));
  assert.ok(!(await ruledAt(READS, "test/contract/proc.test.js")).includes(RULE));
});

ifVale("the rule refuses a Go file importing the command package", async () => {
  assert.ok((await ruledAt(SPAWN, "src/lsp/check.go")).includes(RULE));
});

ifVale("the rule passes a door file importing the command package", async () => {
  assert.ok(!(await ruledAt(SPAWN, "src/lsp/door.go")).includes(RULE));
  assert.ok(!(await ruledAt(SPAWN, "src/index/door.go")).includes(RULE));
});

ifVale("the rule passes a note naming the read in prose", async () => {
  assert.ok(
    !(await ruledAt("The module reads `process.env` today.\n", "notes.md")).includes(
      RULE,
    ),
  );
});

// The extension takes a section of its own, so the import guard holds where it stands. [[spec/design_output/doors#a-door-reads-the-outside]]
ifVale("the extension passes the read and keeps its import guard", async () => {
  assert.ok(!(await ruledAt(PLATFORM, "src/extension/extension.js")).includes(RULE));
  assert.ok((await ruledAt(NODE, "src/extension/extension.js")).includes(GUARD));
});

test("the rule stands in a file of its own, and one section a path names it", () => {
  assert.ok(files.exists(join(root, AT)), AT);

  let head = "";
  const held = new Map();
  for (const line of files.read(join(root, ".vale.ini")).split("\n")) {
    if (line.startsWith("[")) head = line.slice(1, line.indexOf("]"));
    if (line.trim() !== `VoiceVale.${RULE} = NO`) continue;
    held.set(head, (held.get(head) ?? 0) + 1);
  }
  assert.ok(held.size > 0, "the config names the rule");
  assert.deepEqual(
    [...held.entries()].filter(([, count]) => count > 1),
    [],
    "one section names it once",
  );
});

// A Go package names the outside in its door.go, so an import of os anywhere else is a module reading the box in place. [[spec/tickets/a-door-holds-file-calls]]
const OS = 'import (\n\t"fmt"\n\t"os"\n)\n';
const OS_SIGNAL = 'import "os/signal"\n';

ifVale("the rule refuses a Go import of os outside the package's door", async () => {
  assert.ok((await ruledAt(OS, "src/lsp/tree.go")).includes(RULE));
  assert.ok((await ruledAt(OS_SIGNAL, "src/index/main.go")).includes(RULE));
  assert.ok((await ruledAt(OS, "src/engine/swap/swap.go")).includes(RULE));
});

ifVale("the rule passes the door of every Go package, and a Go case", async () => {
  for (const where of ["src/lsp/door.go", "src/index/door.go", "src/engine/swap/door.go"]) {
    assert.ok(!(await ruledAt(OS, where)).includes(RULE), where);
    assert.ok(!(await ruledAt(SPAWN, where)).includes(RULE), where);
  }
  assert.ok(!(await ruledAt(OS, "src/lsp/tree_test.go")).includes(RULE));
});

// A module reading the pid, the node version or the exec path in place takes the box into every case of it. [[spec/design_output/doors#a-door-reads-the-outside]]
const PID = "const owner = String(process.pid);\n";
const VERSION = 'const node = process.version.replace(/^v/, "");\n';
const EXEC = "const argv = [process.execPath, script];\n";

ifVale("the rule refuses a module past a root reading the pid, the version or the exec path", async () => {
  assert.ok((await ruledAt(PID, "src/scripts/vehicle.js")).includes(RULE));
  assert.ok((await ruledAt(VERSION, "src/bridge/review.js")).includes(RULE));
  assert.ok((await ruledAt(EXEC, "src/bridge/review.js")).includes(RULE));
});

ifVale("the rule passes every root and every door reading the three", async () => {
  for (const where of [...ROOTS, "src/doors/session.js", "src/doors/fake/proc.js"]) {
    assert.ok(!(await ruledAt(PID, where)).includes(RULE), where);
    assert.ok(!(await ruledAt(VERSION, where)).includes(RULE), where);
    assert.ok(!(await ruledAt(EXEC, where)).includes(RULE), where);
  }
});

// The hand the command root builds carries the pid and the node path, so a module past it reads neither in place. [[spec/design_output/doors#a-door-reads-the-outside]]
test("the hand a root builds carries the pid and the node path", () => {
  assert.equal(typeof it.pid, "number");
  assert.equal(typeof it.node, "string");
  assert.ok(it.node.length > 0);
});
