// The tooth: the rule files, the vote, the claim and its life, the runaway.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  claimSpec,
  decide,
  detail,
  pool,
  reprompt,
  rulesOf,
  todos,
  toothOf,
} from "../../.claude/skills/level0/lib/stop.js";

const TABLE = [
  { id: "talk", side: "stop", priority: 100, decides: "claimed", asks: "Talk?" },
  {
    id: "carry-on",
    side: "continue",
    priority: 99,
    decides: "claimed",
    says: "Go on.",
  },
  {
    id: "new",
    side: "stop",
    priority: 95,
    decides: "mechanical",
    runs: "session-is-new",
  },
  { id: "blocked", side: "stop", priority: 90, decides: "claimed", asks: "A person?" },
  {
    id: "work",
    side: "continue",
    priority: 80,
    decides: "mechanical",
    runs: "work-waiting",
    says: "Something stands unfinished.",
  },
  { id: "done", side: "stop", priority: 45, decides: "claimed", asks: "Complete?" },
  {
    id: "out",
    side: "continue",
    priority: 0,
    decides: "mechanical",
    runs: "stop-hook-off",
  },
];

function ranOf(fired = []) {
  const known = ["session-is-new", "work-waiting", "stop-hook-off", "never"];
  return (name) => (known.includes(name) ? fired.includes(name) : undefined);
}

function voted(fired, claimed) {
  return decide(TABLE, { claimed, ran: ranOf(fired) });
}

test("a turn nothing fires over ends", () => {
  const said = voted([]);
  assert.equal(said.ends, true);
  assert.equal(said.stop, undefined);
  assert.equal(said.go, undefined);
});

test("work standing holds an unclaimed turn open", () => {
  const said = voted(["work-waiting"]);
  assert.equal(said.ends, false);
  assert.equal(said.go.id, "work");
});

test("the free stop stands over work still standing", () => {
  const said = voted(["work-waiting", "session-is-new"]);
  assert.equal(said.ends, true);
  assert.equal(said.stop.id, "new");
});

test("the owner saying carry on spends the free stop", () => {
  const said = voted(["work-waiting", "session-is-new"], "carry-on");
  assert.equal(said.ends, false);
  assert.equal(said.go.id, "carry-on");
});

test("a finished piece leaves a standing list open", () => {
  const said = voted(["work-waiting"], "done");
  assert.equal(said.ends, false);
  assert.equal(said.stop.id, "done");
});

test("the owner opening a discussion ends the turn over everything", () => {
  const said = voted(["work-waiting"], "talk");
  assert.equal(said.ends, true);
  assert.equal(said.stop.id, "talk");
});

test("the tooth taken out ends the turn, whatever else fires", () => {
  const said = voted(["stop-hook-off", "work-waiting"]);
  assert.equal(said.ends, true);
  assert.equal(said.off, true);
  assert.equal(said.stop.id, "out");
});

test("a runs value the code does not know fires nothing and is named", () => {
  const rules = [
    {
      id: "guess",
      side: "continue",
      priority: 80,
      decides: "mechanical",
      runs: "moon",
    },
  ];
  const said = decide(rules, { ran: ranOf([]) });
  assert.equal(said.ends, true);
  assert.deepEqual(said.unknown, ["moon"]);
});

test("the line names both sides and the count", () => {
  assert.equal(
    detail(voted(["work-waiting", "session-is-new"]), 2),
    "stop=new@95 continue=work@80 inARow=2",
  );
  assert.equal(detail(voted([]), 0), "stop=none@0 continue=none@0 inARow=0");
});

test("the re-prompt says why it carries on, then asks every unclaimed stop", () => {
  const said = reprompt(voted(["work-waiting"]));
  assert.match(said, /^Something stands unfinished\./);
  for (const asked of ["Talk?", "A person?", "Complete?"]) {
    assert.ok(said.includes(`  - ${asked}`), `it asks ${asked}`);
  }
});

test("the re-prompt drops the question the agent already claimed", () => {
  assert.equal(reprompt(voted(["work-waiting"], "done")).includes("Complete?"), false);
});

// [[spec/design_output/stop#the-claim-and-its-life]]
test("a claim lives two tool calls, and a third ends it", () => {
  const it = toothOf();
  it.claims("done", "the branch is pushed");
  it.sawCall("claim_stop");
  assert.equal(it.claim().rule, "done", "its own call spends nothing");
  it.sawCall("Read");
  it.sawCall("Bash");
  assert.equal(it.claim().rule, "done", "two calls stand between");
  it.sawCall("Read");
  assert.equal(it.claim(), null);
});

test("a claim ends at the turn end, and the next turn opens with none", () => {
  const it = toothOf();
  it.claims("talk", "the owner asked a question");
  const said = it.atTurnEnd(voted([], "talk"));
  assert.equal(said.claim.rule, "talk");
  assert.equal(it.claim(), null);
});

