// A save in the editor runs the fill verb, over a fake disk. The index door's
// `acts` runs the `ticket` verb in place of the index, so the case reads the
// file the save leaves behind.
// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeFront } from "../../src/doors/fake/front.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { ticketLensOf } from "../../src/extension/lib/lens.js";
import { ticket } from "../../src/scripts/ticket.js";
import { TICKET_SCHEMA, TRIVIAL_PROCESS } from "./fixtures.js";
import { heard } from "./pull-doors.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const PATH = "spec/tickets/slow-lint.md";

const SAVED = `---
kind: [[ticket]]
process: [[spec/processes/trivial]]
---

# Ask

The lint drags on every save.
`;

function doorOver(disk) {
  const said = { says: [], told: [] };
  return {
    said,
    list: async () => [],
    read: async () => "",
    index: {
      acts: async (name, input) => {
        const [verb, ...rest] = [...name.split("/"), ...input.args];
        assert.equal(verb, "ticket");
        const ran = heard(() => ticket(ROOT, rest, { disk, join, front: fakeFront() }));
        return { code: ran.code, out: ran.said, err: "" };
      },
    },
    says: (lines) => said.says.push(lines),
    tells: (...one) => said.told.push(one),
  };
}

test("a save over a picked process writes the route, the hash and a chapter per step", async () => {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at("spec/processes/trivial.yaml")]: TRIVIAL_PROCESS,
    [at(PATH)]: SAVED,
  });
  await ticketLensOf(doorOver(disk)).saved(PATH, SAVED);

  const now = disk.read(at(PATH));
  assert.match(now, /^steps:\n\s+- name: do/m);
  assert.match(now, /^process_hash: [0-9a-f]{16}$/m);
  assert.match(now, /^# do$/m, "a chapter stands for the step");
  assert.match(now, /The lint drags on every save\./, "the ask the person wrote stays");
});
