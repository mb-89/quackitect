// The ticket verb, driven through a fake disk. note and update reach the disk
// through arguments, so every case here runs in memory.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { processAt } from "../../src/scripts/process.js";
import {
  fromHold,
  HOLDS,
  NOTE,
  NOTES,
  routedTicket,
  ticket,
  updated,
} from "../../src/scripts/ticket.js";
import { carryQuack, teachRules } from "./quack-doors.js";
import { semicolonVale } from "./semicolon-vale.js";
import { at, heard, ROOT, treeWithProcesses } from "./ticket-doors.js";

// The pull writes a hold into the folder, one file a hand. [[spec/design_output/pull#the-hand-and-the-hold]]
const HOLD = `${HOLDS}/box-1.json`;

test("ticket note writes a private ticket off the note process, and says so", () => {
  const said = treeWithProcesses();
  const ran = heard(() =>
    ticket(ROOT, ["note", "slow-lint", "The", "lint", "drags."], said.it),
  );

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(text, /^kind: \[\[ticket\]\]$/m);
  assert.match(text, /^state: open$/m);
  assert.match(text, /^step: decide$/m);
  assert.match(text, /^process: \[\[spec\/processes\/note\]\]$/m);
  assert.match(text, /^process_hash: [0-9a-f]{16}$/m);
  assert.match(text, /The lint drags\./);
  assert.match(ran.said, /waits for a retro to decide it/);
});

// A line a standing note already carries belongs there, so the verb names that note before it writes a twin. [[spec/tickets/the-verbs-need-no-wrapper]]
test("ticket note names a standing note whose words match the line, before it writes", () => {
  const said = treeWithProcesses({
    [at("spec/tickets/lint-drags.md")]:
      "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nThe lint drags past a minute.\n\n# Discussion\n",
    [at("spec/tickets/lint-closed.md")]:
      "---\nkind: [[ticket]]\nstate: done\n---\n\n# Ask\n\nThe lint drags past a minute.\n\n# Discussion\n",
  });
  const ran = heard(() =>
    ticket(
      ROOT,
      ["note", "slow-lint", "The lint drags past a minute on each run."],
      said.it,
    ),
  );

  assert.equal(ran.code, 0);
  assert.match(ran.said, /spec\/tickets\/lint-drags\.md/, "it names the open note");
  assert.doesNotMatch(ran.said, /lint-closed/, "and no closed one");
  assert.ok(
    ran.said.indexOf("lint-drags") < ran.said.indexOf("slow-lint.md stands"),
    "before it writes",
  );
  assert.equal(
    said.disk.exists(at(`${NOTES}/slow-lint.md`)),
    true,
    "and the note lands",
  );
});

// A note asking for a discussion waits for a person, so the pull hands it to no agent at a desk. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
test("ticket note --talk marks the decide step a person's, and the line loses the flag", () => {
  const said = treeWithProcesses();
  const ran = heard(() =>
    ticket(ROOT, ["note", "slow-lint", "--talk", "The", "lint", "drags."], said.it),
  );

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(text, /^ {4}by: person$/m);
  assert.match(text, /The lint drags\.$/m);
  assert.doesNotMatch(text, /--talk/);
  assert.match(ran.said, /waits for a person to decide it/);
});

test("ticket note writes a note row, so the answer door reads it off the log", () => {
  const rows = [];
  const said = treeWithProcesses();
  said.it.log = {
    say: (level, kind, line, more) => {
      rows.push({ level, kind, line, more });
      return Promise.resolve();
    },
  };
  ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it);
  assert.deepEqual(rows, [
    {
      level: "info",
      kind: NOTE,
      line: "The lint drags.",
      more: { text: "The lint drags.", ticket: "slow-lint" },
    },
  ]);
});

// The row holds one sentence under `said`, and the details read `text`. [[spec/design_output/log#what-a-box-writes]]
test("a note past the row's width carries its whole line under text", () => {
  const rows = [];
  const said = treeWithProcesses();
  said.it.log = {
    say: (_level, _kind, line, more) => {
      rows.push({ line, more });
      return Promise.resolve();
    },
  };
  const long = `The lint drags, ${"and it drags on ".repeat(8)}so the row clips it.`;
  ticket(ROOT, ["note", "slow-lint", long], said.it);

  assert.ok(long.length > 80, "the line runs past the width a row holds");
  assert.equal(rows[0].more.text, long, "text carries the line whole");
  assert.equal(
    rows[0].line,
    long,
    "the door reads the whole line, and clips its own row",
  );
});

