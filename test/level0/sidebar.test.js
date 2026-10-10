// The sidebar and the extension's start, over the real declaration, a fake
// disk and the fake index: every value comes off index.values, every write
// posts an action, and a line no action names runs in the terminal.
// [[spec/guidance/code/testing]] [[spec/tickets/the-sidebar-writes-through-actions]] [[spec/tickets/the-sidebar-reads-v1]]

import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { activate, SHOW } from "../../src/extension/extension.js";
import { COMMAND } from "../../src/extension/lib/lens.js";
import { FLIP } from "../../src/extension/lib/route-host.js";
import { badgeOf, formOf, viewsOf } from "../../src/extension/lib/views.js";
import { LOCAL, TRACKED } from "../../src/extension/lib/widgets.js";
import { NAMES, SCHEMA, sidebarOf } from "../../src/extension/sidebar.js";
import cases from "../../src/tui/work/testdata/badges.json" with { type: "json" };
import { v1Over } from "./v1-index.js";

const LOG = ".se/.log/session.jsonl";
const BLESS_FILE = ".se/.runtime/bless.json";
const VEHICLE = {
  kind: "run",
  key: "engine.vehicle",
  runs: "./RUNME.sh vehicle into <folder>",
};
const row = (name, more = {}) => ({
  name,
  label: name,
  icon: "🔘",
  doc: `runs ${name}`,
  fields: [],
  ...more,
});
// The catalog the views section reads: a base naming a badge and two buttons, each button's registration. [[spec/tickets/the-sidebar-renders-generically]]
const CATALOG = {
  "views/bases": [
    {
      name: "work",
      said: {
        badge: "work/open-tasks",
        actions: [
          { button: "pull", label: "Written by the view", calls: "work/pull" },
          { button: "new", edits: "form", calls: "tickets/open" },
        ],
      },
    },
  ],
  "index/names": [
    { name: "work/open-tasks", label: "work", icon: "💼", looks: "count", value: 3 },
  ],
  "index/actions": [
    row("work/pull", {
      label: "Pull for me",
      icon: "📥",
      doc: "takes the next ticket",
    }),
    row("tickets/open", {
      label: "New ticket",
      fields: [{ Name: "Name", Key: "name", Label: "name", Doc: "the ticket's name" }],
    }),
  ],
};
const ACTIONS = ["vehicle/into", "stub/into"].map((name) => row(name));

// The editor's door over a fake disk and the fake index, recording each read, line, open, tell and timer. [[spec/guidance/code/testing]]
function doorOf({ seed = {}, given = {}, folder = "", typed = "" } = {}) {
  const files = fakeDisk({
    [SCHEMA]: JSON.stringify(schema),
    [TRACKED]: JSON.stringify({ stop: { hold: "off", mostInARow: 3 } }),
    ...seed,
  });
  const said = {
    ran: [],
    views: new Map(),
    marked: [],
    quiet: 0,
    at: 0,
    shown: [],
    toasted: [],
    commands: new Map(),
  };
  Object.assign(said, {
    revealed: 0,
    timers: [],
    asked: [],
    opened: [],
    told: [],
    read: [],
    executed: [],
  });
  return {
    files,
    said,
    index: v1Over(files, given),
    holds: () => true,
    takes: () => {},
    pid: () => 42,
    now: () => said.at,
    later: (run) => {
      const one = { run, cancelled: false, cancel: () => (one.cancelled = true) };
      said.timers.push(one);
      return one;
    },
    marks: (name, on) => said.marked.push([name, on]),
    quiets: () => (said.quiet += 1),
    registers: (name, run) => said.commands.set(name, run),
    shows: (states) => said.shown.push(states.map((one) => one.value)),
    toasts: (one) => said.toasted.push(one.value),
    reveals: () => (said.revealed += 1),
    nonce: () => "nonce",
    source: () => "https://box",
    scriptUri: () => "https://box/webview/clicks.js",
    read: async (path) => {
      said.read.push(path);
      return files.exists(path) ? files.read(path) : "";
    },
    // The sidebar writes through the index alone; the start clears the panel mark. [[spec/tickets/the-sidebar-writes-through-actions]]
    write: async (path, text) =>
      path === SHOW
        ? files.write(path, text)
        : assert.fail(`the sidebar writes ${path}`),
    list: async () => [],
    watch: () => assert.fail("the sidebar watches no file"),
    runs: (line) => said.ran.push(line),
    asks: async (what) => {
      said.asked.push(what);
      return folder;
    },
    asksLine: async (prompt) => {
      said.asked.push(prompt);
      return typed;
    },
    opens: async (path) => said.opened.push(path),
    says: () => {},
    tells: (title, detail, refused) => said.told.push([title, detail, refused]),
    // The take runs the server's command. [[spec/tickets/extension-keeps-the-editor-parts]]
    executes: async (command, ...args) => {
      said.executed.push([command, ...args]);
      return { word: "work" };
    },
    registerView: (id, resolve) => said.views.set(id, resolve),
  };
}

