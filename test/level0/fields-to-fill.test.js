// The marks over the fields a person's hold still wants: the host over a fake
// door, and the editor door over a stand-in for vscode. The host reads the
// route, the chapter and the headings through the real modules the door
// imports, so every case reads what a take leaves on the ticket.
// [[spec/design_output/extension#a-take-marks-the-fields]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as schema from "../../.claude/skills/level0/lib/schema.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { editorRequire } from "../../src/doors/fake/vscode.js";
import { activate } from "../../src/extension/extension.js";
import { EMITTER } from "../../src/extension/lib/drawing.js";
import { CHAPTER, ROUTE, fieldMarksOf } from "../../src/extension/lib/fields.js";
import { HOLDS } from "../../src/extension/lib/lens.js";
import { SCHEMA } from "../../src/extension/lib/route-host.js";
import * as emitter from "../../src/scripts/graph.js";
import * as chapter from "../../src/scripts/pull-chapter.js";
import * as route from "../../src/scripts/pull-route.js";

const PATH = "spec/tickets/one.md";
const HOLD = { ticket: "one", step: "implement/tests-red", hand: "person a-desk" };
const HOLD_FILE = `${HOLDS}/person-a-desk.json`;
const FIRST = "every door has a fake";
const SECOND = "a comment names the approach";

const TEXT = [
  "---",
  "kind: [[ticket]]",
  "state: open",
  "steps:",
  "  - name: implement",
  `    checklist: ["${FIRST}", "${SECOND}"]`,
  "    steps:",
  "      - name: tests-red",
  "        does: writes the tests the ask calls for",
  "        evidence:",
  "          - name: tests",
  "            form: command",
  "            expects: assertion",
  "            says: the tests you write fail on their own assertion",
  "          - name: seen",
  "            form: text",
  "            says: what you see, and what surprises you",
  "      - name: change",
  "        does: makes the change",
  "        evidence:",
  "          - name: lint",
  "            form: command",
  "            says: the tree builds and lints",
  "step: implement/tests-red",
  "---",
  "",
  "# Ask",
  "",
  "A person sees the fields.",
  "",
  "# implement",
  "",
  "## tests-red",
  "",
  "<!-- writes the tests the ask calls for -->",
  "",
  "### tests",
  "",
  "<!-- the tests you write fail on their own assertion -->",
  "",
  "### seen",
  "",
  "The marks stand.",
  "",
  "## change",
  "",
  "### lint",
  "",
  "<!-- the tree builds and lints -->",
  "",
].join("\n");

const lineOf = (text, heading) => text.split("\n").indexOf(heading) + 1;
const MODULES = {
  [ROUTE]: route,
  [CHAPTER]: chapter,
  [SCHEMA]: schema,
  [EMITTER]: emitter,
};

function doorOf(seed = {}) {
  const files = fakeDisk(seed);
  const said = { marks: [], jumps: [] };
  return {
    files,
    said,
    list: async (folder) =>
      [...files.files.keys()]
        .filter((one) => one.startsWith(`${folder}/`))
        .map((one) => one.slice(folder.length + 1)),
    read: async (path) => (files.exists(path) ? files.read(path) : ""),
    imports: async (path) => {
      if (!MODULES[path]) throw new Error(`no module stands at ${path}`);
      return MODULES[path];
    },
    marksFields: (path, marks) => said.marks.push([path, marks]),
    jumps: async (path, line) => said.jumps.push([path, line]),
  };
}

const held = () => ({ [HOLD_FILE]: JSON.stringify(HOLD) });
const lastMarks = (door, path = PATH) =>
  door.said.marks.filter((one) => one[0] === path).at(-1)?.[1];
const named = (marks) => (marks ?? []).map((one) => [one.name, one.line]);

class Range {
  constructor(fromLine, fromAt, toLine, toAt) {
    this.start = { line: fromLine, character: fromAt };
    this.end = { line: toLine, character: toAt };
  }
}

class MarkdownString {
  constructor(value) {
    this.value = value;
  }
}

class Hover {
  constructor(contents, range) {
    this.contents = contents;
    this.range = range;
  }
}