test("the free stop fires one time in a session", () => {
  const it = toothOf({ fresh: 10 });
  assert.equal(it.isNew(), true);
  it.atTurnEnd(voted(["session-is-new"]));
  assert.equal(it.isNew(), false, "the hook granted a stop");
});

test("the free stop goes once ten tool calls stand behind the session", () => {
  const it = toothOf({ fresh: 10 });
  for (let i = 0; i < 10; i++) it.sawCall("Read");
  assert.equal(it.isNew(), false);
});

// [[spec/design_output/stop#three-in-a-row]]
test("mostInARow ends a runaway", () => {
  const it = toothOf();
  const carried = [];
  for (let i = 0; i < 4; i++) {
    carried.push(it.atTurnEnd(voted(["work-waiting"]), 3).ends);
  }
  assert.deepEqual(carried, [false, false, false, true]);
  assert.equal(it.inARow(), 0, "the count starts again");
});

test("a prompt from outside the plugin puts the count back", () => {
  const it = toothOf();
  it.atTurnEnd(voted(["work-waiting"]));
  assert.equal(it.inARow(), 1);
  it.sawPrompt(true);
  assert.equal(it.inARow(), 1, "the plugin's own prompt counts");
  it.sawPrompt(false);
  assert.equal(it.inARow(), 0);
});

// [[spec/design_output/stop#where-the-rules-live]]
test("a rule file reads as a list of entries", () => {
  const said = rulesOf(`
- id: the-owner-asks-to-talk
  side: stop
  priority: 100
  decides: claimed
  asks: Does the last thing the owner said open a discussion?
  says: The owner opens a discussion, so this turn ends and waits.

- id: work-still-stands
  side: continue
  priority: 80
  decides: mechanical
  runs: work-waiting
  says: Something on your list stands unfinished, so carry on with it.
`);

  assert.equal(said.broken, 0);
  assert.deepEqual(
    said.rules.map((one) => [one.id, one.side, one.priority, one.decides]),
    [
      ["the-owner-asks-to-talk", "stop", 100, "claimed"],
      ["work-still-stands", "continue", 80, "mechanical"],
    ],
  );
});

test("a second file adds a rule, and the pool holds both", () => {
  const said = pool([
    {
      name: "level0.yml",
      text: "- id: a\n  side: stop\n  priority: 50\n  decides: claimed\n  asks: A?\n",
    },
    {
      name: "level1.yml",
      text: "- id: b\n  side: continue\n  priority: 60\n  decides: mechanical\n  runs: never\n",
    },
  ]);
  assert.deepEqual(said.broken, []);
  assert.deepEqual(
    said.rules.map((one) => one.id),
    ["a", "b"],
  );
});

test("a rule file that will not parse leaves the tooth harmless", () => {
  const said = pool([
    { name: "broken.yml", text: "id: [this is not, a list of entries\nside" },
    {
      name: "level0.yml",
      text: "- id: a\n  side: stop\n  priority: 50\n  decides: claimed\n  asks: A?\n",
    },
  ]);
  assert.deepEqual(said.broken, ["broken.yml"]);
  assert.deepEqual(
    said.rules.map((one) => one.id),
    ["a"],
  );
  assert.equal(decide(said.rules, { ran: ranOf([]) }).ends, true);
});

test("the claim tool offers the rules a claim may name", () => {
  const said = claimSpec(TABLE);
  assert.equal(said.name, "claim_stop");
  assert.deepEqual(said.inputSchema.properties.rule.enum, [
    "talk",
    "carry-on",
    "blocked",
    "done",
  ]);
  assert.deepEqual(said.inputSchema.required, ["rule", "why"]);
});

// [[spec/design_output/stop#what-the-todo-list-says]]
test("a todo short of completed means work stands", () => {
  const it = todos();
  assert.equal(it.standing(), false);
  it.sawCall({
    tool: "TodoWrite",
    todos: [{ status: "completed" }, { status: "pending" }],
  });
  assert.equal(it.standing(), true);
  it.sawCall({
    tool: "TodoWrite",
    todos: [{ status: "completed" }, { status: "completed" }],
  });
  assert.equal(it.standing(), false);
});

test("a task made and never ended stands as work", () => {
  const it = todos();
  it.sawCall({ tool: "TaskCreate", subject: "the tooth" });
  it.sawCall({ tool: "TaskCreate", subject: "the canary" });
  assert.equal(it.standing(), true);
  it.sawCall({ tool: "TaskUpdate", taskId: "1", status: "in_progress" });
  assert.equal(it.standing(), true, "in progress is short of completed");
  it.sawCall({ tool: "TaskUpdate", taskId: "1", status: "completed" });
  it.sawCall({ tool: "TaskUpdate", taskId: "2", status: "deleted" });
  assert.equal(it.standing(), false);
});
