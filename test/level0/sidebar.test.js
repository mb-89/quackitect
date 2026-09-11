// The sidebar with a fake editor. Every layer but the drawing runs here: a
// message lands in the file, the watcher draws the file again, and a window
// that opens twice takes the local values with it.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { activate } from "../../src/extension/extension.js";
import { KEY } from "../../src/extension/lib/session.js";
import { sidebarOf } from "../../src/extension/sidebar.js";
import { LOCAL, TRACKED } from "../../src/extension/lib/widgets.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SCHEMA = "spec/config/level0.schema.json";

const schema = {
  type: "object",
  properties: {
    stop: {
      type: "object",
      properties: {
        mostInARow: { type: "number" },
        hold: {
          type: "string",
          enum: ["running", "finishing", "stopped"],
          widget: "toggle",
          group: "agent control",
          row: 0,
          column: 1,
        },
      },
    },
    log: {
      type: "object",
      properties: {
        open: {
          widget: "action",
          runs: "./RUNME.sh log",
          group: "agent control",
          row: 0,
          column: 0,
        },
      },
    },
  },
};

function doorOf(seed = {}) {
  const files = fakeDisk({
    [SCHEMA]: JSON.stringify(schema),
    [TRACKED]: JSON.stringify({ stop: { hold: "running", mostInARow: 3 } }),
    ...seed,
  });
  const said = { ran: [], watched: [], views: new Map(), pages: 0 };

  return {
    files,
    said,
    holds: () => true,
    takes: () => {
      said.pages += 1;
    },
    pid: () => 42,
    nonce: () => "nonce",
    source: () => "https://box",
    scriptUri: () => "https://box/webview/clicks.js",
    read: async (path) => (files.exists(path) ? files.read(path) : ""),
    write: async (path, text) => files.write(path, text),
    watch: (paths, draw) => said.watched.push({ paths, draw }),
    runs: (line) => said.ran.push(line),
    registerView: (id, resolve) => said.views.set(id, resolve),
  };
}

const local = (door) => JSON.parse(door.files.read(LOCAL));

test("the sidebar draws the widgets the declaration names", async () => {
  const said = await sidebarOf(doorOf()).html();
  assert.match(said, /data-key="stop\.hold"/);
  assert.match(said, /data-key="log\.open"/);
  assert.match(said, /nonce="nonce"/);
});

// [[spec/design_output/extension#a-click-writes-the-file]]
test("a set message writes the local file, and leaves the tracked one alone", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "set", key: "stop.hold", value: "stopped" });

  assert.deepEqual(local(door).stop, { hold: "stopped" });
  assert.equal(JSON.parse(door.files.read(TRACKED)).stop.hold, "running");
});

test("a number typed as text lands as the number the schema says", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "set", key: "stop.mostInARow", value: "5" });
  assert.equal(local(door).stop.mostInARow, 5);
});

test("a key the schema leaves alone lands as the text a person types", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "set", key: "judge.model", value: "sonnet" });
  assert.equal(local(door).judge.model, "sonnet");
});

// [[spec/design_output/extension#the-log-opens-a-terminal]]
test("a run message opens the run the declaration names, and writes nothing", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "run", runs: "./RUNME.sh log" });
  assert.deepEqual(door.said.ran, ["./RUNME.sh log"]);
  assert.equal(door.files.exists(LOCAL), false);
});

// [[spec/design_output/extension#the-view-holds-nothing]]
test("the widget follows the file, because a redraw reads the file again", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  assert.ok(!/class="widget at-0-1-1-1 away/.test(await sidebar.html()));

  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "stopped" } }));
  const now = await sidebar.html();
  assert.match(now, /class="widget at-0-1-1-1 away held"/);
  assert.ok(!/class="said"/.test(now), "the mark stands alone");
});

// [[spec/design_output/extension#the-local-file-dies]]
test("a window opening under a new id takes the local values with it", async () => {
  const door = doorOf({
    [LOCAL]: JSON.stringify({ stop: { hold: "stopped" }, [KEY]: 7 }),
  });
  const said = await sidebarOf(door).opened(42);

  assert.deepEqual(said.cleared, ["stop.hold"]);
  assert.equal(local(door).stop, undefined);
  assert.equal(local(door).session.pid, 42);
});

test("a window reloading under the same id keeps every value it held", async () => {
  const door = doorOf({
    [LOCAL]: JSON.stringify({ stop: { hold: "stopped" }, session: { pid: 42 } }),
  });
  const said = await sidebarOf(door).opened(42);

  assert.deepEqual(said.cleared, []);
  assert.equal(local(door).stop.hold, "stopped");
});

// [[spec/design_output/extension#it-starts-silent]]
test("the extension starts nothing, and registers the view a person opens", () => {
  const door = doorOf();
  activate({}, door);

  assert.deepEqual([...door.said.views.keys()], ["quackitect.sidebar"]);
  assert.deepEqual(door.said.ran, []);
  assert.deepEqual(door.said.watched, []);
});

// [[spec/design_output/extension#the-watcher-draws-it-again]]
test("the view opening draws the page once, and the watcher draws it again", async () => {
  const door = doorOf();
  const drawn = [];
  activate({}, door);

  await door.said.views.get("quackitect.sidebar")({
    set: (html) => drawn.push(html),
    onMessage: () => {},
  });
  assert.equal(drawn.length, 1);

  const watch = door.said.watched[0];
  assert.deepEqual(watch.paths, ["spec/config/level0.schema.json", TRACKED, LOCAL]);

  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "finishing" } }));
  await watch.draw();
  assert.equal(drawn.length, 2);
  assert.match(drawn[1], /class="widget at-0-1-1-1 away"/);
});