const editor = { made: [], hovers: [], problems: [] };
const vscode = {
  Range,
  MarkdownString,
  Hover,
  window: {
    visibleTextEditors: [],
    createTextEditorDecorationType: (options) => {
      const look = { options, dispose: () => {} };
      editor.made.push(look);
      return look;
    },
  },
  workspace: { asRelativePath: (uri) => uri.path },
  languages: {
    registerHoverProvider: (selector, provider) => {
      editor.hovers.push({ selector, provider });
      return { dispose: () => {} };
    },
    createDiagnosticCollection: (name) => {
      editor.problems.push(name);
      return { set: () => {}, delete: () => {}, clear: () => {}, dispose: () => {} };
    },
  },
};
const require = editorRequire(vscode, import.meta.url);
const { fieldDoor } = require("../../src/extension/editor-fields.js");

function shownEditor(path, text) {
  const rows = text.split("\n");
  const one = {
    drawn: new Map(),
    document: {
      uri: { path },
      lineCount: rows.length,
      getText: () => text,
      lineAt: (line) => ({ range: new Range(line, 0, line, rows[line].length) }),
    },
    setDecorations: (look, ranges) => one.drawn.set(look, ranges),
  };
  return one;
}

function editorOn(text) {
  editor.made.length = 0;
  editor.hovers.length = 0;
  editor.problems.length = 0;
  const shown = shownEditor(PATH, text);
  vscode.window.visibleTextEditors = [shown];
  const context = { subscriptions: [] };
  return { shown, door: fieldDoor(context, { uri: {} }), context };
}

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a take marks every field the step still wants, and the door draws them in the information colour", async () => {
  const door = doorOf(held());
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);

  assert.deepEqual(
    named(lastMarks(door)),
    [
      ["tests", lineOf(TEXT, "### tests")],
      ["checked", lineOf(TEXT, "## tests-red")],
    ],
    "the empty field and the missing checked take a mark, and the filled one takes none",
  );

  const { shown, door: drawing } = editorOn(TEXT);
  drawing.marksFields(PATH, lastMarks(door));
  assert.equal(editor.made.length, 1);
  assert.match(editor.made[0].options.textDecoration, /underline wavy/);
  assert.match(editor.made[0].options.textDecoration, /editorInfo-foreground/);
  assert.deepEqual(
    (shown.drawn.get(editor.made[0]) ?? []).map((one) => one.start.line),
    [lineOf(TEXT, "### tests") - 1, lineOf(TEXT, "## tests-red") - 1],
  );
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a ticket nobody holds carries no mark", async () => {
  const other = { ...HOLD, hand: "box abc · claude-code" };
  const door = doorOf({ [`${HOLDS}/box-abc.json`]: JSON.stringify(other) });
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);
  assert.deepEqual(door.said.marks, [[PATH, []]]);

  await host.sees("spec/guidance/working.md", TEXT);
  assert.equal(lastMarks(door, "spec/guidance/working.md"), undefined);
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("the take puts the cursor on the next field to fill", async () => {
  const door = doorOf();
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);
  assert.deepEqual(door.said.jumps, []);

  door.files.write(HOLD_FILE, JSON.stringify(HOLD));
  await host.held();
  assert.deepEqual(door.said.jumps, [[PATH, lineOf(TEXT, "### tests")]]);

  await host.held();
  assert.equal(door.said.jumps.length, 1, "a hold standing already moves no cursor");
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a hold standing at activation moves no cursor", async () => {
  const door = doorOf(held());
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);
  await host.held();
  assert.deepEqual(door.said.jumps, []);
  assert.equal(named(lastMarks(door)).length, 2);
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a put-back takes every mark away", async () => {
  const door = doorOf(held());
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);
  assert.equal(named(lastMarks(door)).length, 2);

  door.files.remove(HOLD_FILE);
  await host.held();
  assert.deepEqual(lastMarks(door), []);

  const { shown, door: drawing } = editorOn(TEXT);
  drawing.marksFields(PATH, [{ line: 3, name: "tests", hover: "" }]);
  drawing.marksFields(PATH, []);
  assert.deepEqual(shown.drawn.get(editor.made[0]), []);
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a hover shows the step's does, and the field's form and says", async () => {
  const door = doorOf(held());
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);
  assert.equal(named(lastMarks(door)).length, 2);
  const [tests, checked] = lastMarks(door);

  for (const said of [
    "implement/tests-red",
    "writes the tests the ask calls for",
    "tests",
    "command",
    "the tests you write fail on their own assertion",
  ])
    assert.ok(tests.hover.includes(said), `the hover names ${said}`);
  for (const said of ["implement/tests-red", "checked", "checklist", FIRST, SECOND])
    assert.ok(checked.hover.includes(said), `the hover on checked names ${said}`);

  const { door: drawing } = editorOn(TEXT);
  drawing.marksFields(PATH, [tests, checked]);
  assert.equal(editor.hovers.length, 1);
  const { provider } = editor.hovers[0];
  const document = shownEditor(PATH, TEXT).document;
  const over = provider.provideHover(document, { line: tests.line - 1, character: 2 });
  assert.equal(over?.contents?.value, tests.hover);
  assert.equal(provider.provideHover(document, { line: 0, character: 0 }), undefined);
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a field filled in loses its mark", async () => {
  const door = doorOf(held());
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);
  assert.deepEqual(
    named(lastMarks(door)).map((one) => one[0]),
    ["tests", "checked"],
  );

  const filled = TEXT.replace(
    "<!-- the tests you write fail on their own assertion -->\n",
    "<!-- the tests you write fail on their own assertion -->\n\n    node --test test/level0/fields-to-fill.test.js\n",
  );
  await host.sees(PATH, filled);
  assert.deepEqual(named(lastMarks(door)), [
    ["checked", lineOf(filled, "## tests-red")],
  ]);
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("the door lists nothing in the Problems panel", async () => {
  const door = doorOf(held());
  const host = fieldMarksOf(door);
  await host.starts();
  await host.sees(PATH, TEXT);

  const { shown, door: drawing } = editorOn(TEXT);
  drawing.marksFields(PATH, lastMarks(door));
  assert.equal(shown.drawn.size, 1, "the marks stand in the editor");
  assert.deepEqual(editor.problems, [], "no diagnostic collection stands");
});

