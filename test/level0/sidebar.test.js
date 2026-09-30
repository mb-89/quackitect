// The sidebar with a fake editor. Every layer but the drawing runs here: a
// message posts an override for the window, the watcher draws the file again,
// and a window that opens drops the overrides another window holds.
// [[spec/guidance/code/testing]] [[spec/tickets/the-sidebar-writes-through-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { activate } from "../../src/extension/extension.js";
import { COMMAND } from "../../src/extension/lib/lens.js";
import { FLIP } from "../../src/extension/lib/route-host.js";
import { LOCAL, TRACKED } from "../../src/extension/lib/widgets.js";
import { NAMES, sidebarOf } from "../../src/extension/sidebar.js";
import { v1Over } from "./v1-index.js";

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
          enum: ["off", "finish", "stop"],
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
          runs: "./RUNME.sh tui",
          group: "agent control",
          row: 0,
          column: 0,
        },
      },
    },
    engine: {
      type: "object",
      properties: {
        vehicle: {
          widget: "action",
          asks: "folder",
          runs: "./RUNME.sh vehicle into <folder>",
          group: "engine",
          row: 0,
          column: 0,
        },
        stub: {
          widget: "action",
          asks: "folder",
          runs: "./RUNME.sh stub into <folder>",
          group: "engine",
          row: 0,
          column: 1,
        },
      },
    },
  },
};

function doorOf(seed = {}) {
  const files = fakeDisk({
    [SCHEMA]: JSON.stringify(schema),
    [TRACKED]: JSON.stringify({ stop: { hold: "off", mostInARow: 3 } }),
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
    timers: [],
    asked: [],
    folder: "",
  };

  return {
    files,
    said,
    index: v1Over(files),
    holds: () => true,
    takes: () => {
      said.pages += 1;
    },
    pid: () => 42,
    now: () => said.at,
    later: (run, span) => {
      const one = { run, span, cancelled: false, cancel: () => (one.cancelled = true) };
      said.timers.push(one);
      return one;
    },
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
    append: async (path, text) => files.append(path, text),
    watch: (paths, draw) => said.watched.push({ paths, draw }),
    runs: (line) => said.ran.push(line),
    asks: async (what) => {
      said.asked.push(what);
      return said.folder;
    },
    registerView: (id, resolve) => said.views.set(id, resolve),
  };
}

// The value config/keys answers at a key, and its layer. [[spec/tickets/the-sidebar-writes-through-actions]]
const keyed = async (door, key) =>
  (await door.index.values("config/keys")).find((one) => one.key === key) ?? {};
const held = async (door, key) => (await keyed(door, key)).value;

test("the sidebar draws the widgets the declaration names", async () => {
  const said = await sidebarOf(doorOf()).html();
  assert.match(said, /data-key="stop\.hold"/);
  assert.match(said, /data-key="log\.open"/);
  assert.match(said, /nonce="nonce"/);
});

// [[spec/tickets/the-sidebar-writes-through-actions]]
test("a set message holds an override, and leaves both files alone", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "set", key: "stop.hold", value: "stop" });

  assert.deepEqual(await keyed(door, "stop.hold"), {
    key: "stop.hold",
    value: "stop",
    layer: "override",
  });
  assert.equal(door.files.exists(LOCAL), false);
  assert.equal(JSON.parse(door.files.read(TRACKED)).stop.hold, "off");
});

test("a number typed as text lands as the number the schema says", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "set", key: "stop.mostInARow", value: "5" });
  assert.equal(await held(door, "stop.mostInARow"), 5);
});

test("a key the schema leaves alone lands as the text a person types", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "set", key: "helper.find", value: "sonnet" });
  assert.equal(await held(door, "helper.find"), "sonnet");
});

// [[spec/design_output/extension#the-log-opens-a-terminal]]
test("a run message opens the run the declaration names, and writes nothing", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "run", runs: "./RUNME.sh tui" });
  assert.deepEqual(door.said.ran, ["./RUNME.sh tui"]);
  assert.equal(door.files.exists(LOCAL), false);
});

