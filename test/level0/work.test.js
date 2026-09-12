// Work branches, driven through fake doors. The verbs reach git and the disk
// through arguments, so every case here runs in memory and the branch it moves
// stands in a map.
// [[spec/design_output/work#the-round-trip]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import {
  BRIEF,
  CONTRACT_HEADING,
  DONE,
  dependsOn,
  freeNow,
  fromHold,
  HELD,
  HOLD,
  MERGED,
  MINE,
  NOTE,
  rerouted,
  standingOf,
  setStatus,
  statusOf,
  TICKETS,
  TODO,
  URGENCY,
  urgencyOf,
  waitingOn,
  withContract,
  work,
} from "../../src/scripts/work.js";

const ROOT = "/tree";
const HERE = join(ROOT, BRIEF);

function doorsSaying(answers, files = {}) {
  const said = fakeGit(answers, ROOT);
  const disk = fakeDisk(files);
  return { it: { proc: said.proc, disk, git: said, join }, outside: said, disk };
}

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

const ranGit = (said) => said.ran.map((one) => one.argv.join(" "));

const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";

const onBranch = (name) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${name}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
});

const green = {
  [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: true, clean: true, at: "now" }),
};

test("every brief carries the contract, and adding it twice changes nothing", () => {
  const once = withContract("# A brief\n\nDo the thing.\n");
  assert.ok(once.includes(CONTRACT_HEADING), "the contract lands");
  assert.ok(once.includes("./RUNME.sh work done"), "it names how to finish");
  assert.ok(once.includes("./RUNME.sh work release"), "it names how to stop early");
  assert.equal(withContract(once), once, "a second pass changes nothing");
});

test("the status moves through todo, held and done", () => {
  const brief = setStatus("# A brief\n", TODO);
  assert.equal(statusOf(brief), TODO);
  assert.equal(statusOf(setStatus(brief, HELD)), HELD);
  assert.equal(statusOf(setStatus(setStatus(brief, HELD), DONE)), DONE);
  assert.equal(statusOf("# No frontmatter\n"), "");
});

test("urgency reads from the frontmatter, and soon is the default", () => {
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: now\n---\n"), "now");
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: whenever\n---\n"), "whenever");
  assert.equal(urgencyOf("---\nstatus: todo\n---\n"), "soon");
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: yesterday\n---\n"), "soon");
});

test("a dependency reads as a list or on one line, with the prefix dropped", () => {
  const block = "---\ndepends_on:\n  - one\n  - work/two\n---\n";
  assert.deepEqual(dependsOn(block), ["one", "two"]);
  assert.deepEqual(dependsOn("---\ndepends_on: a, work/b\n---\n"), ["a", "b"]);
  assert.deepEqual(dependsOn("---\nstatus: todo\n---\n"), []);
});

// [[spec/design_output/work#urgency-and-what-waits]]
test("a dependency in a flow list reads without its brackets or its quotes", () => {
  assert.deepEqual(dependsOn("---\ndepends_on: [one, work/two]\n---\n"), ["one", "two"]);
  assert.deepEqual(dependsOn('---\ndepends_on: ["one", \'two\']\n---\n'), ["one", "two"]);
  assert.deepEqual(dependsOn("---\ndepends_on: []\n---\n"), []);
  assert.deepEqual(dependsOn('---\ndepends_on:\n  - "one"\n---\n'), ["one"]);
});

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
test("a branch waits for a dependency until trunk holds it", () => {
  const brief = "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - merged\n  - gone\n---\n";
  const standing = new Map([
    ["work/open", TODO],
    ["work/busy", HELD],
    ["work/ready", DONE],
    ["work/merged", MERGED],
  ]);
  assert.deepEqual(waitingOn(brief, standing), ["open", "busy", "ready"]);
});

test("a dependency done and unmerged holds its dependent, and merged frees it", () => {
  const said = (status, waits) =>
    `---\nstatus: ${status}\n${waits ? `depends_on: ${waits}\n` : ""}---\n\n# A brief\n`;
  const briefs = new Map([
    ["work/the-schema-reads", said(DONE)],
    ["work/the-schema-refuses", said(TODO, "the-schema-reads")],
  ]);
  assert.deepEqual(freeNow(briefs), [], "done waits on a merge");
  assert.deepEqual(freeNow(briefs, new Set(["work/the-schema-reads"])), [
    "work/the-schema-refuses",
  ]);
  assert.equal(standingOf(briefs, new Set(["work/the-schema-reads"])).get("work/the-schema-reads"), MERGED);
});

