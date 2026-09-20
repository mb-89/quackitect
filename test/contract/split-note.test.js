// The command the code door runs on a ceiling refusal, driven for real. A fake
// answering every argv the same hid a refusal the verb gives, so this one runs
// the verb.
// [[spec/design_output/level0#the-refusal-parks-the-work]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { noteFor, splitTicket } from "../../src/bridge/split-ticket.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const SOURCE = "src/scripts/a-file-past-the-ceiling.js";

test("the door's own command writes a private ticket, and says where it stands", () => {
  const files = disk();
  const at = join(root, noteFor(SOURCE));
  if (files.exists(at)) files.remove(at);

  try {
    const said = splitTicket({ root, disk: files, proc: proc(), node: "node" }, SOURCE);

    assert.match(said, /parks this cut/, `the verb answers: ${said}`);
    assert.ok(files.exists(at), "the private ticket stands on this box");
    assert.match(files.read(at), /past the file ceiling/);

    const again = splitTicket(
      { root, disk: files, proc: proc(), node: "node" },
      SOURCE,
    );
    assert.match(again, /names this cut already/);
  } finally {
    if (files.exists(at)) files.remove(at);
  }
});
