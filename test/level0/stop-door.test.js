// The stop door over a fake box: a standing stop ends the turn with nothing
// after it, a helper's turn end passes untouched, and a turn with no stop
// line holds with the ask.
// [[spec/design_output/stop#a-standing-stop-ends-it]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { STOP_CALL } from "../../.claude/skills/level0/lib/stop.js";
import { leafBy } from "../../.claude/skills/level0/lib/ticket.js";
import { onPromptSubmit } from "../../src/bridge/answer.js";
import {
  dropsHold,
  onStop,
  reportStands,
  sawPrompt,
  TOOLS,
} from "../../src/bridge/stop.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: the-owner-asks-to-talk
  side: stop
  priority: 100
  decides: claimed
  runs: a-report-stands
  asks: Does the last thing the owner said open a discussion, and does this message carry the report?
  says: The owner opens a discussion, and the report stands, so this turn ends and waits.

- id: the-queue-holds-work
  side: continue
  priority: 80
  decides: mechanical
  runs: queue-waits
  says: The queue holds work for this box, so run ./RUNME.sh ticket pull and carry on.

- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.

- id: the-work-stands-complete
  side: stop
  priority: 45
  decides: claimed
  yields: true
  runs: the-plan-is-empty
  asks: Does the work stand complete, with no todo open in the plan and nothing in hand there?
  says: The work stands complete, so this turn ends.

- id: the-tooth-is-out
  side: continue
  priority: 0
  decides: mechanical
  runs: stop-hook-off
  says: The stop hook stands off.