test("urgency orders now before soon before whenever", () => {
  const order = ["whenever", "now", "soon"].sort(
    (a, b) => URGENCY.indexOf(a) - URGENCY.indexOf(b),
  );
  assert.deepEqual(order, ["now", "soon", "whenever"]);
});

test("close reaches a work branch and a branch the platform cut", () => {
  assert.ok(MINE.test("work/fix-lsp"));
  assert.ok(MINE.test("claude/gracious-hawking-zepc6h"));
  assert.ok(!MINE.test("main"));
  assert.ok(!MINE.test("v4"));
  assert.ok(!MINE.test("se/claims"));
});

// [[spec/design_output/config#a-caller-hands-it-in]]
test("new refuses a name past the words the caller hands in", () => {
  const { it } = doorsSaying(onBranch("main"), { [HERE]: "# A brief\n" });
  const name = "one-two-three-four-five-six";

  const { code, said } = heard(() => work(ROOT, ["new", name], { ...it, words: 5 }));

  assert.equal(code, 2);
  assert.equal(said, `A branch name holds 5 words, and ${name} holds more.`);
  assert.equal(heard(() => work(ROOT, ["new", name], { ...it, words: 6 })).code, 0);
});

test("done stamps the brief and pushes the branch it stands on", () => {
  const { it, outside, disk } = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: "---\nstatus: held\n---\n\n# The result\n",
    ...green,
  });

  const { code } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), DONE);
  assert.ok(ranGit(outside).includes("git push origin work/fix-lsp"));
});

test("done says one line to the log, naming the branch and the code", async () => {
  const { it, disk } = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: "---\nstatus: held\n---\n\n# The result\n",
    ...green,
  });
  it.log = fakeLog(fakeClock(), { folder: "/log", id: "a6f8c43b" });

  const code = await heard(() => work(ROOT, ["done"], it)).code;

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), DONE);
  assert.deepEqual(it.log.lines(), [
    {
      at: "2026-01-01T00:00:00.000Z",
      level: "info",
      kind: "work",
      said: "done answered 0",
      branch: "work/fix-lsp",
    },
  ]);
});

test("done off a work branch refuses, and reaches git no further", () => {
  const { it, outside } = doorsSaying(onBranch("main"), { [HERE]: "---\n---\n" });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /work done runs on a work branch/);
  assert.deepEqual(ranGit(outside), ["git rev-parse --abbrev-ref HEAD"]);
});

test("done with no brief on the tree refuses, because the brief is what comes back", () => {
  const { it } = doorsSaying(onBranch("work/fix-lsp"));

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /Write your result to HANDOVER\.md first/);
});

test("list names every branch, its status and what it waits for", () => {
  const { it } = doorsSaying({
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/one\nbbb\trefs/heads/work/two\n",
    },
    "git show origin/work/one:HANDOVER.md": {
      stdout: "---\nstatus: held\nurgency: now\n---\n",
    },
    "git show origin/work/two:HANDOVER.md": {
      stdout: "---\nstatus: todo\ndepends_on:\n  - one\n---\n",
    },
  });

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one\s+held\s+now/);
  assert.match(said, /work\/two\s+todo\s+waits for one/);
});

test("collect names the branch standing at done, and no other", () => {
  const { it } = doorsSaying({
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/one\nbbb\trefs/heads/work/two\n",
    },
    "git show origin/work/one:HANDOVER.md": { stdout: "---\nstatus: done\n---\n" },
    "git show origin/work/two:HANDOVER.md": { stdout: "---\nstatus: todo\n---\n" },
  });

  const { said } = heard(() => work(ROOT, ["collect"], it));

  assert.match(said, /work\/one/);
  assert.doesNotMatch(said, /work\/two/);
});

test("take claims the urgent branch, holds it, and prints the brief", () => {
  const brief = "---\nstatus: todo\nurgency: now\n---\n\n# Do the thing\n";
  const { it, outside, disk } = doorsSaying(
    {
      "git ls-remote --heads origin work/*": {
        stdout: "aaa\trefs/heads/work/calm\nbbb\trefs/heads/work/urgent\n",
      },
      "git show origin/work/calm:HANDOVER.md": {
        stdout: "---\nstatus: todo\nurgency: whenever\n---\n",
      },
      "git show origin/work/urgent:HANDOVER.md": { stdout: brief },
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/urgent\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { [HERE]: brief },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.ok(ranGit(outside).includes("git switch work/urgent"));
  assert.ok(ranGit(outside).includes("git push origin work/urgent"));
  assert.equal(statusOf(disk.read(HERE)), HELD);
  assert.match(said, /# Do the thing/);
});

test("take leaves a branch waiting on another one alone", () => {
  const { it, outside } = doorsSaying({
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/first\nbbb\trefs/heads/work/second\n",
    },
    "git show origin/work/first:HANDOVER.md": { stdout: "---\nstatus: held\n---\n" },
    "git show origin/work/second:HANDOVER.md": {
      stdout: "---\nstatus: todo\ndepends_on:\n  - first\n---\n",
    },
  });

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.match(said, /waits for first/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git switch")));
});

test("take stops on a tree carrying uncommitted work", () => {
  const { it, outside } = doorsSaying({
    "git status --porcelain": { stdout: " M a.md" },
  });

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 2);
  assert.match(said, /uncommitted changes/);
  assert.deepEqual(ranGit(outside), ["git status --porcelain"]);
});

test("release puts a branch back to todo for somebody else", () => {
  const { it, outside, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git show origin/work/fix-lsp:HANDOVER.md": { stdout: "---\nstatus: held\n---\n" },
  });

  const { code } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), TODO);
  assert.ok(ranGit(outside).includes("git push origin work/fix-lsp"));
});

