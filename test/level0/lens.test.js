// The buttons over a ticket, read off the ticket text and the holds alone, and
// the click behind them over a fake editor. No editor and no pull runs here.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  answerOf,
  argvOf,
  fillArgvOf,
  HOLDS,
  lensesOf,
  personEnv,
  stepsIn,
  ticketLensOf,
  ticketOf,
} from "../../src/extension/lib/lens.js";

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

const ticket = (state, step) =>
  [
    "---",
    "kind: [[ticket]]",
    `state: ${state}`,
    ...(step ? [`step: ${step}`] : []),
    ...ROUTE,
    "---",
    "",
    "# Ask",
    "",
  ].join("\n");

const PATH = "spec/tickets/one.md";
const titles = (lenses) => lenses.map((one) => [one.title, one.arguments[0] ?? ""]);

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
test("a ticket stands under either folder, and its file name is its id", () => {
  assert.equal(ticketOf("spec/tickets/one.md"), "one");
  assert.equal(ticketOf(".se/tickets/two.md"), "two");
  assert.equal(ticketOf("C:\\tree\\spec\\tickets\\three.md"), "three");
  assert.equal(ticketOf("spec/design_output/pull.md"), "");
  assert.equal(ticketOf("spec/tickets/deeper/four.md"), "");
});

test("the route reads as the frontmatter nests it, with each leaf's by and verdict", () => {
  const steps = stepsIn(ticket("open"));
  assert.deepEqual(
    steps.map((one) => [one.path, one.leaf, one.by, one.verdict]),
    [
      ["design", false, "", false],
      ["design/draft", true, "anyone", false],
      ["design/review", true, "", true],
      ["ship", false, "agent", false],
      ["ship/push", true, "", false],
    ],
  );
});

test("an open ticket nobody holds carries the take at the step it stands on", () => {
  assert.deepEqual(titles(lensesOf({ path: PATH, text: ticket("open"), holds: [] })), [
    ["Take this ticket at design/draft", "take"],
  ]);
  assert.deepEqual(
    titles(
      lensesOf({
        path: PATH,
        text: ticket("open", "design/review"),
        holds: [],
      }),
    ),
    [["Take this ticket at design/review", "take"]],
  );
});

test("a step an agent takes carries a line and no button", () => {
  const [one] = lensesOf({
    path: PATH,
    text: ticket("open", "ship/push"),
    holds: [],
  });
  assert.equal(one.title, "ship/push stands for agent");
  assert.equal(one.command, "");
});

test("a closed ticket, a draft and a note outside the folders carry nothing", () => {
  assert.deepEqual(lensesOf({ path: PATH, text: ticket("closed"), holds: [] }), []);
  assert.deepEqual(lensesOf({ path: PATH, text: ticket("draft"), holds: [] }), []);
  assert.deepEqual(
    lensesOf({ path: "spec/notes/one.md", text: ticket("open"), holds: [] }),
    [],
  );
});

test("a person's hold carries pass, fail and drop", () => {
  const holds = [{ ticket: "one", step: "design/draft", hand: "person a-desk" }];
  const lenses = lensesOf({
    path: PATH,
    text: ticket("open", "design/draft"),
    holds,
  });
  assert.deepEqual(titles(lenses), [
    ["Hand back design/draft: pass", "pass"],
    ["Hand back: fail…", "fail"],
    ["Drop", "drop"],
  ]);
  assert.deepEqual(lenses[0].arguments, ["pass", "one", PATH]);
  assert.equal(lenses[0].command, "quackitect.ticket");
});

test("a leaf holding a verdict field hands back with no flag", () => {
  const holds = [{ ticket: "one", step: "design/review", hand: "person" }];
  assert.deepEqual(
    titles(lensesOf({ path: PATH, text: ticket("open", "design/review"), holds })),
    [
      ["Hand back design/review: the verdict decides", "back"],
      ["Drop", "drop"],
    ],
  );
});

test("another hand's hold carries a line naming it, and no take", () => {
  const holds = [{ ticket: "one", step: "design/draft", hand: "box a1 · claude-code" }];
  const [one, ...rest] = lensesOf({ path: PATH, text: ticket("open"), holds });
  assert.equal(one.title, "held by box a1 · claude-code at design/draft");
  assert.equal(one.command, "");
  assert.deepEqual(rest, []);
});

// [[spec/design_output/pull#the-answers]]
test("each button builds its pull line", () => {
  assert.deepEqual(argvOf("take", "one"), ["ticket", "pull", "one"]);
  assert.deepEqual(argvOf("pass", "one"), ["ticket", "pull", "one", "--pass"]);
  assert.deepEqual(argvOf("fail", "one", "the test stays red"), [
    "ticket",
    "pull",
    "one",
    "--fail",
    "the test stays red",
  ]);
  assert.deepEqual(argvOf("back", "one"), ["ticket", "pull", "one"]);
  assert.deepEqual(argvOf("drop", "one"), ["ticket", "pull", "--drop"]);
  assert.deepEqual(argvOf("other", "one"), []);
});

// [[spec/design_output/extension#the-child-names-no-harness]]
test("the child's environment names no harness, and names the open folder", () => {
  const env = {
    CLAUDECODE: "1",
    CLAUDE_CODE_REMOTE: "true",
    SE_CLOUD: "1",
    PATH: "/bin",
  };
  assert.deepEqual(personEnv(env, "/tree"), {
    PATH: "/bin",
    SE_WORK_ROOT: "/tree",
  });
  assert.equal(env.CLAUDECODE, "1", "the extension's own environment stays");
});