// [[spec/design_output/extension#a-take-marks-the-fields]]
test("a start hands the marks the ticket text and the hold watch", async () => {
  const disk = fakeDisk({
    "spec/config/level0.schema.json": JSON.stringify({
      type: "object",
      properties: {},
    }),
    ...held(),
  });
  const door = doorOf();
  door.files = disk;
  door.list = async (folder) =>
    [...disk.files.keys()]
      .filter((one) => one.startsWith(`${folder}/`))
      .map((one) => one.slice(folder.length + 1));
  door.read = async (path) => (disk.exists(path) ? disk.read(path) : "");
  const watched = [];
  const events = { editors: [], changes: [] };
  Object.assign(door, {
    holds: () => true,
    marks: () => {},
    quiets: () => {},
    registers: () => {},
    shows: () => {},
    toasts: () => {},
    write: async (path, text) => disk.write(path, text),
    watch: (paths, run) => watched.push({ paths, run }),
    registerView: () => {},
    page: () => null,
    panel: () => ({
      post: () => {},
      onMessage: () => {},
      hide: () => {},
      dispose: () => {},
    }),
    folds: () => {},
    onEditors: (run) => events.editors.push(run),
    onChange: (run) => events.changes.push(run),
  });
  await activate({}, door);

  await events.editors[0](PATH, TEXT);
  assert.equal(named(lastMarks(door)).length, 2, "an opened ticket takes its marks");
  await events.changes[0](PATH, TEXT.replace("### tests", "### tested"));
  assert.equal(lastMarks(door)[0].name, "tests", "a change draws the marks again");

  const holds = watched.find((one) => one.paths.some((path) => path.startsWith(HOLDS)));
  assert.ok(holds, "the marks watch the holds");
  disk.remove(HOLD_FILE);
  await holds.run();
  assert.deepEqual(lastMarks(door), []);
});