test("release refuses a branch already standing at done", () => {
  const { it, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git show origin/work/fix-lsp:HANDOVER.md": { stdout: "---\nstatus: done\n---\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 1);
  assert.match(said, /Read it before you reopen it/);
  assert.equal(disk.exists(HERE), false, "the brief on the tree stays untouched");
});

test("close refuses a branch outside trunk, and deletes one inside it", () => {
  const inside = {
    "git rev-list --count origin/main..main": { stdout: "0\n" },
    "git branch -r --merged origin/main": {
      stdout: "  origin/main\n  origin/work/landed\n",
    },
  };

  const shut = doorsSaying(inside);
  const { code } = heard(() => work(ROOT, ["close", "landed"], shut.it));
  assert.equal(code, 0);
  assert.ok(ranGit(shut.outside).includes("git push origin --delete work/landed"));

  const open = doorsSaying(inside);
  const said = heard(() => work(ROOT, ["close", "elsewhere"], open.it)).said;
  assert.match(said, /outside main/);
  assert.ok(!ranGit(open.outside).some((one) => one.includes("--delete")));
});

// [[spec/design_output/work#a-merged-branch-closes]]
test("close takes a name carrying its own prefix", () => {
  const inside = {
    "git rev-list --count origin/main..main": { stdout: "0\n" },
    "git branch -r --merged origin/main": {
      stdout: "  origin/main\n  origin/claude/roaming-hopper-ab12cd\n",
    },
  };

  const shut = doorsSaying(inside);
  const { code } = heard(() =>
    work(ROOT, ["close", "claude/roaming-hopper-ab12cd"], shut.it),
  );
  assert.equal(code, 0);
  assert.ok(
    ranGit(shut.outside).includes("git push origin --delete claude/roaming-hopper-ab12cd"),
    "it reaches the branch the platform cut",
  );
});

test("close holds a trunk carrying commits origin has never seen", () => {
  const { it, outside } = doorsSaying({
    "git rev-list --count origin/main..main": { stdout: "2\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["close"], it));

  assert.equal(code, 1);
  assert.match(said, /Push main first/);
  assert.ok(!ranGit(outside).some((one) => one.includes("--delete")));
});

// [[spec/design_output/work#trunk-comes-in-last-too]]
test("done refuses a branch trunk stands ahead of, and names the sync", () => {
  const held = "---\nstatus: held\n---\n\n# The result\n";
  const behind = doorsSaying(
    {
      ...onBranch("work/fix-lsp"),
      "git rev-list --count HEAD..origin/main": { stdout: "3\n" },
    },
    { [HERE]: held, ...green },
  );

  const { code, said } = heard(() => work(ROOT, ["done"], behind.it));
  assert.equal(code, 1);
  assert.match(said, /main holds 3 commit\(s\) work\/fix-lsp lacks/);
  assert.match(said, /work sync/);
  assert.equal(statusOf(behind.disk.read(HERE)), "held", "the status stands");
});

// [[spec/design_output/work#the-battery-answers-first]]
test("done refuses where the battery answers nothing green", () => {
  const held = "---\nstatus: held\n---\n\n# The result\n";

  const none = doorsSaying(onBranch("work/fix-lsp"), { [HERE]: held });
  const first = heard(() => work(ROOT, ["done"], none.it));
  assert.equal(first.code, 1);
  assert.match(first.said, /no check has run here/);
  assert.equal(statusOf(none.disk.read(HERE)), "held");

  const stale = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({ sha: "0000", ok: true, clean: true, at: "now" }),
  });
  assert.match(heard(() => work(ROOT, ["done"], stale.it)).said, /ran against 0000/);

  const red = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: false, clean: true, at: "now" }),
  });
  assert.match(heard(() => work(ROOT, ["done"], red.it)).said, /answered red/);

  const dirty = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: true, clean: false, at: "now" }),
  });
  assert.match(heard(() => work(ROOT, ["done"], dirty.it)).said, /unclean tree/);
});