const keyed = async (door, key) =>
  (await door.index.values("config/keys")).find((one) => one.key === key) ?? {};
const held = async (door, key) => (await keyed(door, key)).value;
const posted = (door, name) =>
  door.index.called.filter((one) => one.name === name).map((one) => one.input);
const press = (door, key) =>
  sidebarOf(door).took({
    kind: "run",
    key,
    runs: schema.properties.work.properties[key.split(".")[1]].runs,
  });
// The view a start registers, opened on a page whose every draw lands in the list. [[spec/design_output/extension#the-watcher-draws-it-again]]
async function opened(door) {
  const drawn = [];
  await activate({}, door);
  await door.said.views.get("quackitect.sidebar")({
    set: (html) => drawn.push(html),
    onMessage: () => {},
  });
  return drawn;
}

// [[spec/design_output/extension#the-views-section]] [[spec/tickets/the-work-group-draws-buttons]]
test("the page draws the declaration, the config tree and the views, and reads no file", async () => {
  const door = doorOf({
    seed: { [LOCAL]: JSON.stringify({ stop: { hold: "finish" } }) },
    given: CATALOG,
  });
  const said = await sidebarOf(door).html();
  assert.match(
    said,
    /data-key="stop\.hold" data-widget="toggle"[^>]*data-value="finish"/,
  );
  assert.match(
    said,
    /data-file="\.se\/\.runtime\/config\.json"[\s\S]*data-node="stop"/,
  );
  assert.match(said, /nonce="nonce"/);
  assert.match(
    said,
    /data-widget="bless"/,
    "the bless button draws off no schema entry",
  );
  assert.match(
    said,
    /data-section="engine"[\s\S]*data-key="engine\.vehicle"[\s\S]*data-key="engine\.stub"/,
  );
  const work = said.slice(said.indexOf('data-section="work"'));
  for (const key of ["work.editor", "work.pull", "work.new"])
    assert.ok(work.includes(`data-key="${key}"`), key);
  const editor = said.slice(said.indexOf('data-key="work.editor"'));
  assert.doesNotMatch(editor.slice(0, editor.indexOf("</button>")), /class="count"/);
  assert.match(said, /work \(3\)/);
  assert.match(said, /💼/);
  assert.match(said, /Pull for me/);
  assert.doesNotMatch(said, /Written by the view/, "the registration names the button");
  assert.deepEqual(door.said.read, []);
  assert.deepEqual(door.said.ran, [], "the page spawns no verb");
});

test("a badge reads as the window draws it, over the shared cases", () => {
  assert.ok(cases.length > 0);
  for (const one of cases)
    assert.equal(badgeOf(one.names, one.name), one.want, one.says);
});

test("a view button takes its registration, a form a field a row, and a click calls its action", async () => {
  const [view] = viewsOf(CATALOG["views/bases"], CATALOG);
  assert.deepEqual(view.buttons[0], {
    name: "pull",
    calls: "work/pull",
    label: "Pull for me",
    doc: "takes the next ticket",
    icon: "📥",
    form: undefined,
  });
  assert.deepEqual(formOf(CATALOG["index/actions"][1]), {
    fields: [{ key: "name", label: "name", doc: "the ticket's name" }],
  });
  const door = doorOf({ given: CATALOG });
  await sidebarOf(door).took({ kind: "call", calls: "work/pull", input: {} });
  assert.deepEqual(door.index.called, [{ name: "work/pull", input: {} }]);
});

// [[spec/tickets/the-sidebar-writes-through-actions]]
test("a set holds an override for the window, typed as the schema says, and writes no file", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  await sidebar.took({ kind: "set", key: "stop.hold", value: "stop" });
  await sidebar.took({ kind: "set", key: "stop.mostInARow", value: "5" });
  await sidebar.took({ kind: "set", key: "nowhere.declared", value: "sonnet" });
  assert.deepEqual(posted(door, "config/override")[0], {
    key: "stop.hold",
    value: "stop",
    window: "42",
  });
  assert.deepEqual(await keyed(door, "stop.hold"), {
    key: "stop.hold",
    value: "stop",
    layer: "override",
  });
  assert.equal(await held(door, "stop.mostInARow"), 5);
  assert.equal(await held(door, "nowhere.declared"), "sonnet");
  assert.match(await sidebar.html(), /data-key="stop\.hold"[^>]*data-value="stop"/);
  assert.equal(door.files.exists(LOCAL), false);
  assert.equal(JSON.parse(door.files.read(TRACKED)).stop.hold, "off");
});

