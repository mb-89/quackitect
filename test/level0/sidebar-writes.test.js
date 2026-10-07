// Every sidebar write posts an action over the fake index, which does what
// the module does: a new window leaves the local file as it stands, a click
// holds its key for the window, and each button posts the action it names.
// [[spec/tickets/the-sidebar-writes-through-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { LOCAL } from "../../src/extension/lib/widgets.js";
import { SCHEMA, sidebarOf } from "../../src/extension/sidebar.js";
import { v1Over } from "./v1-index.js";

const WINDOW = 42;
const FOLDER = "/tmp/box";
const NAME = "a-new-one";
const PATH = `spec/tickets/${NAME}.md`;
// A local file the owner wrote by hand, under the window before this one. [[spec/tickets/the-sidebar-writes-through-actions]]
const HAND_WRITTEN = `${JSON.stringify({ session: { pid: 7 }, stop: { hold: "finish" } }, null, 2)}\n`;

const row = (name) => ({
  name,
  label: name,
  icon: "🔘",
  doc: `runs ${name}`,
  fields: [],
});
const ACTIONS = [
  "config/override",
  "config/opened",
  "bless/set",
  "tickets/new",
  "log/say",
  "vehicle/into",
  "stub/into",
].map(row);

// The sidebar's door over a fake disk and the fake index, recording each file write, terminal line and open. [[spec/tickets/the-sidebar-writes-through-actions]]
function doorOf(seed = {}) {
  const files = fakeDisk({ [SCHEMA]: JSON.stringify(schema), ...seed });
  const said = { wrote: [], ran: [], opened: [], told: [] };
  return {
    files,
    said,
    index: v1Over(files, { "index/actions": ACTIONS, "work/yours": [] }),
    read: async (path) => (files.exists(path) ? files.read(path) : ""),
    write: async (path, text) => {
      said.wrote.push(path);
      files.write(path, text);
    },
    append: async (path, text) => {
      said.wrote.push(path);
      files.append(path, text);
    },
    list: async () => [],
    asks: async () => FOLDER,
    asksLine: async () => NAME,
    runs: async (line) => said.ran.push(line),
    opens: async (path) => said.opened.push(path),
    tells: (...told) => said.told.push(told),
    says: () => {},
    now: () => 0,
    pid: () => WINDOW,
    nonce: () => "nonce",
    source: () => "https://box",
    scriptUri: () => "https://box/webview/clicks.js",
  };
}

const postedAs = (door, name) =>
  door.index.called.filter((one) => one.name === name).map((one) => one.input);

test("a new window over a local file posts config/opened and leaves the file unchanged", async () => {
  const door = doorOf({ [LOCAL]: HAND_WRITTEN });
  await sidebarOf(door).opened(WINDOW);
  assert.deepEqual(
    postedAs(door, "config/opened"),
    [{ window: String(WINDOW) }],
    "the new window posts config/opened with its window",
  );
  assert.equal(
    door.files.read(LOCAL),
    HAND_WRITTEN,
    "the value the owner wrote by hand stands after the new window",
  );
  assert.deepEqual(door.said.wrote, [], "the new window writes no file");
});

test("a click on a key posts config/override for the window", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  await sidebar.opened(WINDOW);
  await sidebar.took({ kind: "set", key: "stop.hold", value: "finish" });
  assert.deepEqual(
    postedAs(door, "config/override"),
    [{ key: "stop.hold", value: "finish", window: String(WINDOW) }],
    "the click posts config/override with the key, the value and the window",
  );
  assert.equal(door.files.exists(LOCAL), false, "the click writes no local file");
  assert.deepEqual(door.said.wrote, [], "the click writes no file");
  assert.match(
    await sidebar.html(),
    /data-key="stop\.hold"[^>]*data-value="finish"/,
    "the sidebar draws the override the index holds",
  );
});

test("each button posts its action over a fake action door", async () => {
  const blessing = doorOf();
  await sidebarOf(blessing).took({ kind: "bless", value: true });
  await sidebarOf(blessing).took({ kind: "bless", value: "false" });
  assert.deepEqual(
    postedAs(blessing, "bless/set"),
    [
      { agent: true, person: true },
      { agent: false, person: true },
    ],
    "the bless button posts bless/set as a person",
  );
  assert.deepEqual(blessing.said.wrote, [], "the bless button writes no file");

  const minting = doorOf();
  await sidebarOf(minting).took({ kind: "run", key: "work.new" });
  assert.deepEqual(
    postedAs(minting, "tickets/new"),
    [{ path: PATH }],
    "the new ticket button posts tickets/new with the path",
  );
  assert.deepEqual(minting.said.opened, [PATH], "the new ticket opens");
  assert.deepEqual(minting.said.wrote, [], "the new ticket button writes no file");

  for (const [key, topic] of [
    ["engine.vehicle", "vehicle"],
    ["engine.stub", "stub"],
  ]) {
    const door = doorOf();
    await sidebarOf(door).took({
      kind: "run",
      key,
      runs: `./RUNME.sh ${topic} into <folder>`,
    });
    assert.deepEqual(
      postedAs(door, `${topic}/into`),
      [{ args: [FOLDER], person: true }],
      `the ${topic} button posts ${topic}/into with the folder, as a person`,
    );
    assert.deepEqual(door.said.ran, [], `the ${topic} button runs no terminal line`);
    assert.deepEqual(door.said.wrote, [], `the ${topic} button writes no file`);
  }

  const tui = doorOf();
  await sidebarOf(tui).took({ kind: "run", key: "log.open", runs: "./RUNME.sh tui" });
  assert.deepEqual(
    tui.said.ran,
    ["./RUNME.sh tui"],
    "a line naming no action runs in the terminal",
  );

  const logging = doorOf();
  await sidebarOf(logging).logbook.say("info", "sidebar", "one press", {
    detail: "a click",
  });
  assert.deepEqual(
    postedAs(logging, "log/say"),
    [
      {
        level: "info",
        kind: "sidebar",
        said: "one press",
        extra: { detail: "a click" },
      },
    ],
    "a log line posts log/say",
  );
  assert.deepEqual(logging.said.wrote, [], "a log line writes no file");
});
