// The tooth: the rule files, the vote, the claim and its life, the runaway.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  askForStop,
  decide,
  detail,
  namesNext,
  pool,
  reprompt,
  rulesOf,
  stopAnswer,
  stopReasons,
  stopSpec,
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
    runs: "chat-is-new",
  },
  {
    id: "opening",
    side: "stop",
    priority: 96,
    decides: "claimed",
    runs: "opening-check",
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
  const known = [
    "chat-is-new",
    "opening-check",
    "work-waiting",
    "stop-hook-off",
    "never",
  ];
  return (name) => (known.includes(name) ? fired.includes(name) : undefined);
}

function voted(fired, claimed) {
  return decide(TABLE, { claimed, ran: ranOf(fired) });
}

// [[spec/design_output/stop#a-claim-a-check-holds]]
test("a claimed rule naming a check waits for both", () => {
  assert.equal(
    voted(["opening-check"], "opening").stop.id,
    "opening",
    "the claim and the check stand",
  );
  assert.equal(voted([], "opening").stop, undefined, "the claim alone fires nothing");
  assert.equal(
    voted(["opening-check"]).stop,
    undefined,
    "the check alone fires nothing",
  );
});

test("a claim the check refuses leaves the turn open", () => {
  const said = voted(["work-waiting"], "opening");
  assert.equal(said.ends, false);
  assert.equal(said.go.id, "work");
});

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
  const said = voted(["work-waiting", "chat-is-new"]);
  assert.equal(said.ends, true);
  assert.equal(said.stop.id, "new");
});

test("the owner saying carry on spends the free stop", () => {
  const said = voted(["work-waiting", "chat-is-new"], "carry-on");
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
    detail(voted(["work-waiting", "chat-is-new"]), 2),
    "stop=new@95 continue=work@80 inARow=2",
  );
  assert.equal(detail(voted([]), 0), "stop=none@0 continue=none@0 inARow=0");
});

test("the re-prompt says why it carries on, then asks every unclaimed stop, in five lines", () => {
  const said = reprompt(voted(["work-waiting"]));
  assert.match(
    said,
    /^Something stands unfinished\. To stop, call mcp__level0__stop last/,
  );
  for (const asked of ["Talk?", "A person?", "Complete?"]) {
    assert.ok(said.includes(`: ${asked}`), `it asks ${asked}`);
  }
  assert.ok(said.split("\n").length <= 5, "five lines at most");
});

// [[spec/design_output/stop#the-stop-is-one-line]]
test("the tool takes one reason out of the rules, and names each one", () => {
  const spec = stopSpec(TABLE);
  assert.equal(spec.name, "stop");
  assert.deepEqual(spec.inputSchema.required, ["reason", "next"]);
  assert.deepEqual(spec.inputSchema.properties.reason.enum, [
    "talk",
    "blocked",
    "done",
  ]);
  assert.ok(spec.description.includes("done: Complete?"), "it names the question");
  assert.equal(stopSpec([]).inputSchema.properties.reason.enum, undefined);
});

// [[spec/design_output/stop#the-claim-rides-the-call]]
test("a sound reason stands, a fact over it falls, and an unknown id says so", () => {
  const stands = stopAnswer(TABLE, "talk", voted([], "talk"));
  assert.equal(stands.ends, true);
  assert.match(
    stands.result,
    /^The stop stands\. .*Write the words Ending my turn, and nothing more\.$/,
  );

  const falls = stopAnswer(TABLE, "done", voted(["work-waiting"], "done"));
  assert.deepEqual([falls.known, falls.ends], [true, false]);
  assert.equal(falls.result, "The stop falls. Something stands unfinished.");

  const wrong = stopAnswer(TABLE, "tired", voted([], "tired"));
  assert.equal(wrong.known, false);
  assert.equal(
    wrong.result,
    "tired names no reason this tree holds. The ids: talk, blocked, done.",
  );
});