// [[spec/design_output/extension#the-view-holds-nothing]]
test("the widget follows the file, because a redraw reads the file again", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  assert.doesNotMatch(await sidebar.html(), /away held" data-key="stop\.hold"/);
  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "stop" } }));
  assert.match(
    await sidebar.html(),
    /class="widget at-[\d-]+ away held" data-key="stop\.hold"/,
  );
});

// [[spec/tickets/the-sidebar-writes-through-actions]]
test("a window under a new id drops the overrides the last one held, the same id keeps them, and the file stands", async () => {
  const hand = `${JSON.stringify({ stop: { hold: "finish" } }, null, 2)}\n`;
  for (const [again, want] of [
    [7, "finish"],
    [42, "stop"],
  ]) {
    const door = doorOf({ seed: { [LOCAL]: hand } });
    const before = sidebarOf(door);
    await before.opened(42);
    await before.took({ kind: "set", key: "stop.hold", value: "stop" });
    await sidebarOf(door).opened(again);
    assert.equal(await held(door, "stop.hold"), want);
    assert.deepEqual(posted(door, "config/opened").at(-1), { window: String(again) });
    assert.equal(door.files.read(LOCAL), hand);
  }
});

// [[spec/design_output/extension#a-gesture-picks-a-state]]
test("a burst of presses reaches the far state, and a press after it moves one rung", async () => {
  const door = doorOf();
  const sidebar = sidebarOf(door);
  for (const at of [0, 150, 300, 450, 600]) {
    door.said.at = at;
    await sidebar.took({ kind: "press", key: "stop.hold" });
    await sidebar.html();
  }
  assert.equal(await held(door, "stop.hold"), "stop");
  door.said.at = 5000;
  await sidebar.took({ kind: "press", key: "stop.hold" });
  assert.equal(await held(door, "stop.hold"), "off");
});

// A press moves from the built-in where no file sets the key. [[spec/tickets/the-config-schema-gets-generated]]
test("a press moves from the built-in", async () => {
  const built = structuredClone(schema);
  built.properties.stop.properties.hold.default = "finish";
  const door = doorOf({ seed: { [SCHEMA]: JSON.stringify(built), [TRACKED]: "{}" } });
  await sidebarOf(door).took({ kind: "press", key: "stop.hold" });
  assert.equal(await held(door, "stop.hold"), "off");
});

// [[spec/design_output/extension#a-press-writes-a-line]]
test("a press, a run and an edit each post a line naming what moved, after the lines the session holds", async () => {
  const start = `${JSON.stringify({ at: "x", level: "info", kind: "level0", said: "session start" })}\n`;
  const door = doorOf({ seed: { [LOG]: start } });
  const sidebar = sidebarOf(door);
  for (const at of [0, 100, 200, 300, 400]) {
    door.said.at = at;
    await sidebar.took({ kind: "press", key: "stop.hold" });
  }
  await sidebar.took({ kind: "run", key: "log.open", runs: "./RUNME.sh tui" });
  await sidebar.took({ kind: "set", key: "stop.mostInARow", value: "5" });
  assert.deepEqual(
    sidebar.logbook.lines().map((one) => [one.said, one.detail]),
    [
      ["stop.hold is finish", "one press"],
      ["stop.hold is stop", "5 presses"],
      ["log.open runs ./RUNME.sh tui", undefined],
      ["stop.mostInARow is 5", "the config tree"],
    ],
  );
  assert.deepEqual(posted(door, "log/say")[0], {
    level: "info",
    kind: "sidebar",
    said: "stop.hold is finish",
    extra: { detail: "one press" },
  });
  const rows = door.files
    .read(LOG)
    .trim()
    .split("\n")
    .map((one) => JSON.parse(one).said);
  assert.deepEqual(rows, [
    "session start",
    ...sidebar.logbook.lines().map((one) => one.said),
  ]);
  assert.deepEqual(
    [...door.files.files.keys()].filter((one) => one.startsWith(".se/.log/")),
    [LOG],
  );

  const quiet = doorOf({
    seed: { [LOCAL]: JSON.stringify({ log: { level: "warn" } }) },
  });
  await sidebarOf(quiet).took({ kind: "press", key: "stop.hold" });
  assert.equal(
    quiet.files.exists(LOG),
    false,
    "a box at warn keeps the lines out of the log",
  );
});