`;

const NOW = 1_800_000_000;

function box(files = {}) {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: JSON.stringify({
      stop: { enabled: true, mostInARow: 3, hold: "off" },
      engine: { binding: "queue" },
    }),
    [at("spec/config/stop/level0.yml")]: RULES,
    ...files,
  });
  const said = [];
  return {
    said,
    box: {
      disk,
      work: ROOT,
      method: ROOT,
      env: {},
      clock: { now: () => new Date(NOW * 1000) },
      proc: fakeProc({
        "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
      }),
      log: { say: (...row) => said.push(row) },
    },
  };
}

// A cloud box reads its own map, so the queue rule stands off without any read outside. [[spec/design_output/doors#a-door-reads-the-outside]]
test("the queue rule reads the cloud off the box's own environment", () => {
  const free =
    "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n";
  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };

  const here = box({ [at("spec/tickets/a-free.md")]: free });
  here.box.env = { CLAUDE_CODE_REMOTE: "true" };
  const said = onStop(done, here.box);
  assert.deepEqual(said, { pass: true }, "a cloud box reads no queue");

  const desk = box({ [at("spec/tickets/a-free.md")]: free });
  const held = onStop(done, desk.box);
  assert.match(held.result.block, /The queue holds work for this box/);

  // A box carrying no map reads as a desk, whatever the process around it says. [[spec/design_output/doors#a-door-reads-the-outside]]
  const bare = box({ [at("spec/tickets/a-free.md")]: free });
  bare.box.env = undefined;
  const was = process.env.CLAUDE_CODE_REMOTE;
  process.env.CLAUDE_CODE_REMOTE = "true";
  try {
    assert.match(
      onStop(done, bare.box).result.block,
      /The queue holds work for this box/,
    );
  } finally {
    if (was === undefined) delete process.env.CLAUDE_CODE_REMOTE;
    else process.env.CLAUDE_CODE_REMOTE = was;
  }
});

// The cap ends a turn over the queue rule too, so a session refusing the stop line over work it leaves untaken ends at the number the config names. [[spec/tickets/the-stop-line-loops-forever]]
test("four stop lines over a queue holding work: three hold, the fourth ends, and the log names the runaway", () => {
  const free =
    "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n";
  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };
  const it = box({ [at("spec/tickets/a-free.md")]: free });
  const carried = [];
  for (let turn = 0; turn < 4; turn++) carried.push(onStop(done, it.box));
  assert.deepEqual(
    carried.map((one) => one.pass === true),
    [false, false, false, true],
  );
  assert.match(carried[0].result.block, /The queue holds work for this box/);
  const last = it.said.filter((row) => row[1] === "stop").at(-1);
  assert.equal(last[0], "warn", "the runaway writes at warn");
  assert.match(last[2], /the turn ends: the tooth lets go after 3 holds in a row/);
});

// The group rule as the tree writes it, so the hold a case reads is the one a box reads. [[spec/design_output/stop#three-in-a-row]]
const LEVEL1 = readFileSync(
  new URL("../../spec/config/stop/level1.yml", import.meta.url),
  "utf8",
);
const HELD_GROUP =
  "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/group]]\nrecord:\n  - hash_before: abc123\n---\n\n# Ask\n\nA group.\n";

function holdingGroup(env) {
  const it = box({
    [at("spec/config/stop/level1.yml")]: LEVEL1,
    [at("spec/tickets/a-group.md")]: HELD_GROUP,
  });
  it.box.env = env;
  it.box.proc = fakeProc({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/a-group\n" },
  });
  return it;
}

// A cloud box ends only with its branch handed back, so the cap frees none holding a group. [[spec/design_output/stop#three-in-a-row]]
test("a cloud box holding a group holds past the cap, and the hold names branch done", () => {
  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };
  const it = holdingGroup({ CLAUDE_CODE_REMOTE: "true" });
  const carried = [];
  for (let turn = 0; turn < 5; turn++) carried.push(onStop(done, it.box));
  assert.deepEqual(
    carried.map((one) => one.pass === true),
    [false, false, false, false, false],
    "the fourth hold and the fifth still hold",
  );
  assert.match(carried[3].result.block, /\.\/RUNME\.sh branch done/);
});

// [[spec/design_output/stop#three-in-a-row]]
test("a desk holding a group ends at the cap as before", () => {
  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };
  const it = holdingGroup({});
  const carried = [];
  for (let turn = 0; turn < 4; turn++) carried.push(onStop(done, it.box));
  assert.deepEqual(
    carried.map((one) => one.pass === true),
    [false, false, false, true],
  );
  assert.match(carried[0].result.block, /This box holds a group/);
});

test("a standing stop line ends the turn, and nothing prompts after it", () => {
  const it = box();
  const said = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.equal(
    it.said.filter((row) => row[1] === "stop").length,
    1,
    "one stop line in the log",
  );
  assert.match(it.said[0][2], /the turn ends/);
});

// A talk stop with no report in the same message holds the turn, and one under the needs table ends it. [[spec/design_output/stop#a-talk-follows-a-report]]
test("a talk stop ends the turn only where the same message carries the report", () => {
  const bare = onStop(
    { last_assistant_message: "stop: the-owner-asks-to-talk" },
    box().box,
  );
  assert.match(bare.result.block, /the-owner-asks-to-talk: .*carry the report/);
  const report = [
    "The work stands here.",
    "",
    "# What the agent needs",
    "",
    "| No. | question | proposed answer |",
    "|---|---|---|",
    "| 1 | which road | the short one |",
    "",
    "stop: the-owner-asks-to-talk",
  ].join("\n");
  const it = box();
  assert.deepEqual(onStop({ last_assistant_message: report }, it.box), { pass: true });
  assert.match(it.said[0][2], /the turn ends/);
  assert.equal(
    reportStands("# What the agent needs\n\nnothing under it"),
    false,
    "a heading with no row is no report",
  );
});

// A report an earlier message of this turn carries stands, so the stop line comes alone; an owner's prompt opens a turn with none. [[spec/design_output/stop#a-talk-follows-a-report]]
test("a stop line alone passes the talk where this turn's report stands, and a prompt clears it", () => {
  const report = [
    "The work stands here.",
    "",
    "# What the agent needs",
    "",
    "| No. | question | proposed answer |",
    "|---|---|---|",
    "| 1 | which road | the short one |",
  ].join("\n");
  const line = { last_assistant_message: "stop: the-owner-asks-to-talk" };
  const it = box();
  assert.ok(onStop({ last_assistant_message: report }, it.box).result?.block);
  assert.deepEqual(onStop(line, it.box), { pass: true });
  onPromptSubmit({ origin: { kind: "composer" }, text: "go on" }, it.box);
  assert.match(onStop(line, it.box).result.block, /a-report-stands answers false/);
});

// A claim of done meets the plan: a todo open or a thing in hand holds the turn, and an empty plan lets it end. [[spec/design_output/stop#the-plan]]
test("a claim of done holds while the plan holds a todo or a thing in hand", () => {
  const done = {
    last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete",
  };
  const busy = box({
    [at(".se/.runtime/plan.json")]: JSON.stringify({ working: "the door", todos: [] }),
  });
  assert.match(onStop(done, busy.box).result.block, /nothing in hand/);
  const parked = box({
    [at(".se/.runtime/plan.json")]: JSON.stringify({
      working: "",
      todos: [{ title: "one" }],
    }),
  });
  assert.match(onStop(done, parked.box).result.block, /no todo open/);
  const empty = box({
    [at(".se/.runtime/plan.json")]: JSON.stringify({ working: "", todos: [] }),
  });
  assert.deepEqual(onStop(done, empty.box), { pass: true });
});

// A refusal names the check that falls and what it sees, so a stop line standing whole hears no claim of a missing reason. [[spec/design_output/stop#a-refusal-names-its-check]]
test("a claim of done over a thing in hand hears the check and the thing, at the call and at the turn's end", () => {
  const plan = {
    [at(".se/.runtime/plan.json")]: JSON.stringify({ working: "the door", todos: [] }),
  };
  const busy = box(plan);
  const block = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    busy.box,
  ).result.block;
  assert.match(
    block,
    /check the-plan-is-empty answers false: the plan still holds "the door"/,
  );
  assert.doesNotMatch(block, /names no stop reason/);

  const called = box(plan);
  const refused = TOOLS[STOP_CALL]({ reason: "the-work-stands-complete" }, called.box);
  assert.match(refused.result.result, /^The claim falls\. .*"the door".*under done/);
  assert.equal(
    called.box.claim,
    undefined,
    "a claim that falls stands nowhere for the turn's end",
  );

  const clear = box({
    [at(".se/.runtime/plan.json")]: JSON.stringify({ working: "", todos: [] }),
  });
  assert.match(
    TOOLS[STOP_CALL]({ reason: "the-work-stands-complete" }, clear.box).result.result,
    /^The claim stands/,
  );
});

test("a line naming a reason nobody holds hears that, and a turn with no line hears the plain rule", () => {
  const block = onStop(
    { last_assistant_message: "Done.\n\nstop: the-moon-is-full" },
    box().box,
  ).result.block;
  assert.match(block, /claims the-moon-is-full, which names no reason this tree holds/);
  const bare = onStop({ last_assistant_message: "Done." }, box().box).result.block;
  assert.match(bare, /^The last line names no stop reason/);
});

test("a helper's turn end passes untouched, so a refused helper answer reaches no owner turn", () => {
  const it = box();
  const said = onStop(
    { agentId: "a1", last_assistant_message: "No stop line here." },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.equal(it.said.length, 0, "the door writes nothing for a helper");
});

test("a turn with no stop line holds, and the block names the reasons", () => {
  const it = box();
  const said = onStop({ last_assistant_message: "Some text and no stop." }, it.box);
  assert.match(said.result.block, /names no stop reason/);
  assert.match(
    said.result.block,
    /the-work-stands-complete: Does the work stand complete/,
  );
  const row = it.said.find((one) => one[1] === "stop");
  assert.match(row[2], /the turn holds/);
  assert.match(
    row[3].prompts,
    /names no stop reason/,
    "the log carries what prompts after",
  );
});

// A rule naming a check the door holds nowhere stands out of the vote. [[spec/design_output/stop#the-mechanical-checks]]
test("a rule running a name every object carries fires nothing", () => {
  const fired = `
