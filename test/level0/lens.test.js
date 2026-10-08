// The buttons over a ticket, the marks and the drawing, read off the ticket
// text and a fake index whose door refuses every file read, list and watch,
// and the click behind each button posting its action through that index.
// [[spec/guidance/code/testing]] [[spec/tickets/the-lens-reads-v1]] [[spec/tickets/the-lens-calls-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { activate, SHOW } from "../../src/extension/extension.js";
import { fieldMarksOf } from "../../src/extension/lib/fields.js";
import {
  answerOf,
  fillArgvOf,
  lensesOf,
  personEnv,
  stepsIn,
  ticketLensOf,
  ticketOf,
} from "../../src/extension/lib/lens.js";
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
const picked = (process, route = []) => front([`process: ${process}`, ...route]);
const grouped = (group, more = []) =>
  front([
    "state: open",
    `group: ${group}`,
    ...more,
    "steps:",
    "  - name: draft",
    "step: draft",
  ]);

const PATH = "spec/tickets/one.md";
const OTHER = "spec/tickets/two.md";
const HOLD_FILE = ".se/.runtime/hold/person.json";
const HELD = ticketText("lens-held");
const titles = (lenses) => lenses.map((one) => [one.title, one.arguments[0] ?? ""]);
const lineOf = (heading) => HELD.split("\n").indexOf(heading) + 1;
const named = (marks) => marks.map((one) => [one.name, one.line]);
const WORK = { code: 0, out: "work\n  the next leaf\n", err: "" };

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
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

