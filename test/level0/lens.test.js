// A ticket's id, its route and the drawing over it, read off the ticket text
// and a fake index whose door refuses every file read, list and watch. The
// server's own cases hold the buttons and the marks.
// [[spec/guidance/code/testing]] [[spec/tickets/the-lens-reads-v1]] [[spec/tickets/extension-keeps-the-editor-parts]]

import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { activate, SHOW } from "../../src/extension/extension.js";
import { answerOf, personEnv, stepsIn, ticketOf } from "../../src/extension/lib/lens.js";
import { routeHostOf } from "../../src/extension/lib/route-host.js";
import { SCHEMA } from "../../src/extension/sidebar.js";
import { ticketDrawn, ticketText, v1Over } from "./v1-index.js";

const ROUTE = [
  "steps:",
  "  - name: design",
  "    steps:",
  "      - name: draft",
  "        by: anyone",
  "        evidence:",
  "          - name: approach",
  "            form: text",
  "      - name: review",
  "        evidence:",
  "          - name: verdict",
  "            form: verdict",
  "  - name: ship",
  "    by: agent",
  "    steps:",
  "      - name: push",
  "        evidence:",
  "          - name: pushed",
  "            form: command",
];
const front = (lines) =>
  ["---", "kind: [[ticket]]", ...lines, "---", "", "# Ask", ""].join("\n");
const ticket = (state, step) =>
  front([`state: ${state}`, ...(step ? [`step: ${step}`] : []), ...ROUTE]);

const PATH = "spec/tickets/one.md";
const HOLD_FILE = ".se/.runtime/hold/person.json";
const HELD = ticketText("lens-held");
const WORK = { code: 0, out: "work\n  the next leaf\n", err: "" };

// [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
test("a ticket stands under either folder, its file name its id, and its route nests as the frontmatter does", () => {
  assert.equal(ticketOf("spec/tickets/one.md"), "one");
  assert.equal(ticketOf(".se/tickets/two.md"), "two");
  assert.equal(ticketOf("C:\\tree\\spec\\tickets\\three.md"), "three");
  assert.equal(ticketOf("spec/design_output/pull.md"), "");
  assert.equal(ticketOf("spec/tickets/deeper/four.md"), "");
  assert.deepEqual(
    stepsIn(ticket("open")).map((one) => [one.path, one.leaf, one.by, one.verdict]),
    [
      ["design", false, "", false],
      ["design/draft", true, "anyone", false],
      ["design/review", true, "", true],
      ["ship", false, "agent", false],
      ["ship/push", true, "", false],
    ],
  );
  // A route item opening on a key other than its name still reads as a step. [[spec/tickets/a-count-meets-the-lint]]
  const opensOnBy = front([
    "state: open",
    "steps:",
    "  - by: person",
    "    name: decide",
  ]);
  assert.deepEqual(
    stepsIn(opensOnBy).map((one) => `${one.path}:${one.by}:${one.leaf}`),
    ["decide:person:true"],
  );
});

// [[spec/design_output/extension#the-child-names-no-harness]]
test("the child's environment names no harness, and the answer word comes off either stream", () => {
  const env = {
    CLAUDECODE: "1",
    CLAUDE_CODE_REMOTE: "true",
    SE_CLOUD: "1",
    PATH: "/bin",
  };
  assert.deepEqual(personEnv(env, "/tree"), { PATH: "/bin", SE_WORK_ROOT: "/tree" });
  assert.equal(env.CLAUDECODE, "1", "the extension's own environment stays");
  assert.equal(
    answerOf({ code: 1, out: "", err: "refused\n  the ask stands thin\n" }).word,
    "refused",
  );
  assert.deepEqual(answerOf(WORK), {
    ...answerOf(WORK),
    word: "work",
    detail: "the next leaf",
  });
  assert.equal(
    answerOf({ code: 2, out: "", err: "--fail takes a reason\n" }).word,
    "refused",
  );
});

// The editor's door over the fake index: it reads its own two files, and every other read, list or watch refuses. [[spec/tickets/the-lens-reads-v1]]
function doorOf({ seed = {} } = {}) {
  const files = fakeDisk({ [SCHEMA]: JSON.stringify(schema), ...seed });
  const refuses = (name) => (path) =>
    assert.fail(`the drawing calls ${name}(${JSON.stringify(path)})`);
  const said = { changed: 0, pages: [], editors: [] };
  const pageOf = (path) => {
    const page = {
      path,
      posts: [],
      hears: () => {},
      post: (one) => page.posts.push(one),
    };
    Object.assign(page, {
      onMessage: (hear) => (page.hears = hear),
      onGone() {},
      hide() {},
      show() {},
      dispose() {},
    });
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
    list: refuses("door.list"),
    watch: refuses("door.watch"),
    write: async () => {},
    lensChanged: () => (said.changed += 1),
    ...{
      holds: () => true,
      marks() {},
      quiets() {},
      registers() {},
      shows() {},
      toasts() {},
      registerView() {},
      lenses() {},
    },
    onEditors: (run) => said.editors.push(run),
    jumps: async () => {},
    page: pageOf,
    panel: (path) => pageOf(path),
    ...{ folds() {}, unfolds() {}, theme: () => "dark" },
  };
}

const SEED = {
  [PATH]: HELD,
  [HOLD_FILE]: JSON.stringify({
    ticket: "one",
    path: PATH,
    step: "implement/tests-red",
    hand: "person",
  }),
};

test("a held ticket draws its route off the index, and reads no file", async () => {
  const door = doorOf({ seed: SEED });
  await routeHostOf(door).opened(PATH, HELD);
  const page = door.said.pages[0];
  page.hears({ kind: "ready" });
  const { graph, steps } = ticketDrawn("lens-held");
  assert.deepEqual(page.posts[0], { kind: "graph", graph, steps, held: true });
});

test("the drawing reads holds/standing and tickets/all, and a watch event draws it again", async () => {
  const door = doorOf({ seed: SEED });
  for (const one of ["holds/standing", "tickets/all"])
    assert.ok(routeHostOf(door).names.includes(one), one);

  await activate({}, door);
  for (const run of door.said.editors) await run(PATH, HELD);
  const page = door.said.pages.at(-1);
  page.hears({ kind: "ready" });
  assert.equal(page.posts[0]?.held, true);
  assert.ok(door.said.changed > 0, "an opened ticket draws its flip");

  door.files.files.delete(HOLD_FILE);
  await door.index.fire("holds/standing");
  assert.deepEqual(
    [page.posts.at(-1)?.kind, page.posts.at(-1)?.held],
    ["graph", false],
  );
});