- id: the-stop-hook-holds-this-turn
  side: continue
  priority: 90
  decides: mechanical
  runs: constructor
  says: A name nobody wrote holds this turn open.
${RULES}`;
  const it = box({ [at("spec/config/stop/level0.yml")]: fired });
  const said = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.deepEqual(
    said,
    { pass: true },
    "the stop stands, and the strange rule fires nothing",
  );
});

// A rule naming a check the door holds nowhere says so in the log, so the hand that wrote it reads its own mistake. [[spec/design_output/stop#the-mechanical-checks]]
test("a rule naming a check the door holds nowhere writes one warn line naming the rule and the check", () => {
  const typo = `
- id: the-moon-is-full
  side: continue
  priority: 60
  decides: mechanical
  runs: moon-is-full
  says: The moon is full, so this turn holds.
${RULES}`;
  const it = box({ [at("spec/config/stop/level0.yml")]: typo });
  const said = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.deepEqual(
    said,
    { pass: true },
    "the strange rule fires nothing, and the stop stands",
  );
  const warned = it.said.filter((row) => row[0] === "warn" && row[1] === "stop");
  assert.equal(warned.length, 1, "one warn line a rule");
  assert.match(warned[0][2], /the-moon-is-full/, "the line names the rule");
  assert.match(warned[0][2], /moon-is-full/, "the line names the check");
  assert.deepEqual(
    warned[0][3],
    { rule: "the-moon-is-full", detail: "moon-is-full" },
    "the row carries the rule and the check as fields, so the log verb narrows on them",
  );
});

// The table of checks holds what an unbuilt rule runs, so such a rule stands off the vote and writes no line. [[spec/design_output/stop#the-mechanical-checks]]
test("a rule running never fires nothing and writes no warn line", () => {
  const unbuilt = `
