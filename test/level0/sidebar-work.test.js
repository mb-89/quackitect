// The work group in the sidebar, over a fake door seeded with the real config.
// The door answers the verbs from a table, so each case reads the line a press
// runs and the file it opens, with no editor and no child process.
// [[spec/tickets/the-work-group-draws-buttons]]

import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { SCHEMA, sidebarOf } from "../../src/extension/sidebar.js";
import { v1Over } from "./v1-index.js";

const NEXT = { ticket: "one", path: "spec/tickets/one.md", step: "do" };

function doorOf({ seed = {}, answers = {}, typed = "", given = {} } = {}) {
  const files = fakeDisk({ [SCHEMA]: JSON.stringify(schema), ...seed });
  const index = v1Over(files, given);
  const said = {
    asked: [],
    ran: [],
    opened: [],
    told: [],
    saved: [],
    says: [],
  };
  const answer = (argv) =>
    answers[argv.slice(0, 2).join(" ")] ?? {
      code: 0,
      out: "work\n  the next leaf\n",
      err: "",
    };
  return {
    files,
    said,
    index: {
      ...index,
      // A verb's action answers off the table, and an action taking no words, as tickets/new, does what its module does. [[spec/tickets/the-sidebar-writes-through-actions]]
      acts: async (name, input) => {
        if (!input?.args) return index.acts(name, input);
        const argv = [...name.split("/"), ...input.args];
        said.ran.push(argv);
        return answer(argv);
      },
    },
    read: async (path) => (files.exists(path) ? files.read(path) : ""),
    write: async (path, text) => files.write(path, text),
    list: async () => [],
    nonce: () => "nonce",
    source: () => "https://box",
    scriptUri: () => "https://box/webview/clicks.js",
    asks: async () => "a folder",
    asksLine: async (prompt) => {
      said.asked.push(prompt);
      return typed;
    },
    runs: (line) => said.ran.push(line),
    opens: async (path) => said.opened.push(path),
    saves: async (path) => said.saved.push(path),
    says: (lines) => said.says.push(lines),
    tells: (title, detail, refused) => said.told.push([title, detail, refused]),
  };
}

const press = (door, key) =>
  sidebarOf(door).took({
    kind: "run",
    key,
    runs: schema.properties.work.properties[key.split(".")[1]].runs,
  });

test("the work group draws the three buttons the config declares", async () => {
  const html = await sidebarOf(doorOf()).html();
  const section = html.slice(html.indexOf('data-section="work"'));
  assert.ok(html.includes('data-section="work"'));
  for (const key of ["work.editor", "work.pull", "work.new"])
    assert.ok(section.includes(`data-key="${key}"`), key);
});

// The views section draws the work badge, so the grid's button carries no copy. [[spec/tickets/the-extension-reads-no-files]]
test("the work editor's button carries no count, and spawns no verb", async () => {
  const door = doorOf({ given: { "work/open-tasks": 3 } });
  const html = await sidebarOf(door).html();
  assert.deepEqual(door.said.ran, []);
  const button = html.slice(html.indexOf('data-key="work.editor"'));
  assert.doesNotMatch(button.slice(0, button.indexOf("</button>")), /class="count"/);
});

test("pull for me takes the ticket the queue names, and opens it", async () => {
  const door = doorOf({ given: { "work/yours": [NEXT] } });
  await press(door, "work.pull");
  assert.deepEqual(door.said.ran, [["ticket", "pull", "one"]]);
  assert.deepEqual(door.said.opened, ["spec/tickets/one.md"]);
});

test("pull for me over an empty queue says so, and pulls nothing", async () => {
  const door = doorOf({
    given: { "work/yours": [] },
  });
  await press(door, "work.pull");
  assert.deepEqual(door.said.ran, []);
  assert.deepEqual(door.said.opened, []);
  assert.equal(door.said.told.length, 1);
  assert.equal(door.said.told[0][2], false);
});

test("new ticket asks a name, writes a ticket with an empty process, and opens it", async () => {
  const door = doorOf({ typed: "slow-lint" });
  await press(door, "work.new");
  assert.equal(door.said.asked.length, 1);
  const path = "spec/tickets/slow-lint.md";
  assert.deepEqual(door.index.called, [{ name: "tickets/new", input: { path } }]);
  assert.match(door.files.read(path), /^process: ""$/m);
  assert.deepEqual(door.said.opened, [path]);
  assert.deepEqual(door.said.ran, []);
});

test("new ticket over a name standing already opens the file, and writes nothing", async () => {
  const path = "spec/tickets/slow-lint.md";
  const door = doorOf({ typed: "slow-lint", seed: { [path]: "kept\n" } });
  await press(door, "work.new");
  assert.equal(door.files.read(path), "kept\n");
  assert.deepEqual(door.said.opened, [path]);
});

test("new ticket refuses a name outside the ticket form, and a closed box writes nothing", async () => {
  const bad = doorOf({ typed: "../escape" });
  await press(bad, "work.new");
  assert.deepEqual(bad.said.opened, []);
  assert.equal(bad.said.told[0][2], true);

  const closed = doorOf({ typed: "" });
  await press(closed, "work.new");
  assert.deepEqual(closed.said.opened, []);
  assert.deepEqual(closed.said.told, []);
});
