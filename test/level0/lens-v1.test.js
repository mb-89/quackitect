// The lens, the marks and the drawing over a fake index: every value they draw
// comes off index.values, a watch on the names they read draws them again, and
// a door that reads a file, lists a folder, imports a module or watches a path
// refuses, so no case passes on a file read.
// [[spec/tickets/the-lens-reads-v1]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { activate, SHOW } from "../../src/extension/extension.js";
import { fieldMarksOf } from "../../src/extension/lib/fields.js";
import lens, { ticketLensOf } from "../../src/extension/lib/lens.js";
import { routeHostOf } from "../../src/extension/lib/route-host.js";
import { SCHEMA } from "../../src/extension/sidebar.js";
import { ticketDrawn, ticketText, v1Over } from "./v1-index.js";

const PATH = "spec/tickets/one.md";
const OTHER = "spec/tickets/two.md";
const GROUP = "spec/tickets/up-there.md";
const HOLD_FILE = ".se/.runtime/hold/person.json";
const HOLD = { ticket: "one", path: PATH, step: "implement/tests-red", hand: "person" };

const TEXT = ticketText("lens-held");

const ticket = (group) =>
  [
    "---",
    "kind: [[ticket]]",
    "state: open",
    `group: ${group}`,
    "steps:",
    "  - name: draft",
    "    does: writes the approach",
    "step: draft",
    "---",
    "",
    "# Ask",
    "",
  ].join("\n");

const GROUP_TEXT = [
  "---",
  "kind: [[ticket]]",
  "state: open",
  "cloud: true",
  "---",
  "",
].join("\n");

const lineOf = (heading) => TEXT.split("\n").indexOf(heading) + 1;
const tried = (run) => run().catch((err) => ({ threw: err.message }));
const titlesOf = (lenses) =>
  Array.isArray(lenses) ? lenses.map((one) => one.title) : lenses;
const named = (marks) =>
  Array.isArray(marks) ? marks.map((one) => [one.name, one.line]) : marks;
const missing = (names, wanted) => wanted.filter((one) => !(names ?? []).includes(one));

function filesOf() {
  return fakeDisk({
    [SCHEMA]: JSON.stringify(schema),
    [PATH]: TEXT,
    [OTHER]: ticket("up-there"),
    [GROUP]: GROUP_TEXT,
    [HOLD_FILE]: JSON.stringify(HOLD),
  });
}

// The extension reads its own two files, and every other read, list, import or watch refuses. [[spec/tickets/the-lens-reads-v1]]
function doorOf(files) {
  const refuses = (name) => (path) => {
    throw new Error(`the lens calls ${name}(${JSON.stringify(path)})`);
  };
  const said = { marks: [], jumps: [], pages: [], lensChanged: 0, editors: [] };
  const pageOf = (path, lines) => {
    const page = {
      path,
      lines,
      posts: [],
      hears: () => {},
      post: (message) => page.posts.push(message),
      onMessage: (hear) => {
        page.hears = hear;
      },
      onGone: () => {},
      hide: () => {},
      show: () => {},
      dispose: () => {},
    };
    said.pages.push(page);
    return page;
  };
  return {
    files,
    said,
    index: v1Over(files),
    read: async (path) => {
      if (path !== SCHEMA && path !== SHOW) refuses("door.read")(path);
      return files.exists(path) ? files.read(path) : "";
    },
    list: async (path) => refuses("door.list")(path),
    imports: async (path) => refuses("door.imports")(path),
    watch: (paths) => refuses("door.watch")(paths),
    write: async () => {},
    holds: () => true,
    marks: () => {},
    quiets: () => {},
    registers: () => {},
    shows: () => {},
    toasts: () => {},
    registerView: () => {},
    lenses: () => {},
    lensChanged: () => {
      said.lensChanged += 1;
    },
    onEditors: (run) => said.editors.push(run),
    marksFields: (path, marks) => said.marks.push([path, marks]),
    jumps: async (path, line) => said.jumps.push([path, line]),
    page: pageOf,
    panel: (path) => pageOf(path, 0),
    folds: () => {},
    unfolds: () => {},
    theme: () => "dark",
  };
}

const lastMarks = (door) =>
  door.said.marks.filter((one) => one[0] === PATH).at(-1)?.[1];

test("a held ticket draws its marks and route over a fake index", async () => {
  const door = doorOf(filesOf());
  const marks = await tried(() => fieldMarksOf(door).sees(PATH, TEXT));
  assert.deepEqual(
    named(marks),
    [
      ["tests", lineOf("### tests")],
      ["checked", lineOf("## tests-red")],
    ],
    "the marks read tickets/drawn and holds/standing: each unfilled field at its heading, checked at the leaf",
  );
  assert.deepEqual(named(lastMarks(door)), named(marks), "the marks reach the editor");

  const opened = await tried(() => routeHostOf(door).opened(PATH, TEXT));
  assert.equal(opened?.threw, undefined, "the drawing opens off the index alone");
  const page = door.said.pages[0];
  page.hears({ kind: "ready" });
  assert.deepEqual(
    page.posts[0],
    {
      kind: "graph",
      graph: ticketDrawn("lens-held").graph,
      steps: readNote(TEXT).front.said.steps,
      held: true,
    },
    "the page draws the graph and route tickets/drawn hands, held by the person",
  );
});

test("the lens reads holds/standing and tickets/cloud, and a watch event draws it again", async () => {
  const files = filesOf();
  const door = doorOf(files);
  const tickets = ticketLensOf(door);
  assert.deepEqual(
    titlesOf(await tried(() => tickets.lenses(PATH, TEXT))),
    ["Hand back implement/tests-red: pass", "Hand back: fail…", "Drop"],
    "the person's hold off holds/standing draws the hand-back buttons",
  );
  assert.deepEqual(
    titlesOf(await tried(() => tickets.lenses(OTHER, ticket("up-there")))),
    [],
    "a ticket whose group tickets/cloud names draws no button",
  );
  assert.deepEqual(
    missing(tickets.names, ["holds/standing", "tickets/cloud"]),
    [],
    "the lens names the values it reads",
  );
  assert.deepEqual(
    missing(fieldMarksOf(door).names, ["holds/standing", "tickets/all"]),
    [],
    "the marks name the values they read",
  );
  assert.deepEqual(
    missing(routeHostOf(door).names, ["holds/standing", "tickets/all"]),
    [],
    "the drawing names the values it reads",
  );

  const started = await tried(() => activate({}, door));
  assert.equal(started?.threw, undefined, "the extension starts with no file read");
  for (const run of door.said.editors) await run(PATH, TEXT);
  const page = door.said.pages.at(-1);
  page.hears({ kind: "ready" });
  assert.equal(page.posts[0]?.held, true, "the drawing opens held");
  assert.equal(lastMarks(door)?.length, 2, "the marks stand while the hold does");

  files.files.delete(HOLD_FILE);
  const lensed = door.said.lensChanged;
  await door.index.fire("holds/standing");
  assert.deepEqual(
    lastMarks(door),
    [],
    "the event draws the marks again, and none stand",
  );
  assert.deepEqual(
    [page.posts.at(-1)?.kind, page.posts.at(-1)?.held],
    ["graph", false],
    "the event posts the drawing again, no longer held",
  );
  assert.ok(door.said.lensChanged > lensed, "the event draws the buttons again");
});

// [[spec/tickets/program-of-drops-node]]
test("the lens names no verb program folder", () => {
  assert.equal("PROGRAMS" in lens, false);
});