- id: the-unbuilt-rule
  side: continue
  priority: 60
  decides: mechanical
  runs: never
  says: An unbuilt rule holds nothing.
${RULES}`;
  const it = box({ [at("spec/config/stop/level0.yml")]: unbuilt });
  const said = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.deepEqual(
    it.said.filter((row) => row[0] === "warn" && row[1] === "stop"),
    [],
    "never is a check the door holds",
  );
});

test("the queue holds a stop on completion while a free ticket stands", () => {
  const free =
    "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n";
  const it = box({ [at("spec/tickets/a-free.md")]: free });
  const said = onStop(
    { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.match(said.result.block, /The queue holds work for this box/);
});

// The two rules the owner's hold fires, which the fixture above leaves out. [[spec/design_output/stop#the-hold]]
const HOLD_RULES = `
- id: the-owner-holds-this-session
  side: stop
  priority: 85
  decides: mechanical
  runs: owner-holds
  says: The owner holds this session at stop, so this turn ends here.

- id: the-owner-asks-to-finish
  side: stop
  priority: 84
  decides: mechanical
  runs: owner-finishes
  says: The owner holds this session at finish, so this turn ends with the piece in hand.
${RULES}`;

// A box whose owner holds the session, over the two rules that hold fires. [[spec/design_output/stop#the-hold]]
function heldBox(hold) {
  return box({
    [at("spec/config/level0.json")]: JSON.stringify({
      stop: { enabled: true, mostInARow: 3, hold },
      engine: { binding: "queue" },
    }),
    [at("spec/config/stop/level0.yml")]: HOLD_RULES,
  });
}

const ENDS = { last_assistant_message: "The work stands where it is." };

// [[spec/tickets/a-standing-stop-ends-turns]]
test("a hold standing at the stop ends the turn", () => {
  const it = heldBox("stop");
  assert.deepEqual(onStop(ENDS, it.box), { pass: true });
  assert.match(it.said[0][2], /the turn ends/);
});

// [[spec/tickets/a-standing-stop-ends-turns]]
test("a hold the turn's end drops still ends that turn", () => {
  const it = heldBox("stop");
  dropsHold({}, it.box);
  assert.deepEqual(
    onStop(ENDS, it.box),
    { pass: true },
    "the hold stood in this turn, so the turn ends over the standing work",
  );
});

// [[spec/tickets/a-standing-stop-ends-turns]]
test("a hold at finish the turn's end drops still ends that turn", () => {
  const it = heldBox("finish");
  dropsHold({}, it.box);
  assert.deepEqual(onStop(ENDS, it.box), { pass: true });
});

// [[spec/tickets/a-standing-stop-ends-turns]]
test("a prompt opens a turn, so the hold of the turn before ends nothing", () => {
  const it = heldBox("stop");
  dropsHold({}, it.box);
  sawPrompt({}, it.box);
  const said = onStop(ENDS, it.box);
  assert.match(
    said.result.block,
    /names no stop reason/,
    "the next turn holds open on its own reasons",
  );
});

// A turn waiting on the owner's step ends on a reason naming that step. [[spec/tickets/the-stop-reads-the-state]]
const STEP_RULES = `
- id: the-owner-holds-the-step
  side: stop
  priority: 88
  decides: claimed
  waits: owner
  runs: step-waits-on-person
  asks: Does the ticket in hand, or its group, stand at a step a person takes?
  says: The ticket in hand waits on the owner's step, so this turn ends and waits.
