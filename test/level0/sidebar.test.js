// The sidebar with a fake editor. Every layer but the drawing runs here: a
// message lands in the file, the watcher draws the file again, and a window
// that opens twice takes the local values with it.
// [[spec/guidance/code/testing]]

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
  const said = {
    ran: [],
    watched: [],
    views: new Map(),
    pages: 0,
    marked: [],
    quiet: 0,
    at: 0,
    shown: [],
    toasted: [],
    commands: new Map(),
    revealed: 0,
  };

  return {
    files,
    said,
    holds: () => true,
    takes: () => {
      said.pages += 1;
    },
    pid: () => 42,
    now: () => said.at,
    marks: (name, on) => said.marked.push([name, on]),
    quiets: () => {
      said.quiet += 1;
    },
    registers: (name, run) => said.commands.set(name, run),
    shows: (states) => said.shown.push(states.map((one) => one.value)),
    toasts: (one) => said.toasted.push(one.value),
    reveals: () => {
      said.revealed += 1;
    },
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

// [[spec/design_output/extension#a-gesture-picks-a-state]]
test("five presses reach the far state, though every write draws the page again", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  for (const at of [0, 150, 300, 450, 600]) {
    door.said.at = at;
    await sidebar.took({ kind: "press", key: "stop.hold" });
    await sidebar.html();
  }
  assert.equal(local(door).stop.hold, "stopped");
});

test("one press moves one rung, and a press after the burst moves back", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  await sidebar.took({ kind: "press", key: "stop.hold" });
  assert.equal(local(door).stop.hold, "finishing");
  door.said.at = 5000;
  await sidebar.took({ kind: "press", key: "stop.hold" });
  assert.equal(local(door).stop.hold, "running");
});

// [[spec/design_output/extension#a-press-writes-a-line]]
test("a press, a run and an edit each write a sidebar line naming what moved", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  for (const at of [0, 100, 200, 300, 400]) {
    door.said.at = at;
    await sidebar.took({ kind: "press", key: "stop.hold" });
  }
  await sidebar.took({ kind: "run", key: "log.open", runs: "./RUNME.sh log" });
  await sidebar.took({ kind: "set", key: "stop.mostInARow", value: "5" });

  assert.deepEqual(
    sidebar.logbook.lines().map((one) => [one.kind, one.said, one.detail]),
    [
      ["sidebar", "stop.hold is finishing", "one press"],
      ["sidebar", "stop.hold is stopped", "5 presses"],
      ["sidebar", "log.open runs ./RUNME.sh log", undefined],
      ["sidebar", "stop.mostInARow is 5", "the config tree"],
    ],
  );
  const written = [...door.files.files.keys()].filter((one) => one.startsWith(".se/log/"));
  assert.deepEqual(written, [".se/log/session.jsonl"]);
  assert.equal(door.files.read(written[0]).trim().split("\n").length, 4);
});

test("a sidebar line lands after the lines the session holds, and keeps them", async () => {
  const held = `${JSON.stringify({ at: "x", level: "info", kind: "level0", said: "session start" })}\n`;
  const door = doorOf({ ".se/log/session.jsonl": held });
  await sidebarOf(door).took({ kind: "press", key: "stop.hold" });
  const rows = door.files.read(".se/log/session.jsonl").trim().split("\n").map((one) => JSON.parse(one));
  assert.deepEqual(rows.map((one) => one.said), ["session start", "stop.hold is finishing"]);
});

test("a box writing at warn keeps the sidebar lines out of the log", async () => {
  const door = doorOf({ [LOCAL]: JSON.stringify({ log: { level: "warn" } }) });
  await sidebarOf(door).took({ kind: "press", key: "stop.hold" });
  assert.equal([...door.files.files.keys()].some((one) => one.startsWith(".se/log/")), false);
});

// [[spec/design_output/extension#it-starts-silent]]
test("the extension starts nothing, and registers the view a person opens", async () => {
  const door = doorOf();
  await activate({}, door);

  assert.deepEqual([...door.said.views.keys()], ["quackitect.sidebar"]);
  assert.deepEqual(door.said.marked, [["quackitect.here", true]]);
  assert.equal(door.said.quiet, 1);
  assert.deepEqual(door.said.ran, []);
  assert.equal(door.said.watched.length, 1, "the status bar alone watches before a view opens");
  assert.deepEqual(door.said.shown, [[]], "a tree at rest shows nothing in the status bar");
  assert.equal(door.said.revealed, 0, "an ordinary start reveals nothing");
});

// [[spec/design_output/extension#the-status-bar-says-it]]
test("god mode stands in the status bar from the start, and a new hold toasts", async () => {
  const door = doorOf({ [LOCAL]: JSON.stringify({ engine: { binding: "god" } }) });
  await activate({}, door);
  assert.deepEqual(door.said.shown, [["god"]]);
  assert.deepEqual(door.said.toasted, [], "a state standing at the start toasts nothing");

  door.files.write(LOCAL, JSON.stringify({ engine: { binding: "god" }, stop: { hold: "stopped" } }));
  await door.said.watched[0].draw();
  assert.deepEqual(door.said.shown.at(-1), ["god", "stopped"]);
  assert.deepEqual(door.said.toasted, ["stopped"]);

  await door.said.commands.get("quackitect.rest")("stop.hold", "running");
  assert.equal(local(door).stop.hold, "running");
});

// [[spec/design_output/extension#runme-opens-the-panel]]
test("a start RUNME marks reveals the panel once, and clears the mark", async () => {
  const door = doorOf({ ".se/show-panel": "yes\n" });
  await activate({}, door);
  assert.equal(door.said.revealed, 1);
  assert.equal(door.files.read(".se/show-panel"), "");

  await activate({}, door);
  assert.equal(door.said.revealed, 1, "the next start stays silent");
});

// [[spec/design_output/extension#an-empty-folder-stays-quiet]]
test("a folder carrying no tree gets no view, no mark and no settings", async () => {
  const door = doorOf();
  door.files.remove(SCHEMA);
  await activate({}, door);

  assert.deepEqual([...door.said.views.keys()], []);
  assert.deepEqual(door.said.marked, []);
  assert.equal(door.said.quiet, 0);
  assert.equal(door.files.exists(LOCAL), false);
});

// [[spec/design_output/extension#the-watcher-draws-it-again]]
test("the view opening draws the page once, and the watcher draws it again", async () => {
  const door = doorOf();
  const drawn = [];
  await activate({}, door);

  await door.said.views.get("quackitect.sidebar")({
    set: (html) => drawn.push(html),
    onMessage: () => {},
  });
  assert.equal(drawn.length, 1);

  const watch = door.said.watched.at(-1);
  assert.deepEqual(watch.paths, ["spec/config/level0.schema.json", TRACKED, LOCAL]);

  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "finishing" } }));
  await watch.draw();
  assert.equal(drawn.length, 2);
  assert.match(drawn[1], /class="widget at-0-1-1-1 away"/);
});