test("freeNow names a branch at todo waiting on nobody, and no other", () => {
  const said = (status, waits) =>
    `---\nstatus: ${status}\n${waits ? `depends_on: ${waits}\n` : ""}---\n\n# A brief\n`;

  const free = freeNow(
    new Map([
      ["work/open", said(TODO)],
      ["work/waiting", said(TODO, "open")],
      ["work/holding", said(HELD)],
      ["work/finished", said(DONE)],
    ]),
  );

  assert.deepEqual(free, ["work/open"]);
});

test("freeNow frees a branch whose dependency left the queue", () => {
  const waits = `---\nstatus: ${TODO}\ndepends_on: merged-already\n---\n\n# A brief\n`;

  assert.deepEqual(freeNow(new Map([["work/late", waits]])), ["work/late"]);
});

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const at =(path) => join(ROOT, ...path.split("/"));

const NOTE_PROCESS = `for: a thing to look at later
ask:
  - name: line
    form: text
    says: the smallest case that shows it
steps:
  - name: decide
    does: says what the note becomes
    from: anyone
    by: retro
    to: retro
    input: ask
    evidence:
      - name: outcome
        form: text
        says: what the note becomes
`;

const TRIVIAL_PROCESS = `for: a fix small enough that the ask is the design
steps:
  - name: do
    does: makes the change
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes and why
`;

// [[spec/design_output/doors#a-fake-behaves]]
const TICKET_SCHEMA = `kind: ticket

governs:
  - .se/tickets/**

frontmatter:
  type: object
  additionalProperties: false
  required: [kind, state, urgency, steps]
  properties:
    kind:
      const: ticket
      x-link: true
      description: the schema this note is minted from
    state:
      enum: [draft, open, closed]
      description: whether anybody pulls it
    urgency:
      enum: [now, soon, whenever]
      description: which ticket the pull hands out first
    step:
      type: string
      x-names: steps
      x-leaf: true
      description: the leaf of the route this ticket stands on
    steps:
      type: array
      description: the route, as a tree of steps
      items:
        type: object
        additionalProperties: false
        required: [name]
        properties:
          name:
            type: string
            description: one word, unique among its siblings
          steps:
            $ref: "#/frontmatter/properties/steps"
            description: the steps under this phase
          does:
            type: string
            description: what the hand does at this leaf
          by:
            type: string
            description: the hand this step admits
          from:
            type: string
            description: who hands this step its input
          to:
            type: string
            description: who takes the output
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
            description: what this step reads
          evidence:
            type: array
            description: the fields this leaf's hand fills
            items:
              type: object
              additionalProperties: false
              required: [name, form, says]
              properties:
                name:
                  type: string
                  description: one word
                form:
                  enum: [text, command]
                  description: what the hand writes
                says:
                  type: string
                  description: one line on what goes here
    process:
      x-link: true
      description: the route the mint copies from
    process_hash:
      type: string
      description: the hash of the process file the route is copied from

body:
  headingLevel: 1
  order: strict
  extraSections: false

  sections:
    - header: Ask
      required: true
      description: what this ticket asks for
    - x-one-per: steps
    - header: Discussion
      required: true
      position: last
      description: what anybody adds, at any time
`;

function treeWithProcesses(files = {}) {
  const said = doorsSaying(onBranch("work/one"), {
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at("spec/processes/note.yaml")]: NOTE_PROCESS,
    [at("spec/processes/trivial.yaml")]: TRIVIAL_PROCESS,
    ...files,
  });
  said.it.words = 5;
  return said;
}

