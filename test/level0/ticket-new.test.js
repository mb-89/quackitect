// The ticket verb's new: the bare ticket New ticket used to write, now the
// verb's to write, where no file stands.
// [[spec/tickets/the-sidebar-writes-through-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { ticket } from "../../src/scripts/ticket.js";
import { at, deskDoors, heard } from "./pull-doors.js";

const PATH = "spec/tickets/a-new-one.md";
const STANDING = [
  "---",
  "kind: [[ticket]]",
  "process: [[spec/processes/trivial]]",
  "---",
  "",
  "# Ask",
  "",
  "A line the owner wrote.",
  "",
].join("\n");

async function ran(files) {
  const { it, disk } = deskDoors(files, {}, { agent: false, env: {} });
  const said = heard(() => ticket(it.work, ["new", PATH], it));
  return { code: await said.code, said: said.said, disk };
}

test("ticket new writes the bare ticket where no file stands, and leaves a standing one", async () => {
  const bare = await ran({});
  assert.equal(bare.code, 0, `ticket new answers ${bare.code}: ${bare.said}`);
  const text = bare.disk.exists(at(PATH)) ? bare.disk.read(at(PATH)) : "";
  assert.match(
    text,
    /^---\nkind: \[\[ticket\]\]\nprocess: ""\n---\n/,
    "the bare ticket carries a kind and an empty process",
  );
  assert.match(text, /^# Ask$/m, "the bare ticket carries an ask to fill");

  const standing = await ran({ [at(PATH)]: STANDING });
  assert.equal(
    standing.code,
    0,
    `ticket new answers ${standing.code}: ${standing.said}`,
  );
  assert.equal(
    standing.disk.read(at(PATH)),
    STANDING,
    "a ticket standing keeps what it holds",
  );
});
