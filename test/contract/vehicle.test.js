// A produced vehicle stands on its own: its own identity, its own verbs, and
// no path reaching back to the tree it came out of. It runs over a fake
// install, so it reaches no network, no editor and no home of a person.
// [[spec/design_output/vehicle#a-vehicle-stands-alone]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { identityHere, produce } from "../../src/scripts/vehicle.js";
import { FETCHING } from "./fetching.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();

// [[spec/design_output/vehicle#a-vehicle-stands-alone]]
const GIT_BASH = [
  `${process.env.ProgramFiles}\\Git\\bin\\bash.exe`,
  `${process.env["ProgramFiles(x86)"]}\\Git\\bin\\bash.exe`,
  `${process.env.LocalAppData}\\Programs\\Git\\bin\\bash.exe`,
];
const SHELL =
  process.platform === "win32"
    ? (GIT_BASH.find((one) => files.exists(one)) ?? "bash")
    : "sh";
const quoted = (said) => String(said).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const either = (path) => `(?:${quoted(path)}|${quoted(path.split("\\").join("/"))})`;

// One vehicle serves every case, because producing one writes every file of the method, and the cases read it in order. [[spec/design_output/vehicle#a-vehicle-stands-alone]]
const where = files.tempDir("vehicle-");
const dest = join(where, "vehicle");
after(() => files.remove(where));

test("a vehicle carries the method, its run bits, and no private material", () => {
  const put = produce(files, root, dest);
  assert.equal(put.ok, true);
  assert.ok(put.count > 100, `a whole method comes over, and this says ${put.count}`);

  for (const path of ["RUNME.sh", "package.json", ".vale.ini"]) {
    assert.ok(files.exists(join(dest, path)), `${path} travels`);
  }
  assert.ok(
    files.exists(join(dest, ".claude/skills/level0/.claude-plugin/plugin.json")),
    "the vehicle carries the marker, so it reads as a method root",
  );
  for (const path of [".git", ".se", "node_modules"]) {
    assert.equal(files.exists(join(dest, path)), false, `${path} stays behind`);
  }

  const ran = outside.run([SHELL, "-c", "test -x RUNME.sh"], { cwd: dest });
  assert.equal(ran.exitCode, 0, "RUNME.sh comes over runnable");
});

test("a vehicle makes an identity of its own", () => {
  const mine = identityHere(files, clock(), root);
  const other = identityHere(files, clock(), dest);

  assert.ok(other, "the vehicle answers an identity");
  assert.notEqual(other, mine, "a vehicle holds its own, and never the one it came from");
  assert.equal(identityHere(files, clock(), dest), other, "and keeps it");
});

// The vehicle borrows the method's modules through a link and the survey this box wrote, so its install fetches nothing and probes nothing. [[spec/design_output/vehicle#a-vehicle-stands-alone]]
function fakeInstall(dest) {
  files.link(join(root, "node_modules"), join(dest, "node_modules"));
  files.makeDir(dirname(join(dest, ...TOOLS.split("/"))));
  files.copy(join(root, ...TOOLS.split("/")), join(dest, ...TOOLS.split("/")));
}

test("a vehicle answers its own verbs, with no tree behind it", () => {
  fakeInstall(dest);

  // [[spec/design_output/vehicle#a-vehicle-stands-alone]]
  const home = join(where, "home");
  files.makeDir(join(home, ".vscode", "extensions"));
  const said = outside.run([SHELL, "RUNME.sh", "vehicle"], {
    cwd: dest,
    env: { HOME: home, USERPROFILE: home, SE_INSTALL_SKIP: FETCHING },
  });
  assert.equal(said.exitCode, 0, said.stderr);
  assert.match(
    said.stdout,
    new RegExp(`method\\s+${either(dest)}`),
    "it names itself as method",
  );
  assert.match(said.stdout, new RegExp(`work\\s+${either(dest)}`), "and as work");
  assert.match(said.stdout, /drives itself/);
  assert.equal(
    said.stdout.includes(root),
    false,
    "nothing in the answer reaches the tree it came from",
  );
});