// [[spec/design_output/stop#a-turn-with-no-line]]
test("the ask for a stop names the call and every id, in five lines", () => {
  const said = askForStop(TABLE);
  assert.match(said, /^This turn ends with no stop, so it holds open\./);
  assert.ok(said.includes("mcp__level0__stop"), "it names the call");
  assert.ok(said.includes("  done: Complete?"), "it lists the ids");
  assert.ok(said.split("\n").length <= 5, "five lines at most");
});

test("the reasons are the stop side claimed rules, and no other", () => {
  assert.deepEqual(
    stopReasons(TABLE).map((one) => one.id),
    ["talk", "blocked", "done"],
  );
});

test("the re-prompt drops the question the agent already claimed", () => {
  assert.equal(reprompt(voted(["work-waiting"], "done")).includes("Complete?"), false);
});

// [[spec/design_output/stop#the-claim-rides-the-call]]
test("the claim lives as long as the call naming it, and no longer", () => {
  const it = toothOf();
  const said = it.atTurnEnd(voted([], "talk"));
  assert.equal(said.stop.id, "talk", "the call's reason reaches the vote");
  assert.equal(
    it.atTurnEnd(voted([])).stop,
    undefined,
    "the next turn opens with none",
  );
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

// A claim reads the agent, and a check reads the tree, so the check wins. [[spec/design_output/stop#a-check-beats-a-claim]]
const YIELDING = [
  {
    id: "own-judgment",
    side: "stop",
    priority: 90,
    decides: "claimed",
    yields: true,
    asks: "Would a wrong answer here reach past this branch?",
    says: "a wrong answer outlives this branch",
  },
  {
    id: "owner-spoke",
    side: "stop",
    priority: 100,
    decides: "claimed",
    asks: "Does the owner open a discussion?",
    says: "the owner opens a discussion",
  },
  {
    id: "work-stands",
    side: "continue",
    priority: 10,
    decides: "mechanical",
    runs: "work-waiting",
    says: "work stands",
  },
  {
    id: "owner-carries-on",
    side: "continue",
    priority: 99,
    decides: "claimed",
    says: "the owner says carry on",
  },
];

function yielded(fired, claimed) {
  return decide(YIELDING, { claimed, ran: ranOf(fired) });
}

test("a yielding stop loses to a check, whatever the priorities say", () => {
  const said = yielded(["work-waiting"], "own-judgment");
  assert.equal(said.ends, false, "the turn holds open");
  assert.equal(said.yields, true, "the vote says the claim yielded");
  assert.equal(said.go.id, "work-stands", "the re-prompt names the check");
});

test("a yielding stop stands where no check fires", () => {
  const said = yielded([], "own-judgment");
  assert.equal(said.ends, true, "nothing reads the tree, so the claim holds");
  assert.equal(said.yields, false);
});

test("a yielding stop stands over a continue the agent also claims", () => {
  const said = yielded([], "own-judgment");
  assert.equal(said.ends, true, "one claim beats another on priority alone");
});

test("a stop outside the agent's own work beats a check", () => {
  const said = yielded(["work-waiting"], "owner-spoke");
  assert.equal(said.ends, true, "the owner speaking ends the turn");
  assert.equal(said.yields, false);
});

// [[spec/design_output/stop#the-chat-is-new]]
test("an answer names a next step where a sentence opens on the agent's own next act, and a table or the canary names none", () => {
  const canary = "level0 holds this session: 51 rules, 4 notes, the stop hook on.";
  assert.equal(namesNext(`Understood. I read the branches first.\n\n${canary}`), true);
  assert.equal(
    namesNext("Fifteen branches stand on origin. Next I run the reviewer."),
    true,
  );
  assert.equal(
    namesNext("- The merge stands complete.\n- Then I pull the next ticket."),
    true,
  );
  assert.equal(
    namesNext(`| Question | Answer |\n|---|---|\n| Next? | I read them |\n\n${canary}`),
    false,
    "a table names no step",
  );
  assert.equal(
    namesNext("The work stands complete.\n\nstop: the-work-stands-complete"),
    false,
  );
  assert.equal(namesNext(""), false);
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
