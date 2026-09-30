// The sidebar over a fake index: every value it draws comes off index.values,
// and one watch over the same names draws it again. It reads no file.
// [[spec/tickets/the-sidebar-reads-v1]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { activate } from "../../src/extension/extension.js";
import { LOCAL, TRACKED } from "../../src/extension/lib/widgets.js";
import { SCHEMA, sidebarOf } from "../../src/extension/sidebar.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const BASE = {
  reads: "work/rows",
  badge: "work/open-tasks",
  actions: [{ button: "pull", label: "Written by the view", calls: "work/pull" }],
};

// A projection as /v1 hands it: q.Ordered, marshalled field by field. [[spec/design_output/model#everything-on-disk-mirrors]]
function orderedOf(value) {
  const one = {
    Keys: null,
    Fields: null,
    Items: null,
    Literal: "",
    Object: false,
    Array: false,
  };
  if (Array.isArray(value)) return { ...one, Items: value.map(orderedOf), Array: true };
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    return {
      ...one,
      Keys: keys,
      Fields: keys.map((key) => orderedOf(value[key])),
      Object: true,
    };
  }
  return { ...one, Literal: JSON.stringify(value) };
}

function valuesOf() {
  return {
    "config/keys": [
      { key: "stop.hold", value: "finish", layer: LOCAL },
      { key: "log.level", value: "info", layer: "built-in" },
    ],
    [`config/${SCHEMA}`]: orderedOf(schema),
    [`config/${TRACKED}`]: orderedOf({}),
    [`config/${LOCAL}`]: orderedOf({ stop: { hold: "finish" } }),
    "migration/config/sidebar": "new",
    "bless/.se/.runtime/bless.json": orderedOf({ agent: true }),
    "work/open-tasks": 7,
    "views/bases": [{ name: "work", said: BASE }],
    "index/names": [
      { name: "work/open-tasks", label: "work", icon: "💼", looks: "count", value: 7 },
    ],
    "index/actions": [
      {
        name: "work/pull",
        label: "Pull for me",
        icon: "📥",
        doc: "takes the next ticket",
        fields: [],
      },
    ],
  };
}

function doorOf() {
  const values = valuesOf();
  const said = {
    read: [],
    spawned: [],
    watches: [],
    views: new Map(),
    fileWatches: [],
    timers: [],
  };
  return {
    values,
    said,
    read: async (path) => {
      said.read.push(path);
      return path === SCHEMA ? JSON.stringify(schema) : "";
    },
    write: async () => {},
    append: async () => {},
    list: async () => [],
    asksVerb: async (argv) => {
      said.spawned.push(argv);
      return { code: 0, out: "0\n", err: "" };
    },
    index: {
      values: async (name) => values[name],
      calls: async () => ({}),
      watch: (names, fn) => {
        said.watches.push({ names, fn });
        return { stop: () => {} };
      },
    },
    holds: () => true,
    marks: () => {},
    quiets: () => {},
    registers: () => {},
    shows: () => {},
    toasts: () => {},
    takes: () => {},
    pid: () => 42,
    now: () => 0,
    later: (run) => {
      const one = { run, cancelled: false, cancel: () => (one.cancelled = true) };
      said.timers.push(one);
      return one;
    },
    watch: (paths, draw) => said.fileWatches.push({ paths, draw }),
    registerView: (id, resolve) => said.views.set(id, resolve),
    nonce: () => "nonce",
    source: () => "https://box",
    scriptUri: () => "https://box/webview/clicks.js",
  };
}

test("the sidebar draws the config tree and the views off a fake index", async () => {
  const door = doorOf();
  const said = await sidebarOf(door).html();
  assert.match(
    said,
    /data-key="stop\.hold" data-widget="toggle"[^>]*data-value="finish"/,
    "the toggle reads its value off config/keys",
  );
  assert.match(
    said,
    /data-file="\.se\/\.runtime\/config\.json"[\s\S]*data-node="stop"/,
    "the tree draws the local projection",
  );
  assert.match(said, /Pull for me/, "the views section reads views/bases");
  assert.match(
    said,
    /class="widget bless held"/,
    "the bless button reads the bless projection",
  );
  assert.deepEqual(door.said.read, [], "the sidebar reads no file");
});

test("the work badge reads work/open-tasks off the index, and spawns no verb", async () => {
  const door = doorOf();
  const said = await sidebarOf(door).html();
  assert.match(said, /<span class="count">7<\/span>/);
  assert.deepEqual(door.said.spawned, [], "the badge spawns no verb");
});

test("a watch event draws the sidebar again", async () => {
  const door = doorOf();
  const drawn = [];
  await activate({}, door);
  await door.said.views.get("quackitect.sidebar")({
    set: (html) => drawn.push(html),
    onMessage: () => {},
  });
  assert.equal(drawn.length, 1);
  const watch = door.said.watches.find((one) => one.names.includes("work/open-tasks"));
  assert.ok(watch, "the view watches the index over the names it draws");
  assert.deepEqual(
    door.said.fileWatches.filter((one) =>
      one.paths.some((path) => path.startsWith("spec/tickets") || path === LOCAL),
    ),
    [],
    "the sidebar watches no file",
  );

  door.values["work/open-tasks"] = 9;
  await watch.fn("work/open-tasks", 9);
  for (const one of door.said.timers.filter((each) => !each.cancelled)) await one.run();
  assert.ok(drawn.length >= 2, "the event draws the page again");
  assert.match(drawn.at(-1), /<span class="count">9<\/span>/);
});

test("sidebar.js names no door.read, door.list, door.imports or door.watch", () => {
  const text = readFileSync(join(ROOT, "src/extension/sidebar.js"), "utf8");
  assert.deepEqual(text.match(/door\.(read|list|imports|watch)\b/g) ?? [], []);
});
