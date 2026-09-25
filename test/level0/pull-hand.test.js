// The hand's reading of the tickets on disk: trunk's under the tickets
// folder, the box's own under the private folder, and the todo each carries.
// [[spec/design_output/pull#the-queue-is-an-outline]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { todoOf } from "../../src/engine/group.js";
import {
  emptyGroup,
  handOut,
  takeable,
  ticketsHere,
} from "../../src/scripts/pull-hand.js";
import { doors, heard } from "./pull-doors.js";
import { CHILD, ROOT } from "./work-doors.js";

const at = (rel) => join(ROOT, ...rel.split("/"));

// A private note reads as private, and a todo naming a row reads off its front the way a bare tag does. [[spec/design_output/pull#a-todo-forces-a-place]]
test("the hand reads trunk's tickets and the box's private notes, each with its todo", () => {
  const disk = fakeDisk({
    [at("spec/tickets/a-loose-one.md")]: CHILD("", "open").replace("group: \n", ""),
    [at(".se/tickets/parked.md")]: CHILD("", "open").replace(
      "group: \n",
      "todo: a-loose-one\n",
    ),
  });
  const all = ticketsHere({ root: ROOT, disk, join });
  const names = all.map((one) => `${one.name}:${one.private}`).sort();
  assert.deepEqual(names, ["a-loose-one:false", "parked:true"]);
  assert.equal(todoOf(all.find((one) => one.name === "parked").front), "a-loose-one");
  assert.equal(todoOf(all.find((one) => one.name === "a-loose-one").front), "");
});

// The children stand before their group. [[spec/design_output/work#a-group-is-a-ticket]]
test("a group no ticket names reads empty, one with a child reads full, and a plain ticket reads neither", () => {
  const group =
    "---\nkind: [[ticket]]\nstate: draft\nprocess: [[spec/processes/group]]\n---\n";
  const disk = fakeDisk({
    [at("spec/tickets/a-part.md")]: CHILD("the-whole", "draft"),
  });
  const it = { root: ROOT, disk, join };
  assert.match(emptyGroup(it, group, "a-lonely-one"), /no ticket names it under group/);
  assert.equal(emptyGroup(it, group, "the-whole"), "");
  assert.equal(emptyGroup(it, CHILD("", "draft"), "a-part"), "");
});

// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
test("a desk pull meeting no ticket answers cleanup, and a named pull meeting none still waits", () => {
  const desk = () => doors({}, {}, { cloud: false, root: ROOT }).it;
  const plain = heard(() => handOut(desk(), {}));
  assert.match(plain.said, /^cleanup\n\s*The check stamp names no check at HEAD/);
  const named = heard(() => handOut(desk(), { wanted: "nobody" }));
  assert.match(named.said, /^wait\n\s*nobody stands nowhere here/);
});

// A trivial draft opens at the pull, so takeable reads it as open, and any other draft waits on a person. [[spec/design_output/pull#a-draft-opens]]
test("takeable answers a trivial draft's first leaf, and nothing for any other draft", () => {
  const open = CHILD("", "open").replace("group: \n", "");
  const it = { root: ROOT, disk: fakeDisk({}), join };
  const leaf = takeable(it, { name: "a", text: open });
  const trivial = open.replace(
    "state: open",
    "state: draft\nprocess: [[spec/processes/trivial]]",
  );
  assert.equal(takeable(it, { name: "a", text: trivial }), leaf);
  assert.equal(
    takeable(it, { name: "a", text: open.replace("state: open", "state: draft") }),
    "",
  );
});
