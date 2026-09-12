// The editor's own extension list, and the three rules v3 and v4 paid for. Each
// case here is one of those failures, so a later writer cannot reintroduce it.
// [[spec/design_output/extension#a-file-another-program-owns]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import {
  entryFor,
  homeIn,
  KEPT,
  LIST,
  linkAt,
  linkedAt,
  readEntries,
  register,
  registered,
  upsert,
} from "../../src/scripts/editor.js";

const SOURCE = "/tree/src/extension";
const DEST = "/home/user/.vscode/extensions/quackitect.quackitect-0.1.0";

// [[spec/design_output/extension#the-link-stands]]
test("a copy standing where the link belongs goes, and the link takes its place", () => {
  const files = fakeDisk({ [`${DEST}/stale.js`]: "old", [`${SOURCE}/package.json`]: "{}" });
  assert.equal(linkedAt(files, DEST, SOURCE), false);

  assert.deepEqual(linkAt(files, DEST, SOURCE), { linked: true, why: "the link went in" });
  assert.equal(linkedAt(files, DEST, SOURCE), true);
  assert.equal(files.exists(`${DEST}/stale.js`), false, "the copy is gone");
});

test("a link standing already stays, and a second run touches nothing", () => {
  const files = fakeDisk({ [`${SOURCE}/package.json`]: "{}" });
  files.link(SOURCE, DEST);
  assert.deepEqual(linkAt(files, DEST, SOURCE), { linked: true, why: "the link stands already" });
});

test("a link pointing at another tree goes, and this tree's link goes in", () => {
  const files = fakeDisk();
  files.link("/other/tree/src/extension", DEST);
  assert.equal(linkedAt(files, DEST, SOURCE), false);
  linkAt(files, DEST, SOURCE);
  assert.equal(linkedAt(files, DEST, SOURCE), true);
});

test("a destination outside the editor's folder is refused, and nothing is removed", () => {
  const files = fakeDisk({ "/home/user/notes/keep.md": "mine" });
  const said = linkAt(files, "/home/user/notes", SOURCE);
  assert.equal(said.linked, false);
  assert.equal(files.read("/home/user/notes/keep.md"), "mine");
});

test("the list names the id, or the extension stands unregistered", () => {
  const folder = "/home/user/.vscode/extensions";
  const files = fakeDisk({ [`${folder}/${LIST}`]: JSON.stringify([other("a.b")]) });
  assert.equal(registered(files, folder, ID), false);
  register(files, folder, mine());
  assert.equal(registered(files, folder, ID), true);
});

const ID = "quackitect.quackitect";
const FOLDER = "/home/user/.vscode/extensions";
const mine = () => entryFor(ID, "0.1.0", `${FOLDER}/${ID}-0.1.0`, 1000);
const other = (id) => ({ identifier: { id }, version: "1.0.0", metadata: { source: "gallery" } });

test("an element nothing can identify is dropped, never carried", () => {
  const said = readEntries(JSON.stringify([other("a.b"), { version: "2" }, null]));

  assert.equal(said.entries.length, 1);
  assert.equal(said.dropped, 2);
  assert.equal(said.entries[0].identifier.id, "a.b");
});

test("entries nested under a wrapper come back out of it", () => {
  const said = readEntries(JSON.stringify({ value: [other("a.b"), other("c.d")] }));

  assert.equal(said.unwrapped, 1);
  assert.deepEqual(
    said.entries.map((one) => one.identifier.id),
    ["a.b", "c.d"],
  );
});

test("a list that reads as no JSON leaves the file alone", () => {
  const files = fakeDisk({ [`${FOLDER}/${LIST}`]: "not json at all" });
  const found = register(files, FOLDER, mine());

  assert.equal(found.wrote, false);
  assert.equal(files.read(`${FOLDER}/${LIST}`), "not json at all");
});

test("every key the editor owns is carried verbatim", () => {
  const was = { identifier: { id: "a.b", uuid: "u" }, version: "1", odd: { deep: true } };
  const files = fakeDisk({ [`${FOLDER}/${LIST}`]: JSON.stringify([was]) });
  register(files, FOLDER, mine());

  const said = JSON.parse(files.read(`${FOLDER}/${LIST}`));
  assert.deepEqual(said[0], was);
});

test("the file it writes is always an array, even holding one entry", () => {
  const files = fakeDisk();
  register(files, FOLDER, mine());

  const said = JSON.parse(files.read(`${FOLDER}/${LIST}`));
  assert.ok(Array.isArray(said), "the list stands as an array");
  assert.equal(said.length, 1);
});

test("ours stands once where the list already names it", () => {
  const files = fakeDisk({
    [`${FOLDER}/${LIST}`]: JSON.stringify([other("a.b"), { identifier: { id: ID }, version: "0.0.1" }]),
  });
  const found = register(files, FOLDER, mine());

  assert.equal(found.wrote, true);
  const said = JSON.parse(files.read(`${FOLDER}/${LIST}`));
  assert.equal(said.filter((one) => one.identifier.id === ID).length, 1);
  assert.equal(said.find((one) => one.identifier.id === ID).version, "0.1.0");
});

test("a write that would lose an id is refused", () => {
  const said = { entries: [other("a.b")], unreadable: false, dropped: 0, unwrapped: 0 };
  const found = upsert(said, mine());
  assert.deepEqual(found.lost, []);

  const losing = upsert({ ...said, entries: [] }, mine());
  assert.deepEqual(losing.lost, []);
});

test("the list it replaces stands beside it", () => {
  const was = JSON.stringify([other("a.b")]);
  const files = fakeDisk({ [`${FOLDER}/${LIST}`]: was });
  register(files, FOLDER, mine());

  assert.equal(files.read(`${FOLDER}/${KEPT}`), was);
});

test("the entry names the folder the editor reads it through", () => {
  const said = mine();

  assert.equal(said.location.scheme, "file");
  assert.equal(said.location.path, `${FOLDER}/${ID}-0.1.0`);
  assert.equal(said.relativeLocation, `${ID}-0.1.0`);
  assert.equal(said.metadata.source, "vsix");
});

test("the home folder comes from either name a box uses", () => {
  assert.equal(homeIn({ HOME: "/home/user" }), "/home/user");
  assert.equal(homeIn({ USERPROFILE: "C:\\Users\\one" }), "C:\\Users\\one");
  assert.equal(homeIn({ HOME: "", USERPROFILE: "C:\\Users\\one" }), "C:\\Users\\one");
  assert.equal(homeIn({ HOME: "/c/Users/one", USERPROFILE: "C:\\Users\\one" }), "C:\\Users\\one");
  assert.equal(homeIn({}), "");
});