// [[spec/design_output/extension#two-buttons-make-both]]
test("the vehicle button asks for a folder, and runs the vehicle verb over it", async () => {
  const door = doorOf();
  door.said.folder = "/work/new vehicle";
  const sidebar = sidebarOf(door);
  await sidebar.took({
    kind: "run",
    key: "engine.vehicle",
    runs: "./RUNME.sh vehicle into <folder>",
  });

  assert.deepEqual(door.said.asked, ["folder"]);
  assert.deepEqual(door.said.ran, ['./RUNME.sh vehicle into "/work/new vehicle"']);
  assert.deepEqual(
    sidebar.logbook.lines().map((one) => one.said),
    ['engine.vehicle runs ./RUNME.sh vehicle into "/work/new vehicle"'],
  );
});

test("the stub button asks for a folder, and runs the stub verb over it", async () => {
  const door = doorOf();
  door.said.folder = "/work/stub";
  await sidebarOf(door).took({
    kind: "run",
    key: "engine.stub",
    runs: "./RUNME.sh stub into <folder>",
  });

  assert.deepEqual(door.said.asked, ["folder"]);
  assert.deepEqual(door.said.ran, ['./RUNME.sh stub into "/work/stub"']);
});

test("a folder dialog closed on nothing runs nothing, and writes no line", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  await sidebar.took({
    kind: "run",
    key: "engine.stub",
    runs: "./RUNME.sh stub into <folder>",
  });

  assert.deepEqual(door.said.asked, ["folder"]);
  assert.deepEqual(door.said.ran, []);
  assert.deepEqual(sidebar.logbook.lines(), []);
});

test("the two buttons draw in a section of their own", async () => {
  const said = await sidebarOf(doorOf()).html();
  assert.match(said, /data-section="engine"/);
  assert.match(said, /at-0-0-1-1" data-key="engine\.vehicle" data-widget="action"/);
  assert.match(said, /at-0-1-1-1" data-key="engine\.stub" data-widget="action"/);
});

// [[spec/design_output/extension#the-view-holds-nothing]]
test("the widget follows the file, because a redraw reads the file again", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  assert.ok(!/class="widget at-0-1-1-1 away/.test(await sidebar.html()));

  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "stop" } }));
  const now = await sidebar.html();
  assert.match(now, /class="widget at-0-1-1-1 away held"/);
  assert.ok(!/class="said"/.test(now), "the mark stands alone");
});

// [[spec/tickets/the-sidebar-writes-through-actions]]
test("a window opening under a new id drops the overrides the last window held", async () => {
  const door = doorOf();
  const before = sidebarOf(door);
  await before.opened(7);
  await before.took({ kind: "set", key: "stop.hold", value: "stop" });
  await sidebarOf(door).opened(42);

  assert.deepEqual(await keyed(door, "stop.hold"), {
    key: "stop.hold",
    value: "off",
    layer: TRACKED,
  });
});

test("a window reloading under the same id keeps every override it held", async () => {
  const door = doorOf();
  const before = sidebarOf(door);
  await before.opened(42);
  await before.took({ kind: "set", key: "stop.hold", value: "stop" });
  await sidebarOf(door).opened(42);

  assert.equal(await held(door, "stop.hold"), "stop");
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
  assert.equal(await held(door, "stop.hold"), "stop");
});

test("one press moves one rung, and a press after the burst moves back", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  await sidebar.took({ kind: "press", key: "stop.hold" });
  assert.equal(await held(door, "stop.hold"), "finish");
  door.said.at = 5000;
  await sidebar.took({ kind: "press", key: "stop.hold" });
  assert.equal(await held(door, "stop.hold"), "off");
});

// A press moves from the built-in where no file sets the key, so a press off finish moves back to rest. [[spec/tickets/the-config-schema-gets-generated]]
test("a press moves from the built-in", async () => {
  const built = structuredClone(schema);
  built.properties.stop.properties.hold.default = "finish";
  const door = doorOf({ [SCHEMA]: JSON.stringify(built), [TRACKED]: "{}" });
  await sidebarOf(door).took({ kind: "press", key: "stop.hold" });
  assert.equal(await held(door, "stop.hold"), "off");
});

