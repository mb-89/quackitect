// The front door hands the note to se-front, and a box with no binary
// refuses the write and names the install.
// [[spec/tickets/go-writes-the-frontmatter]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/tools.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { front } from "../../src/doors/front.js";

const METHOD = "/tree";
// The door joins with the platform's separator, so the binary's path does too. [[spec/tickets/ci-runs-a-windows-job]]
const BINARY = join(METHOD, BIN, "se-front");
const NOTE = "---\nstate: open\n---\n\n# Ask\n";

test("a write refuses and names the install where the binary stands nowhere", () => {
  const proc = fakeProc({});
  assert.throws(
    () => front(fakeDisk(), proc, METHOD).set(NOTE, "state", "closed"),
    /no se-front stands on this box.*\.\/RUNME\.sh/s,
  );
  assert.deepEqual(proc.ran, []);
});

test("a binary that fails refuses the write and says what it said", () => {
  const disk = fakeDisk();
  disk.write(BINARY, "");
  const proc = fakeProc({
    [`${BINARY} drop state`]: { exitCode: 1, stderr: "it broke" },
  });
  assert.throws(() => front(disk, proc, METHOD).drop(NOTE, "state"), /it broke/);
});
