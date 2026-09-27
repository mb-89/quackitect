// A produced vehicle stands on its own: its own identity, its own roots, and
// no path reaching back to the tree it came out of. It runs off a fixture root
// holding the marker, the run script, the package and a private folder, so a
// case copies a handful of files in place of the whole method.
// [[spec/design_output/vehicle#a-vehicle-stands-alone]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { IDENTITY, MARKER } from "../../.claude/skills/level0/lib/vehicle.js";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { identityHere, produce, rootsHere } from "../../src/scripts/vehicle.js";

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
const slashed = (path) => String(path).split("\\").join("/");

// The fixture's files that travel, and the private one that stays behind. [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
const TRAVELS = [MARKER, "RUNME.sh", "package.json"];
const PRIVATE = ".se/held.md";

// One fixture and one vehicle serve every case, and the cases read them in order. [[spec/design_output/vehicle#a-vehicle-stands-alone]]
const where = files.tempDir("vehicle-");
const method = join(where, "method");
const dest = join(where, "vehicle");
after(() => files.remove(where));

for (const path of [...TRAVELS, PRIVATE]) {
  files.makeDir(dirname(join(method, path)));
  files.write(join(method, path), path === "RUNME.sh" ? "#!/bin/sh\n" : "{}\n");
}
files.runnable(join(method, "RUNME.sh"));

test("a vehicle carries the fixture's marker and run bits, and leaves its private folder behind", () => {
  const put = produce(files, method, dest);
  assert.equal(put.ok, true, put.why);
  assert.equal(put.count, TRAVELS.length, "the files that travel, and no more");

  for (const path of TRAVELS) {
    assert.ok(files.exists(join(dest, path)), `${path} travels`);
  }
  assert.equal(files.exists(join(dest, ".se")), false, ".se stays behind");

  const ran = outside.run([SHELL, "-c", "test -x RUNME.sh"], { cwd: dest });
  assert.equal(ran.exitCode, 0, "RUNME.sh comes over runnable");
});

// Another hand made the method's identity, so it carries another pid, and two ids made in one millisecond stand apart. [[spec/design_output/vehicle#what-a-vehicle-needs]]
test("a vehicle makes an identity of its own", () => {
  const mine = identityHere(files, clock(), method, process.pid + 1);
  const other = identityHere(files, clock(), dest, process.pid);

  assert.ok(other, "the vehicle answers an identity");
  assert.ok(files.exists(join(dest, IDENTITY)), "and writes it inside itself");
  assert.notEqual(
    other,
    mine,
    "a vehicle holds its own, and never the one it came from",
  );
  assert.equal(identityHere(files, clock(), dest, process.pid), other, "and keeps it");
});

// The vehicle verb reads its roots through `rootsHere`, so the roots it answers are the verb's. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
test("a vehicle names itself as method and work, with no tree behind it", () => {
  const pair = rootsHere(files, {}, dest);

  assert.equal(slashed(pair.method), slashed(dest), "it names itself as method");
  assert.equal(slashed(pair.work), slashed(dest), "and as work");
  assert.equal(pair.itself, true, "it drives itself");
  for (const path of [root, method]) {
    assert.equal(
      JSON.stringify(pair).includes(slashed(path)),
      false,
      `nothing in the answer reaches ${path}`,
    );
  }
});