// [[spec/design_output/extension#a-press-writes-a-line]]
test("a press, a run and an edit each write a sidebar line naming what moved", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  for (const at of [0, 100, 200, 300, 400]) {
    door.said.at = at;
    await sidebar.took({ kind: "press", key: "stop.hold" });
  }
  await sidebar.took({ kind: "run", key: "log.open", runs: "./RUNME.sh tui" });
  await sidebar.took({ kind: "set", key: "stop.mostInARow", value: "5" });

  assert.deepEqual(
    sidebar.logbook.lines().map((one) => [one.kind, one.said, one.detail]),
    [
      ["sidebar", "stop.hold is finish", "one press"],
      ["sidebar", "stop.hold is stop", "5 presses"],
      ["sidebar", "log.open runs ./RUNME.sh tui", undefined],
      ["sidebar", "stop.mostInARow is 5", "the config tree"],
    ],
  );
  const written = [...door.files.files.keys()].filter((one) =>
    one.startsWith(".se/.log/"),
  );
  assert.deepEqual(written, [".se/.log/session.jsonl"]);
  assert.equal(door.files.read(written[0]).trim().split("\n").length, 4);
});

test("a sidebar line lands after the lines the session holds, and keeps them", async () => {
  const held = `${JSON.stringify({ at: "x", level: "info", kind: "level0", said: "session start" })}\n`;
  const door = doorOf({ ".se/.log/session.jsonl": held });
  await sidebarOf(door).took({ kind: "press", key: "stop.hold" });
  const rows = door.files
    .read(".se/.log/session.jsonl")
    .trim()
    .split("\n")
    .map((one) => JSON.parse(one));
  assert.deepEqual(
    rows.map((one) => one.said),
    ["session start", "stop.hold is finish"],
  );
});

test("a box writing at warn keeps the sidebar lines out of the log", async () => {
  const door = doorOf({ [LOCAL]: JSON.stringify({ log: { level: "warn" } }) });
  await sidebarOf(door).took({ kind: "press", key: "stop.hold" });
  assert.equal(
    [...door.files.files.keys()].some((one) => one.startsWith(".se/.log/")),
    false,
  );
});

// [[spec/design_output/extension#it-starts-silent]]
test("the extension starts nothing, and registers the view a person opens", async () => {
  const door = doorOf();
  await activate({}, door);

  assert.deepEqual([...door.said.views.keys()], ["quackitect.sidebar"]);
  assert.deepEqual(door.said.marked, [["quackitect.here", true]]);
  assert.equal(door.said.quiet, 1);
  assert.deepEqual(door.said.ran, []);
  assert.deepEqual(
    door.index.watches.map((one) => one.names),
    [NAMES, ["holds/standing", "tickets/cloud"], ["holds/standing", "tickets/all"]],
    "the status bar, the lens and the drawing watch before a view opens",
  );
  assert.deepEqual(door.said.watched, [], "the sidebar watches no file");
  assert.deepEqual(
    door.said.shown,
    [[]],
    "a tree at rest shows nothing in the status bar",
  );
  assert.equal(door.said.revealed, 0, "an ordinary start reveals nothing");
});

// [[spec/design_output/extension#the-status-bar-says-it]]
test("god mode stands in the status bar from the start, and a new hold toasts", async () => {
  const door = doorOf({ [LOCAL]: JSON.stringify({ engine: { binding: "god" } }) });
  await activate({}, door);
  assert.deepEqual(door.said.shown, [["god"]]);
  assert.deepEqual(
    door.said.toasted,
    [],
    "a state standing at the start toasts nothing",
  );

  door.files.write(
    LOCAL,
    JSON.stringify({ engine: { binding: "god" }, stop: { hold: "stop" } }),
  );
  await door.index.fire(`config/${LOCAL}`);
  assert.deepEqual(door.said.shown.at(-1), ["god", "stop"]);
  assert.deepEqual(door.said.toasted, ["stop"]);

  await door.said.commands.get("quackitect.rest")("stop.hold", "off");
  assert.equal(await held(door, "stop.hold"), "off");
});

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
test("a start registers the ticket command, and hands the editor the lens its click runs", async () => {
  const door = doorOf();
  const handed = [];
  door.lenses = (one) => handed.push(one);
  await activate({}, door);

  assert.equal(handed.length, 1);
  assert.equal(typeof handed[0].lenses, "function");
  assert.equal(door.said.commands.get(COMMAND), handed[0].took);
});

