// The views section of the sidebar, over a fake catalog. The base file names
// what shows, and the catalog says how each thing reads.
// [[spec/tickets/the-sidebar-renders-generically]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { v1Over } from "./v1-index.js";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { badgeOf, formOf, viewsOf } from "../../src/extension/lib/views.js";
import { TRACKED } from "../../src/extension/lib/widgets.js";
import { SCHEMA, sidebarOf } from "../../src/extension/sidebar.js";
import cases from "../../src/tui/work/testdata/badges.json" with { type: "json" };

const BASE = [
  "reads: work/rows",
  "badge: work/open-tasks",
  "actions:",
  "  - button: pull",
  "    label: Written by the view",
  "    calls: work/pull",
  "  - button: new",
  "    edits: form",
  "    calls: tickets/open",
  "",
].join("\n");

const CATALOG = {
  "index/names": [
    { name: "work/open-tasks", label: "work", icon: "💼", looks: "count", value: 3 },
  ],
  "index/actions": [
    {
      name: "work/pull",
      label: "Pull for me",
      icon: "📥",
      doc: "takes the next ticket",
      fields: [],
    },
    {
      name: "tickets/open",
      label: "New ticket",
      icon: "📝",
      doc: "opens a ticket",
      fields: [{ Name: "Name", Key: "name", Label: "name", Doc: "the ticket's name" }],
    },
  ],
};

function doorOf(files = fakeDisk({ "spec/views/work.base": BASE }), given = CATALOG) {
  const index = v1Over(files, given);
  return {
    called: index.called,
    index,
    nonce: () => "nonce",
    source: () => "https://box",
    scriptUri: () => "https://box/webview/clicks.js",
  };
}

test("the sidebar draws every base file over a fake catalog", async () => {
  const said = await sidebarOf(doorOf()).html();
  assert.match(said, /work \(3\)/, "the badge reads off index/names");
  assert.match(said, /💼/, "the badge's icon reads off its registration");
  assert.match(said, /Pull for me/);
  assert.match(said, /New ticket/);
});

test("a badge reads as the window draws it, over the shared cases", () => {
  assert.ok(cases.length > 0, "the shared case file holds cases");
  for (const one of cases)
    assert.equal(badgeOf(one.names, one.name), one.want, one.says);
});

test("a button takes its label, doc and icon off the registration, and the base file writes none", async () => {
  const [view] = viewsOf(
    [
      {
        name: "work",
        said: {
          badge: "work/open-tasks",
          actions: [
            { button: "pull", label: "Written by the view", calls: "work/pull" },
          ],
        },
      },
    ],
    CATALOG,
  );
  assert.ok(view, "one base file draws one section");
  assert.deepEqual(view.buttons[0], {
    name: "pull",
    calls: "work/pull",
    label: "Pull for me",
    doc: "takes the next ticket",
    icon: "📥",
    form: undefined,
  });
  const said = await sidebarOf(doorOf()).html();
  assert.doesNotMatch(said, /Written by the view/);
});

test("a form draws one field a row off the action's input", () => {
  assert.deepEqual(formOf(CATALOG["index/actions"][1]), {
    fields: [{ key: "name", label: "name", doc: "the ticket's name" }],
  });
});

test("a click on a view button calls its action through the index door", async () => {
  const door = doorOf();
  await sidebarOf(door).took({ kind: "call", calls: "work/pull", input: {} });
  assert.deepEqual(door.called, [{ name: "work/pull", input: {} }]);
});

// A door seeded with the real schema and the slice at a mode, whose old count reads 2 while the catalog reads 3. [[spec/tickets/the-sidebar-shadow-compares]]
function shadowDoorOf(mode) {
  const files = fakeDisk({
    [SCHEMA]: JSON.stringify(schema),
    [TRACKED]: JSON.stringify({ migration: { sidebar: mode } }),
    "spec/views/work.base": BASE,
  });
  return {
    ...doorOf(files, { ...CATALOG, "work/open-tasks": 2 }),
    now: () => 0,
  };
}

// Each row the sidebar posts through log/say. [[spec/tickets/the-sidebar-writes-through-actions]]
const shadowRows = (door) =>
  door.called
    .filter((one) => one.name === "log/say")
    .map(({ input }) => ({ kind: input.kind, said: input.said, ...input.extra }))
    .filter((row) => row.kind === "shadow");

test("under shadow a mismatch writes a shadow row naming the slice, and under old none", async () => {
  const shadow = shadowDoorOf("shadow");
  await sidebarOf(shadow).html();
  const rows = shadowRows(shadow);
  assert.ok(rows.length > 0, "a mismatch writes a row");
  assert.ok(rows.every((row) => row.slice === "sidebar"));

  const old = shadowDoorOf("old");
  await sidebarOf(old).html();
  assert.deepEqual(shadowRows(old), []);
});