test("the answer word comes off either stream, and an exit stands in for a missing one", () => {
  assert.deepEqual(
    answerOf({ code: 1, out: "", err: "refused\n  the ask stands thin\n" }).word,
    "refused",
  );
  const work = answerOf({
    code: 0,
    out: "work\n  one at design/draft\n",
    err: "",
  });
  assert.equal(work.word, "work");
  assert.equal(work.detail, "one at design/draft");
  assert.equal(
    answerOf({ code: 2, out: "", err: "--fail takes a reason\n" }).word,
    "refused",
  );
});

// [[spec/design_output/extension#a-button-runs-the-pull]]
function doorOf(seed, typed = "") {
  const said = {
    saved: [],
    ran: [],
    says: [],
    told: [],
    changed: 0,
    asked: [],
  };
  return {
    said,
    list: async (folder) =>
      Object.keys(seed)
        .filter((one) => one.startsWith(`${folder}/`))
        .map((one) => one.slice(folder.length + 1)),
    read: async (path) => seed[path] ?? "",
    asksLine: async (prompt) => {
      said.asked.push(prompt);
      return typed;
    },
    saves: async (path) => said.saved.push(path),
    runsVerb: async (argv) => {
      said.ran.push(argv);
      return { code: 0, out: "work\n  the next leaf\n", err: "" };
    },
    says: (lines) => said.says.push(lines),
    tells: (title, detail, refused) => said.told.push([title, detail, refused]),
    lensChanged: () => {
      said.changed += 1;
    },
  };
}

test("the lenses read the holds off the hold folder", async () => {
  const hold = { ticket: "one", step: "design/draft", hand: "person a-desk" };
  const lens = ticketLensOf(
    doorOf({ [`${HOLDS}/person-a-desk.json`]: JSON.stringify(hold) }),
  );
  const said = await lens.lenses(PATH, ticket("open", "design/draft"));
  assert.equal(said[0].arguments[0], "pass");
  assert.deepEqual(lens.watches, [`${HOLDS}/*.json`, ".se/.runtime/hold.json"]);
});

test("a pass saves the ticket, runs the pull, and says the answer", async () => {
  const door = doorOf({});
  await ticketLensOf(door).took("pass", "one", PATH);
  assert.deepEqual(door.said.saved, [PATH]);
  assert.deepEqual(door.said.ran, [["ticket", "pull", "one", "--pass"]]);
  assert.deepEqual(door.said.told, [["one: work", "the next leaf", false]]);
  assert.equal(door.said.says[0][0], "./RUNME.sh ticket pull one --pass");
  assert.equal(door.said.changed, 1);
});

test("a fail with no reason runs nothing, and a take saves nothing", async () => {
  const quiet = doorOf({}, "  ");
  assert.equal(await ticketLensOf(quiet).took("fail", "one", PATH), undefined);
  assert.deepEqual(quiet.said.ran, []);
  assert.equal(quiet.said.asked.length, 1);

  const took = doorOf({});
  await ticketLensOf(took).took("take", "one", PATH);
  assert.deepEqual(took.said.saved, []);
  assert.deepEqual(took.said.ran, [["ticket", "pull", "one"]]);
});

// A route item opening on a key other than its name still reads as a step, and carries its hand. [[spec/tickets/a-count-meets-the-lint]]
test("a step whose item opens on by names its leaf and its hand", () => {
  const text = [
    "---",
    "kind: [[ticket]]",
    "state: open",
    "steps:",
    "  - by: person",
    "    name: decide",
    "---",
    "",
  ].join("\n");
  assert.deepEqual(
    stepsIn(text).map((one) => `${one.path}:${one.by}:${one.leaf}`),
    ["decide:person:true"],
  );
});

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
const picked = (process, route = []) =>
  [
    "---",
    "kind: [[ticket]]",
    `process: ${process}`,
    ...route,
    "---",
    "",
    "# Ask",
    "",
  ].join("\n");

test("a save over a picked process and an empty route runs the fill on the path", () => {
  assert.deepEqual(fillArgvOf(PATH, picked("[[spec/processes/trivial]]")), [
    "ticket",
    "fill",
    PATH,
  ]);
  assert.deepEqual(fillArgvOf(PATH, picked("[[spec/processes/trivial]]", ["steps: []"])), [
    "ticket",
    "fill",
    PATH,
  ]);
});

test("a save over a ticket whose route stands runs nothing", () => {
  assert.deepEqual(fillArgvOf(PATH, picked("[[spec/processes/trivial]]", ROUTE)), []);
});

test("a save over an empty process, or a file outside the ticket folders, runs nothing", () => {
  assert.deepEqual(fillArgvOf(PATH, picked("")), []);
  assert.deepEqual(fillArgvOf(PATH, picked('""')), []);
  assert.deepEqual(fillArgvOf("spec/notes/one.md", picked("[[spec/processes/trivial]]")), []);
});

test("a saved ticket the fill takes runs the verb, and says the answer", async () => {
  const door = doorOf({});
  await ticketLensOf(door).saved(PATH, picked("[[spec/processes/trivial]]"));
  assert.deepEqual(door.said.ran, [["ticket", "fill", PATH]]);
  assert.equal(door.said.says[0][0], `./RUNME.sh ticket fill ${PATH}`);
  assert.deepEqual(door.said.told, []);
});

test("a saved ticket whose route stands runs nothing, and says nothing", async () => {
  const door = doorOf({});
  await ticketLensOf(door).saved(PATH, ticket("open", "design/draft"));
  assert.deepEqual(door.said.ran, []);
  assert.deepEqual(door.said.says, []);
});