test("ticket note writes from off the hold, as the ticket and the step in hand", () => {
  const said = treeWithProcesses({
    [at(HOLD)]: JSON.stringify({
      ticket: "a-route-is-a-graph",
      step: "implement/change",
    }),
  });
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  assert.match(
    said.disk.read(at(`${NOTES}/slow-lint.md`)),
    /^ {4}from: a-route-is-a-graph\/implement\/change$/m,
  );
});

test("ticket note takes a name and a line, and refuses a note standing already", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => ticket(ROOT, ["note", "slow-lint"], said.it)).code, 2);
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  const twice = heard(() => ticket(ROOT, ["note", "slow-lint", "Again."], said.it));
  assert.equal(twice.code, 2);
  assert.match(twice.said, /stands already/);
});

// A note lands on its first call, so a name past the cap cuts to its first words. [[spec/tickets/prose-verbs-land-first-try]]
test("ticket note cuts a name past the cap, writes under the cut name and says so", () => {
  const said = treeWithProcesses();
  const long = "one-two-three-four-five-six";
  const cut = heard(() => ticket(ROOT, ["note", long, "A line."], said.it));
  assert.equal(cut.code, 0, cut.said);
  assert.match(
    cut.said,
    /one-two-three-four-five-six holds more than 5 words, so the note stands as one-two-three-four-five/,
  );
  assert.equal(
    said.disk.exists(at(`${NOTES}/one-two-three-four-five.md`)),
    true,
    "the cut name lands",
  );
  assert.equal(
    said.disk.exists(at(`${NOTES}/${long}.md`)),
    false,
    "the long name lands nowhere",
  );
});

// The note reads its minted text through the lint's road, and a break of form warns while the note lands. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("ticket note writes a line the lint warns on, and names Characters at its line", () => {
  const ran = [];
  const said = treeWithProcesses();
  const it = teachRules(carryQuack({ ...said.it, proc: fakeProc(), root: ROOT }), semicolonVale(ran));

  const warned = heard(() => ticket(ROOT, ["note", "a-name", "one; two"], it));

  assert.equal(warned.code, 0, warned.said);
  assert.match(warned.said, /breaks a rule of form, and it lands/);
  const line =
    String(ran[0]?.stdin ?? "")
      .split("\n")
      .indexOf("one; two") + 1;
  assert.ok(line > 0, "the rules read the minted ticket whole");
  assert.match(warned.said, new RegExp(`line ${line} breaks Characters`));
  assert.equal(said.disk.exists(at(`${NOTES}/a-name.md`)), true, "the note stands");
});

const SECRET = "SECRET";

// Rules that behave over stdin: they name each line holding the marker as a private name, at error. [[spec/design_output/doors#a-fake-behaves]]
function privateRules(argv, init = {}) {
  const named = argv.find((one) => one.startsWith("--path="));
  const file = named ? named.slice("--path=".length) : "stdin.md";
  const rows = String(init.stdin ?? "")
    .split("\n")
    .flatMap((line, i) =>
      line.includes(SECRET)
        ? [
            {
              Check: "VoiceVale.Private",
              Line: i + 1,
              Span: [1, 1],
              Match: SECRET,
              Message: "A private name leaves the box.",
              Severity: "error",
            },
          ]
        : [],
    );
  return { exitCode: 0, stdout: JSON.stringify(rows.length ? { [file]: rows } : {}) };
}

// A finding's child and a note mint through one function, which reads the Ask before it writes. [[spec/design_output/pull#a-finding-rides-out]]
test("routedTicket mints a draft off the route, and a line carrying a private name mints nothing", () => {
  const said = treeWithProcesses();
  const it = teachRules(carryQuack({ ...said.it, proc: fakeProc(), root: ROOT }), privateRules);
  const held = processAt(said.disk, ROOT, join, "trivial");
  const mint = (line) =>
    routedTicket(it, "spec/tickets/a-child.md", held, {
      steps: fromHold(held.route, { ticket: "a-parent", step: "design/review" }),
      line,
      fields: { state: "draft" },
    });

  const made = mint("the note names no link");
  assert.equal(made.why, undefined, made.why);
  assert.match(made.text, /^state: draft$/m, "the child stands at draft");
  assert.match(made.text, /^step: do$/m, "the child stands at the route's first leaf");
  assert.match(made.text, /the note names no link/, "the line lands as the Ask");
  const refused = mint(`the note names ${SECRET}`);
  assert.match(
    String(refused.why),
    /so the verb writes nothing/,
    "the Ask read refuses",
  );
  assert.match(String(refused.why), /breaks Private/, "the refusal names the rule");
  assert.equal(refused.text, undefined, "a refused line mints nothing");
});

