// The mint verb, run as a hand runs it: a ticket off a handover line opens its
// Ask on the line the owner's read reads.
// [[spec/tickets/the-owners-words-travel-verbatim]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const PATH = ".se/scripts/cli-mint-probe.md";

test("a mint under --from=handover writes the from line at the head of the Ask", () => {
  const files = disk();
  const at = join(root, ...PATH.split("/"));
  if (files.exists(at)) files.remove(at);
  try {
    const ran = proc().run(
      [
        process.execPath,
        join(root, "src", "scripts", "cli.js"),
        "mint",
        "ticket",
        PATH,
        "--process=standard",
        "--from=handover",
      ],
      { cwd: root },
    );
    assert.equal(ran.exitCode, 0, ran.stdout + ran.stderr);
    assert.match(files.read(at), /^# Ask\n\nfrom: handover\n/m);
  } finally {
    if (files.exists(at)) files.remove(at);
  }
});