// [[spec/design_output/extension#the-log-opens-a-terminal]] [[spec/design_output/extension#two-buttons-make-both]]
test("a run no action names runs in the terminal, with the folder its ask answers quoted", async () => {
  const tui = doorOf();
  await sidebarOf(tui).took({ kind: "run", runs: "./RUNME.sh tui" });
  assert.deepEqual(tui.said.ran, ["./RUNME.sh tui"]);
  assert.equal(tui.files.exists(LOCAL), false);

  const door = doorOf({ folder: "/work/new vehicle" });
  const sidebar = sidebarOf(door);
  await sidebar.took(VEHICLE);
  assert.deepEqual(door.said.asked, ["folder"]);
  assert.deepEqual(door.said.ran, ['./RUNME.sh vehicle into "/work/new vehicle"']);
  assert.deepEqual(
    sidebar.logbook.lines().map((one) => one.said),
    ['engine.vehicle runs ./RUNME.sh vehicle into "/work/new vehicle"'],
  );

  const closed = doorOf();
  await sidebarOf(closed).took({
    ...VEHICLE,
    key: "engine.stub",
    runs: "./RUNME.sh stub into <folder>",
  });
  assert.deepEqual(
    [closed.said.asked, closed.said.ran, sidebarOf(closed).logbook.lines()],
    [["folder"], [], []],
  );
});

// [[spec/tickets/the-sidebar-writes-through-actions]]
test("a run an action names posts it as a person with the folder, and the bless button posts bless/set", async () => {
  for (const topic of ["vehicle", "stub"]) {
    const door = doorOf({ folder: "/tmp/box", given: { "index/actions": ACTIONS } });
    await sidebarOf(door).took({
      kind: "run",
      key: `engine.${topic}`,
      runs: `./RUNME.sh ${topic} into <folder>`,
    });
    assert.deepEqual(posted(door, `${topic}/into`), [
      { args: ["/tmp/box"], person: true },
    ]);
    assert.deepEqual(door.said.ran, []);
  }
  const door = doorOf();
  const sidebar = sidebarOf(door);
  await sidebar.took({ kind: "bless", value: true });
  assert.deepEqual(JSON.parse(door.files.read(BLESS_FILE)), { agent: true });
  await sidebar.took({ kind: "bless", value: "false" });
  assert.deepEqual(posted(door, "bless/set"), [
    { agent: true, person: true },
    { agent: false, person: true },
  ]);
  assert.equal(door.files.exists(LOCAL), false);
});

// [[spec/tickets/the-lens-calls-actions]]
test("pull for me runs the server's ticket command on the ticket the queue names and opens it, and an empty queue says so", async () => {
  const door = doorOf({
    given: {
      "work/yours": [{ ticket: "one", path: "spec/tickets/one.md", step: "do" }],
    },
  });
  await press(door, "work.pull");
  assert.deepEqual(door.said.executed, [[COMMAND, "take", "one", "spec/tickets/one.md"]]);
  assert.deepEqual(posted(door, "ticket/pull"), []);
  assert.deepEqual(door.said.opened, ["spec/tickets/one.md"]);

  const empty = doorOf({ given: { "work/yours": [] } });
  await press(empty, "work.pull");
  assert.deepEqual([empty.index.called, empty.said.opened], [[], []]);
  assert.deepEqual(
    empty.said.told.map((one) => one[2]),
    [false],
  );
});

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
test("new ticket writes a ticket with an empty process and opens it, keeps one standing, and refuses a bad name", async () => {
  const path = "spec/tickets/slow-lint.md";
  const door = doorOf({ typed: "slow-lint" });
  await press(door, "work.new");
  assert.equal(door.said.asked.length, 1);
  assert.deepEqual(door.index.called, [{ name: "tickets/new", input: { path } }]);
  assert.match(door.files.read(path), /^process: ""$/m);
  assert.deepEqual(door.said.opened, [path]);

  const kept = doorOf({ typed: "slow-lint", seed: { [path]: "kept\n" } });
  await press(kept, "work.new");
  assert.deepEqual([kept.files.read(path), kept.said.opened], ["kept\n", [path]]);

  const bad = doorOf({ typed: "../escape" });
  await press(bad, "work.new");
  assert.deepEqual([bad.said.opened, bad.said.told[0][2]], [[], true]);

  const closed = doorOf();
  await press(closed, "work.new");
  assert.deepEqual([closed.said.opened, closed.said.told], [[], []]);
});