// [[spec/tickets/the-queue-views-agree]]
test("the buttons a ticket carries follow its state, its step, its hold and its cloud mark", () => {
  const mine = (step, hand = "person a-desk") => [{ ticket: "one", step, hand }];
  const inCloud = grouped("a-group", []);
  for (const [says, text, holds, want, path = PATH, cloud = false] of [
    [
      "an open ticket takes at its step",
      ticket("open"),
      [],
      [["Take this ticket at design/draft", "take"]],
    ],
    [
      "a named step takes there",
      ticket("open", "design/review"),
      [],
      [["Take this ticket at design/review", "take"]],
    ],
    [
      "an agent's step carries a line",
      ticket("open", "ship/push"),
      [],
      [["ship/push stands for agent", ""]],
    ],
    ["a closed ticket carries nothing", ticket("closed"), [], []],
    ["a draft carries nothing", ticket("draft"), [], []],
    [
      "a note outside the folders carries nothing",
      ticket("open"),
      [],
      [],
      "spec/notes/one.md",
    ],
    [
      "a person's hold carries pass, fail and drop",
      ticket("open", "design/draft"),
      mine("design/draft"),
      [
        ["Hand back design/draft: pass", "pass"],
        ["Hand back: fail…", "fail"],
        ["Drop", "drop"],
      ],
    ],
    [
      "a verdict leaf hands back with no flag",
      ticket("open", "design/review"),
      mine("design/review", "person"),
      [
        ["Hand back design/review: the verdict decides", "back"],
        ["Drop", "drop"],
      ],
    ],
    [
      "another hand's hold carries a line naming it",
      ticket("open"),
      mine("design/draft", "box a1 · claude-code"),
      [["held by box a1 · claude-code at design/draft", ""]],
    ],
    ["a group in the cloud carries nothing", inCloud, [], [], PATH, true],
    [
      "a ticket carrying the mark carries nothing",
      grouped("a-group", ["cloud: true"]),
      [],
      [],
    ],
    [
      "a group off the cloud keeps the take",
      inCloud,
      [],
      [["Take this ticket at draft", "take"]],
    ],
  ]) {
    const lenses = lensesOf({ path, text, holds, cloud });
    assert.deepEqual(titles(lenses), want, says);
    for (const one of lenses)
      assert.equal(one.command === "", one.arguments.length === 0, says);
  }
  const [pass] = lensesOf({
    path: PATH,
    text: ticket("open", "design/draft"),
    holds: mine("design/draft"),
  });
  assert.deepEqual(
    [pass.arguments, pass.command],
    [["pass", "one", PATH], "quackitect.ticket"],
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

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
test("a save fills a picked process over an empty route alone", () => {
  const fill = ["ticket", "fill", PATH];
  assert.deepEqual(fillArgvOf(PATH, picked("[[spec/processes/trivial]]")), fill);
  assert.deepEqual(
    fillArgvOf(PATH, picked("[[spec/processes/trivial]]", ["steps: []"])),
    fill,
  );
  assert.deepEqual(fillArgvOf(PATH, picked("[[spec/processes/trivial]]", ROUTE)), []);
  assert.deepEqual(fillArgvOf(PATH, picked("")), []);
  assert.deepEqual(fillArgvOf(PATH, picked('""')), []);
  assert.deepEqual(
    fillArgvOf("spec/notes/one.md", picked("[[spec/processes/trivial]]")),
    [],
  );
});

// The editor's door over the fake index: it reads its own two files, every other read, list or watch refuses, and each action answers as the case says. [[spec/tickets/the-lens-reads-v1]]
function doorOf({ seed = {}, typed = "", answer = WORK } = {}) {
  const files = fakeDisk({ [SCHEMA]: JSON.stringify(schema), ...seed });
  const refuses = (name) => (path) =>
    assert.fail(`the lens calls ${name}(${JSON.stringify(path)})`);
  const said = {
    saved: [],
    ran: [],
    says: [],
    told: [],
    changed: 0,
    asked: [],
    marks: [],
    pages: [],
    editors: [],
  };
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
  const index = v1Over(files);
  return {
    files,
    said,
    index: {
      ...index,
      acts: async (name, input) => {
        said.ran.push([name, input]);
        return answer;
      },
    },
    read: async (path) => {
      if (path !== SCHEMA && path !== SHOW) refuses("door.read")(path);
      return files.exists(path) ? files.read(path) : "";
    },
    list: refuses("door.list"),
    watch: refuses("door.watch"),
    write: async () => {},
    asksLine: async (prompt) => {
      said.asked.push(prompt);
      return typed;
    },
    saves: async (path) => said.saved.push(path),
    says: (lines) => said.says.push(lines),
    tells: (title, detail, refused) => said.told.push([title, detail, refused]),
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
    marksFields: (path, marks) => said.marks.push([path, marks]),
    jumps: async () => {},
    page: pageOf,
    panel: (path) => pageOf(path),
    ...{ folds() {}, unfolds() {}, theme: () => "dark" },
  };
}
const pull = (args) => ["ticket/pull", { args, person: true }];

// [[spec/design_output/extension#a-button-runs-the-pull]]
test("each button posts ticket/pull with its words as a person, and a pass saves first and says the answer", async () => {
  for (const [act, args] of [
    ["take", ["one"]],
    ["back", ["one"]],
    ["pass", ["one", "--pass"]],
    ["fail", ["one", "--fail", "the ask stands unmet"]],
    ["drop", ["--drop"]],
  ]) {
    const door = doorOf({ typed: "the ask stands unmet" });
    await ticketLensOf(door).took(act, "one", PATH);
    assert.deepEqual(door.said.ran, [pull(args)], act);
    if (act === "take" || act === "pass")
      assert.deepEqual(door.said.saved, act === "pass" ? [PATH] : [], act);
  }
  const door = doorOf();
  await ticketLensOf(door).took("pass", "one", PATH);
  assert.deepEqual(door.said.told, [["one: work", "the next leaf", false]]);
  assert.equal(door.said.says[0][0], "./RUNME.sh ticket pull one --pass");
  assert.equal(door.said.changed, 1);

  const quiet = doorOf({ typed: "  " });
  assert.equal(await ticketLensOf(quiet).took("fail", "one", PATH), undefined);
  assert.deepEqual(
    [quiet.said.ran, quiet.said.asked.length],
    [[], 1],
    "a fail with no reason runs nothing",
  );

  const refused = doorOf({
    answer: { code: 1, err: "refused\n  the leaf holds no hand" },
  });
  await ticketLensOf(refused).took("pass", "one", PATH);
  assert.deepEqual(refused.said.told, [
    ["one: refused", "the leaf holds no hand", true],
  ]);
});

test("a save the fill takes posts ticket/fill and says it, and a standing route posts nothing", async () => {
  const door = doorOf();
  await ticketLensOf(door).saved(PATH, picked("[[spec/processes/trivial]]"));
  assert.deepEqual(door.said.ran, [["ticket/fill", { args: [PATH], person: true }]]);
  assert.equal(door.said.says[0][0], `./RUNME.sh ticket fill ${PATH}`);
  assert.deepEqual(door.said.told, []);

  const stands = doorOf();
  await ticketLensOf(stands).saved(PATH, ticket("open", "design/draft"));
  assert.deepEqual([stands.said.ran, stands.said.says], [[], []]);
});

// The two texts the fronts golden holds, a ticket in the cloud group and the group. [[spec/tickets/schema-libs-leave]]
const UNDER = front([
  "state: open",
  "group: up-there",
  "steps:",
  "  - name: draft",
  "    does: writes the approach",
  "step: draft",
]);
const HELD_SEED = {
  [PATH]: HELD,
  [OTHER]: UNDER,
  "spec/tickets/up-there.md": [
    "---",
    "kind: [[ticket]]",
    "state: open",
    "cloud: true",
    "---",
    "",
  ].join("\n"),
  [HOLD_FILE]: JSON.stringify({
    ticket: "one",
    path: PATH,
    step: "implement/tests-red",
    hand: "person",
  }),
};
const lastMarks = (door) =>
  door.said.marks.filter((one) => one[0] === PATH).at(-1)?.[1];

test("a held ticket draws its marks and route off the index, and reads no file", async () => {
  const door = doorOf({ seed: HELD_SEED });
  const marks = await fieldMarksOf(door).sees(PATH, HELD);
  assert.deepEqual(named(marks), [
    ["tests", lineOf("### tests")],
    ["checked", lineOf("## tests-red")],
  ]);
  assert.deepEqual(named(lastMarks(door)), named(marks), "the marks reach the editor");
  await routeHostOf(door).opened(PATH, HELD);
  const page = door.said.pages[0];
  page.hears({ kind: "ready" });
  const { graph, steps } = ticketDrawn("lens-held");
  assert.deepEqual(page.posts[0], { kind: "graph", graph, steps, held: true });
});

test("the lens reads holds/standing and tickets/cloud, and a watch event draws all three again", async () => {
  const door = doorOf({ seed: HELD_SEED });
  const tickets = ticketLensOf(door);
  assert.deepEqual(
    titles(await tickets.lenses(PATH, HELD)).map((one) => one[0]),
    ["Hand back implement/tests-red: pass", "Hand back: fail…", "Drop"],
  );
  assert.deepEqual(
    await tickets.lenses(OTHER, UNDER),
    [],
    "a group in the cloud draws no button",
  );
  assert.deepEqual(tickets.names, ["holds/standing", "tickets/cloud"]);
  for (const names of [fieldMarksOf(door).names, routeHostOf(door).names])
    for (const one of ["holds/standing", "tickets/all"])
      assert.ok(names.includes(one), one);

  await activate({}, door);
  for (const run of door.said.editors) await run(PATH, HELD);
  const page = door.said.pages.at(-1);
  page.hears({ kind: "ready" });
  assert.equal(page.posts[0]?.held, true);
  assert.equal(lastMarks(door)?.length, 2);

  door.files.files.delete(HOLD_FILE);
  const lensed = door.said.changed;
  await door.index.fire("holds/standing");
  assert.deepEqual(lastMarks(door), [], "the marks leave with the hold");
  assert.deepEqual(
    [page.posts.at(-1)?.kind, page.posts.at(-1)?.held],
    ["graph", false],
  );
  assert.ok(door.said.changed > lensed, "the buttons draw again");
});
