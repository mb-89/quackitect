// The findings every front reads, driven through fake doors.
// [[spec/design_output/lsp]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { findingsOver } from "../../src/bridge/findings.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";

test("Vale runs through the process door where the hand carries a cache, and its fault comes back", async () => {
  const it = {
    disk: fakeDisk({ [join(ROOT, "notes.md")]: "# One\n" }),
    proc: fakeProc({ vale: { exitCode: 2, stderr: "no config" } }),
    join,
    root: ROOT,
    method: ROOT,
    work: ROOT,
    vale: "vale",
    valeCache: {},
  };
  assert.deepEqual(await findingsOver(it, ["."]), { found: [], fault: "no config" });
});