// [[spec/tickets/the-inset-folds-the-frontmatter]]
test("a start registers the flip, and hands the editor the events the drawing opens on", async () => {
  const door = doorOf();
  const handed = { lenses: [], editors: [], changes: [], themes: [] };
  door.lenses = (one) => handed.lenses.push(one);
  door.onEditors = (one) => handed.editors.push(one);
  door.onChange = (one) => handed.changes.push(one);
  door.onTheme = (one) => handed.themes.push(one);
  door.list = async () => [];
  await activate({}, door);

  assert.equal(typeof door.said.commands.get(FLIP), "function");
  assert.equal(handed.editors.length, 1);
  assert.equal(handed.changes.length, 1);
  assert.equal(handed.themes.length, 1);
  assert.deepEqual(await handed.lenses[0].lenses("spec/guidance/working.md", ""), []);
});

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
test("a start hands the editor the save the fill runs on", async () => {
  const door = doorOf();
  const handed = [];
  door.lenses = () => {};
  door.onSave = (one) => handed.push(one);
  await activate({}, door);

  assert.equal(handed.length, 1);
  assert.equal(typeof handed[0], "function");
});

// [[spec/design_output/extension#runme-opens-the-panel]]
test("a start RUNME marks reveals the panel once, and clears the mark", async () => {
  const door = doorOf({ ".se/.runtime/show-panel": "yes\n" });
  await activate({}, door);
  assert.equal(door.said.revealed, 1);
  assert.equal(door.files.read(".se/.runtime/show-panel"), "");

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

  const watch = door.index.watches.at(-1);
  assert.deepEqual(watch.names, NAMES);

  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "finish" } }));
  await door.index.fire(`config/${LOCAL}`);
  await door.said.timers.at(-1).run();
  assert.equal(drawn.length, 2);
  assert.match(drawn[1], /class="widget at-0-1-1-1 away"/);
});

const BLESS_FILE = ".se/.runtime/bless.json";

// The bless file stands outside the config, so the button draws off no schema entry. [[spec/tickets/bless-button-draws-itself]]
test("the sidebar draws the bless button with no schema entry naming it", async () => {
  const said = await sidebarOf(doorOf()).html();
  assert.match(said, /data-widget="bless"/);
});

// The fake index's bless/set writes the file, as the verb it runs does. [[spec/design_output/pull#the-bless]] [[spec/tickets/the-sidebar-writes-through-actions]]
test("a bless message writes the bless file, and leaves the config files alone", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);

  await sidebar.took({ kind: "bless", value: true });
  assert.deepEqual(JSON.parse(door.files.read(BLESS_FILE)), { agent: true });
  assert.equal(door.files.exists(LOCAL), false, "the local config takes nothing");

  await sidebar.took({ kind: "bless", value: false });
  assert.deepEqual(JSON.parse(door.files.read(BLESS_FILE)), { agent: false });
});

// A burst of index events draws the badge again once it settles, with no window reload. [[spec/tickets/the-sidebar-reads-v1]]
test("a burst of index events draws the badge again once it settles", async () => {
  const door = doorOf();
  const timers = door.said.timers;
  const drawn = [];
  await activate({}, door);
  await door.said.views.get("quackitect.sidebar")({
    set: (html) => drawn.push(html),
    onMessage: () => {},
  });

  const watch = door.index.watches.at(-1);
  assert.ok(watch.names.includes("work/open-tasks"), "the view watches the count");

  await watch.fn("work/open-tasks", 1);
  await watch.fn("work/open-tasks", 2);
  await watch.fn("work/open-tasks", 3);
  assert.equal(drawn.length, 1, "a burst draws nothing before it settles");
  await timers.at(-1).run();
  assert.equal(drawn.length, 2, "the settled burst draws once");
});