// [[spec/design_output/extension#it-starts-silent]] [[spec/design_output/lsp#a-ticket-carries-its-buttons]] [[spec/tickets/the-inset-folds-the-frontmatter]]
test("a start runs nothing, registers the view, the flip and the editor's events, leaves the ticket command to the server, and watches before a view opens", async () => {
  const door = doorOf();
  const handed = { lenses: [], editors: [], changes: [], themes: [], saves: [] };
  door.lenses = (one) => handed.lenses.push(one);
  door.onEditors = (one) => handed.editors.push(one);
  door.onChange = (one) => handed.changes.push(one);
  door.onTheme = (one) => handed.themes.push(one);
  door.onSave = (one) => handed.saves.push(one);
  await activate({}, door);

  assert.deepEqual([...door.said.views.keys()], ["quackitect.sidebar"]);
  assert.deepEqual(door.said.marked, [["quackitect.here", true]]);
  assert.deepEqual(
    [door.said.quiet, door.said.ran, door.said.shown, door.said.revealed],
    [1, [], [[]], 0],
  );
  assert.deepEqual(
    door.index.watches.map((one) => one.names),
    [NAMES, ["holds/standing", "tickets/all"]],
  );
  assert.equal(door.said.commands.has(COMMAND), false);
  assert.equal(typeof door.said.commands.get(FLIP), "function");
  for (const one of ["editors", "changes", "themes"])
    assert.equal(handed[one].length, 1, one);
  assert.equal(handed.saves.length, 0);
  assert.deepEqual(await handed.lenses[0].lenses("spec/guidance/working.md", ""), []);
});

// [[spec/design_output/extension#the-status-bar-says-it]]
test("god mode stands in the status bar from the start, a new hold toasts, and rest sets it back", async () => {
  const door = doorOf({
    seed: { [LOCAL]: JSON.stringify({ engine: { binding: "god" } }) },
  });
  await activate({}, door);
  assert.deepEqual([door.said.shown, door.said.toasted], [[["god"]], []]);
  door.files.write(
    LOCAL,
    JSON.stringify({ engine: { binding: "god" }, stop: { hold: "stop" } }),
  );
  await door.index.fire(`config/${LOCAL}`);
  assert.deepEqual(
    [door.said.shown.at(-1), door.said.toasted],
    [["god", "stop"], ["stop"]],
  );
  await door.said.commands.get("quackitect.rest")("stop.hold", "off");
  assert.equal(await held(door, "stop.hold"), "off");
});

// [[spec/design_output/extension#runme-opens-the-panel]] [[spec/design_output/extension#an-empty-folder-stays-quiet]]
test("a RUNME mark reveals the panel once, and a folder with no tree gets nothing", async () => {
  const door = doorOf({ seed: { [SHOW]: "yes\n" } });
  await activate({}, door);
  await activate({}, door);
  assert.equal(door.said.revealed, 1);
  assert.equal(door.files.read(SHOW), "");

  const bare = doorOf();
  bare.files.remove(SCHEMA);
  await activate({}, bare);
  assert.deepEqual(
    [[...bare.said.views.keys()], bare.said.marked, bare.said.quiet],
    [[], [], 0],
  );
  assert.equal(bare.files.exists(LOCAL), false);
});

// [[spec/design_output/extension#the-watcher-draws-it-again]] [[spec/tickets/the-sidebar-reads-v1]]
test("the view draws once on opening, and a burst of index events draws it again once it settles", async () => {
  const door = doorOf({ given: CATALOG });
  const drawn = await opened(door);
  assert.equal(drawn.length, 1);
  const watch = door.index.watches.at(-1);
  assert.deepEqual(watch.names, NAMES);
  door.index.given["index/names"] = [{ ...CATALOG["index/names"][0], value: 9 }];
  door.files.write(LOCAL, JSON.stringify({ stop: { hold: "finish" } }));
  for (const at of [1, 2, 3]) await watch.fn("work/open-tasks", at);
  assert.equal(drawn.length, 1, "a burst draws nothing before it settles");
  await door.said.timers.at(-1).run();
  assert.equal(drawn.length, 2);
  assert.match(drawn[1], /work \(9\)/);
  assert.match(drawn[1], /away" data-key="stop\.hold"/);
});