test("work note writes a private ticket off the note process, and says so", () => {
  const said = treeWithProcesses();
  const ran = heard(() => work(ROOT, ["note", "slow-lint", "The", "lint", "drags."], said.it));

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${TICKETS}/slow-lint.md`));
  assert.match(text, /^kind: \[\[ticket\]\]$/m);
  assert.match(text, /^state: open$/m);
  assert.match(text, /^step: decide$/m);
  assert.match(text, /^process: \[\[spec\/processes\/note\]\]$/m);
  assert.match(text, /^process_hash: [0-9a-f]{16}$/m);
  assert.match(text, /The lint drags\./);
  assert.match(ran.said, /waits for a retro to decide it/);
});

test("work note writes a note row, so the answer door reads it off the log", () => {
  const rows = [];
  const said = treeWithProcesses();
  said.it.log = {
    say: (level, kind, line, more) => {
      rows.push({ level, kind, line, more });
      return Promise.resolve();
    },
  };
  work(ROOT, ["note", "slow-lint", "The lint drags."], said.it);
  assert.deepEqual(rows, [
    { level: "info", kind: NOTE, line: "The lint drags.", more: { ticket: "slow-lint" } },
  ]);
});

test("work note writes from off the hold, as the ticket and the step in hand", () => {
  const said = treeWithProcesses({
    [at(HOLD)]: JSON.stringify({ ticket: "a-route-is-a-graph", step: "implement/change" }),
  });
  heard(() => work(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  assert.match(
    said.disk.read(at(`${TICKETS}/slow-lint.md`)),
    /^ {4}from: a-route-is-a-graph\/implement\/change$/m,
  );
});

test("work note takes a name and a line, and refuses a note standing already", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => work(ROOT, ["note", "slow-lint"], said.it)).code, 2);
  heard(() => work(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  const twice = heard(() => work(ROOT, ["note", "slow-lint", "Again."], said.it));
  assert.equal(twice.code, 2);
  assert.match(twice.said, /stands already/);
});

test("a reroute refuses where step names a leaf the new route lacks", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: decide\nsteps:\n  - name: decide\n    does: says what the note becomes\n    to: retro\nprocess: [[spec/processes/note]]\nprocess_hash: old\n---\n\n# Ask\n\nA thing.\n\n# decide\n\n<!-- says what the note becomes -->\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at(`${TICKETS}/slow-lint.md`)]: front });
  const ran = heard(() =>
    work(ROOT, ["reroute", "slow-lint", "--process=trivial"], said.it),
  );
  assert.equal(ran.code, 1);
  assert.match(ran.said, /holds no such leaf/);
});

test("a reroute copies the current route, and keeps the leaves already reached", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: do\nsteps:\n  - name: do\n    does: makes the change, the old way\n    to: retro\n    evidence:\n      - name: says\n        form: text\n        says: what changes and why\nprocess: [[spec/processes/trivial]]\nprocess_hash: old\n---\n\n# Ask\n\nA thing.\n\n# do\n\n<!-- makes the change, the old way -->\n\n## says\n\nIt changes the lint.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at(`${TICKETS}/slow-lint.md`)]: front });
  const ran = heard(() => work(ROOT, ["reroute", "slow-lint"], said.it));

  assert.equal(ran.code, 0);
  const now = said.disk.read(at(`${TICKETS}/slow-lint.md`));
  assert.match(now, /makes the change, the old way/, "the leaf in hand keeps what it holds");
  assert.match(now, /It changes the lint\./, "the chapter keeps what the hand wrote");
  assert.match(now, /^process_hash: [0-9a-f]{16}$/m);
});

test("a reroute leaves a ticket whose hash already matches its process", () => {
  const said = treeWithProcesses();
  heard(() => work(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  const was = said.disk.read(at(`${TICKETS}/slow-lint.md`));
  const ran = heard(() => work(ROOT, ["reroute", "slow-lint"], said.it));

  assert.equal(ran.code, 0);
  assert.match(ran.said, /already carries note as it stands/);
  assert.equal(said.disk.read(at(`${TICKETS}/slow-lint.md`)), was);
});

test("a reroute names no ticket, and a ticket standing nowhere, and refuses", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => work(ROOT, ["reroute"], said.it)).code, 2);
  assert.equal(heard(() => work(ROOT, ["reroute", "nowhere"], said.it)).code, 2);
});

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
test("rerouted takes the new leaf where the ticket has yet to reach it", () => {
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
  const said = rerouted(front, route);
  assert.equal(said.kept, 1);
  assert.equal(said.steps[0].does, "the old first");
  assert.equal(said.steps[1].does, "the new second");
});

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
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
  const said = rerouted(front, [
    { name: "one", does: "the new first" },
    { name: "two", does: "the new second" },
    { name: "three", does: "the new third" },
  ]);
  assert.equal(said.steps[0].does, "the old first");
  assert.equal(said.steps[1].does, "the old second");
  assert.equal(said.steps[2].does, "the new third");
});

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
test("a hold names the from of every leaf, and a phase keeps its own", () => {
  const route = [{ name: "one" }, { name: "up", steps: [{ name: "deep" }] }];
  const said = fromHold(route, { ticket: "a-ticket", step: "one" });
  assert.equal(said[0].from, "a-ticket/one");
  assert.equal(said[1].from, undefined);
  assert.deepEqual(fromHold(route, null), route);
});