`;

const ticketAt = (step, by, more = "") =>
  `---\nkind: [[ticket]]\nstate: open\n${more}steps:\n  - name: design\n    steps:\n      - name: draft\n        by: anyone\n      - name: person-1\n        by: ${by}\nstep: ${step}\n---\n\n# Ask\n\nA thing.\n`;

function stepBox(files) {
  const it = box({ [at("spec/config/stop/level0.yml")]: STEP_RULES, ...files });
  return it.box;
}

const hold = (ticket) =>
  JSON.stringify({
    ticket,
    path: `spec/tickets/${ticket}.md`,
    step: "design/person-1",
    hand: "box b1",
  });

// [[spec/tickets/the-stop-reads-the-state]]
test("a ticket in hand at a person's step stands the owner-step claim", () => {
  const it = stepBox({
    [at(".se/.runtime/hold/b1.json")]: hold("a-ticket"),
    [at("spec/tickets/a-ticket.md")]: ticketAt("design/person-1", "person"),
  });
  const said = TOOLS[STOP_CALL]({ reason: "the-owner-holds-the-step" }, it);
  assert.match(said.result.result, /The claim stands/);
});

// [[spec/tickets/the-stop-reads-the-state]]
test("a ticket in hand at an agent's step refuses the owner-step claim", () => {
  const it = stepBox({
    [at(".se/.runtime/hold/b1.json")]: hold("a-ticket"),
    [at("spec/tickets/a-ticket.md")]: ticketAt("design/draft", "person"),
  });
  const said = TOOLS[STOP_CALL]({ reason: "the-owner-holds-the-step" }, it);
  assert.match(said.result.result, /The claim falls/);
});

// [[spec/tickets/the-stop-reads-the-state]]
test("a ticket in hand whose group stands at a person's step stands the owner-step claim", () => {
  const it = stepBox({
    [at(".se/.runtime/hold/b1.json")]: hold("a-child"),
    [at("spec/tickets/a-child.md")]: ticketAt(
      "design/draft",
      "anyone",
      "group: a-group\n",
    ),
    [at("spec/tickets/a-group.md")]: ticketAt("design/person-1", "person"),
  });
  const said = TOOLS[STOP_CALL]({ reason: "the-owner-holds-the-step" }, it);
  assert.match(said.result.result, /The claim stands/);
});

// A group whose work branch stands is taken, so the queue holds nothing of it for this box. [[spec/tickets/the-stop-reads-the-state]]
test("an urgent group whose work branch stands leaves the queue with no wait", () => {
  const group =
    "---\nkind: [[ticket]]\nstate: open\nurgent: true\nprocess: [[spec/processes/group]]\n---\n\n# Ask\n\nA group.\n";
  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };
  const refs =
    "git for-each-ref --format=%(refname:short) refs/heads/work refs/remotes/origin/work";

  const taken = box({ [at("spec/tickets/a-group.md")]: group });
  taken.box.proc = fakeProc({
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    [refs]: { stdout: "origin/work/a-group\n" },
  });
  assert.deepEqual(onStop(done, taken.box), { pass: true });

  const free = box({ [at("spec/tickets/a-group.md")]: group });
  free.box.proc = fakeProc({
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    [refs]: { stdout: "" },
  });
  assert.match(
    onStop(done, free.box).result.block,
    /The queue holds work for this box/,
  );
});

// [[spec/tickets/the-stop-reads-the-state]]
test("the leaf a pointer names answers who takes it, and a ticket with no leaf answers null", () => {
  assert.equal(leafBy(ticketAt("design/person-1", "person")), "person");
  assert.equal(leafBy(ticketAt("design/draft", "person")), "anyone");
  assert.equal(leafBy("---\nkind: [[ticket]]\n---\n"), null);
});
