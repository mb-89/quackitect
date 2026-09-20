// The rule holding the outside inside a door, through the real Vale. The path
// Vale reads picks the section, so each case hands it the name of a file and
// reads the rules that answer.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;

const RULE = "OutsideInDoors";
const GUARD = "DoorsOnly";

// Every section the approach names stands the rule off, and one spelling names it. [[spec/design_output/doors#one-door-per-outside-thing]]
const STANDS_OFF = [
  "**/src/doors/*.js",
  "**/src/doors/fake/*.js",
  "**/.claude/skills/level0/hooks/*.js",
  "**/src/stub/.claude/skills/level0/hooks/*.js",
  "**/test/level0/*.js",
  "*.{md,markdown,txt}",
  "**/test/contract/*.js",
  "**/src/scripts/cli*.js",
  "**/src/bridge/server.js",
  "**/src/extension/*.js",
  "**/src/*/door.go",
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

ifVale("a module past a root reading the environment is refused", async () => {
  assert.ok((await ruledAt(READS, "src/bridge/stop.js")).includes(RULE));
  assert.ok((await ruledAt(ARGV, "src/bridge/stop.js")).includes(RULE));
  assert.ok((await ruledAt(PLATFORM, "src/bridge/stop.js")).includes(RULE));
});

ifVale("a door reading the environment passes", async () => {
  assert.ok(!(await ruledAt(READS, "src/doors/proc.js")).includes(RULE));
  assert.ok(!(await ruledAt(READS, "src/doors/fake/proc.js")).includes(RULE));
});

ifVale("a command root reading the environment passes", async () => {
  assert.ok(!(await ruledAt(READS, "src/scripts/cli-doors.js")).includes(RULE));
  assert.ok(!(await ruledAt(ARGV, "src/scripts/precommit.js")).includes(RULE));
  assert.ok(!(await ruledAt(ARGV, "src/scripts/trust.js")).includes(RULE));
  assert.ok(!(await ruledAt(READS, "src/bridge/server.js")).includes(RULE));
});

ifVale("a case reading the environment passes", async () => {
  assert.ok(!(await ruledAt(READS, "test/level0/work.test.js")).includes(RULE));
  assert.ok(!(await ruledAt(READS, "test/contract/proc.test.js")).includes(RULE));
});

ifVale("a Go file importing the command package is refused", async () => {
  assert.ok((await ruledAt(SPAWN, "src/lsp/check.go")).includes(RULE));
});

ifVale("a package's door file importing the command package passes", async () => {
  assert.ok(!(await ruledAt(SPAWN, "src/lsp/door.go")).includes(RULE));
  assert.ok(!(await ruledAt(SPAWN, "src/index/door.go")).includes(RULE));
});

ifVale("a note naming the read in prose passes", async () => {
  assert.ok(
    !(await ruledAt("The module reads `process.env` today.\n", "notes.md")).includes(
      RULE,
    ),
  );
});

// The extension takes a section of its own, so the import guard holds where it stands. [[spec/design_output/doors#one-door-per-outside-thing]]
ifVale("the extension passes the read and keeps its import guard", async () => {
  assert.ok(!(await ruledAt(PLATFORM, "src/extension/extension.js")).includes(RULE));
  assert.ok((await ruledAt(NODE, "src/extension/extension.js")).includes(GUARD));
});

test("each section standing the read off names the rule once", () => {
  const lines = files.read(join(root, ".vale.ini")).split("\n");
  let head = "";
  const held = new Map();
  for (const line of lines) {
    if (line.startsWith("[")) head = line.slice(1, line.indexOf("]"));
    if (line.trim() === `VoiceVale.${RULE} = NO`) {
      held.set(head, (held.get(head) ?? 0) + 1);
    }
  }
  assert.deepEqual([...held.keys()].sort(), [...STANDS_OFF].sort());
  assert.deepEqual([...held.values()].filter((one) => one > 1), []);
});