test("ticket update refuses where step names a leaf the new route lacks", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: decide\nsteps:\n  - name: decide\n    does: says what the note becomes\n    to: retro\nprocess: [[spec/processes/note]]\nprocess_hash: old\n---\n\n# Ask\n\nA thing.\n\n# decide\n\n<!-- says what the note becomes -->\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at(`${NOTES}/slow-lint.md`)]: front });
  const ran = heard(() =>
    ticket(ROOT, ["update", "slow-lint", "--process=trivial", "--over"], said.it),
  );
  assert.equal(ran.code, 1);
  assert.match(ran.said, /holds no such leaf/);
});

test("ticket update copies the current route, and keeps the leaves already reached", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: do\nsteps:\n  - name: do\n    does: makes the change, the old way\n    to: retro\n    evidence:\n      - name: says\n        form: text\n        says: what changes and why\nprocess: [[spec/processes/trivial]]\nprocess_hash: old\n---\n\n# Ask\n\nA thing.\n\n# do\n\n<!-- makes the change, the old way -->\n\n## says\n\nIt changes the lint.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at(`${NOTES}/slow-lint.md`)]: front });
  const ran = heard(() => ticket(ROOT, ["update", "slow-lint", "--over"], said.it));

  assert.equal(ran.code, 0);
  const now = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(
    now,
    /makes the change, the old way/,
    "the leaf in hand keeps what it holds",
  );
  assert.match(now, /It changes the lint\./, "the chapter keeps what the hand wrote");
  assert.match(now, /^process_hash: [0-9a-f]{16}$/m);
});

test("ticket update leaves a ticket whose hash already matches its process", () => {
  const said = treeWithProcesses();
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  const was = said.disk.read(at(`${NOTES}/slow-lint.md`));
  const ran = heard(() => ticket(ROOT, ["update", "slow-lint"], said.it));

  assert.equal(ran.code, 0);
  assert.match(ran.said, /already carries note as it stands/);
  assert.equal(said.disk.read(at(`${NOTES}/slow-lint.md`)), was);
});

test("ticket update names no ticket, and a ticket standing nowhere, and refuses", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => ticket(ROOT, ["update"], said.it)).code, 2);
  assert.equal(heard(() => ticket(ROOT, ["update", "nowhere"], said.it)).code, 2);
});

test("updated takes the new leaf where the ticket has yet to reach it", () => {
  const front = {
    step: "one",
    steps: [
      { name: "one", does: "the old first" },
      { name: "two", does: "the old second" },
    ],
  };
  const route = [
    { name: "one", does: "the new first" },
    { name: "two", does: "the new second" },
  ];
  const said = updated(front, route);
  assert.equal(said.kept, 1);
  assert.equal(said.steps[0].does, "the old first");
  assert.equal(said.steps[1].does, "the new second");
});

test("a leaf the record holds keeps what it holds, wherever the pointer stands", () => {
  const front = {
    step: "two",
    record: [{ step: "one" }],
    steps: [
      { name: "one", does: "the old first" },
      { name: "two", does: "the old second" },
      { name: "three", does: "the old third" },
    ],
  };
  const said = updated(front, [
    { name: "one", does: "the new first" },
    { name: "two", does: "the new second" },
    { name: "three", does: "the new third" },
  ]);
  assert.equal(said.steps[0].does, "the old first");
  assert.equal(said.steps[1].does, "the old second");
  assert.equal(said.steps[2].does, "the new third");
});

test("a hold names the from of every leaf, and a phase keeps its own", () => {
  const route = [{ name: "one" }, { name: "up", steps: [{ name: "deep" }] }];
  const said = fromHold(route, { ticket: "a-ticket", step: "one" });
  assert.equal(said[0].from, "a-ticket/one");
  assert.equal(said[1].from, undefined);
  assert.deepEqual(fromHold(route, null), route);
});
