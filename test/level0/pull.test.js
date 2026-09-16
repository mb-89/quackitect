// The pull, driven through fake doors. A ticket stands in a map, git answers
// from a table, and every check and every answer runs in memory.
// [[spec/design_output/pull#the-three-answers]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { fieldOf, recordIn, withEntry, withField } from "../../src/scripts/group.js";
import {
  chapterOf,
  childrenSay,
  holdOf,
  holdsVerb,
  leafOf,
  takeable,
  testSays,
  verdictIn,
  withEngineReader,
  withPayload,
  withPersonStep,
} from "../../src/scripts/pull.js";
import { ticket } from "../../src/scripts/ticket.js";
import { work } from "../../src/scripts/work.js";

const ROOT = "/tree";
const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const BRANCH = "work/one-group";
const HAND = "box d462e994b4cef";
const HOLD = join(ROOT, ".se/hold/box-d462e994b4cef.json");
// [[spec/design_output/doors#a-fake-behaves]]
const SCHEMA = `kind: ticket

governs:
  - spec/tickets/**
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
      x-engine: true
      description: whether anybody pulls it
    reason:
      enum: [done, dropped, became]
      description: how the work stopped
    urgency:
      enum: [now, soon, whenever]
      description: which ticket the pull hands out first
    step:
      type: string
      x-names: steps
      x-leaf: true
      x-engine: true
      description: the leaf of the route this ticket stands on
    steps:
      type: array
      x-engine: true
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
            x-names: steps
            x-words: [anyone, person, agent, helper, retro, children]
            x-prefix: not
            description: the hand this step admits
          not:
            type: string
            x-names: steps
            description: a step whose hand this step's hand may not be
          reads:
            type: [array, string]
            x-link: true
            description: the guidance notes this step's hand reads
          on_fail:
            type: string
            x-earlier: steps
            description: the earlier step a failed hand-back sends the ticket to
          asks:
            type: string
            description: the question a person answers
          options:
            type: array
            description: the words that answer asks
          when:
            enum: [returned, cloud, desk]
            description: the condition the pull reads
          checklist:
            type: array
            description: what a hand has to do here
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
            description: what this step reads
          needs:
            type: array
            description: the verbs and tools this step runs
          from:
            type: string
            description: who hands this step its input
          to:
            type: string
            description: who takes the output
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
                  description: one word, unique among the fields of this leaf
                form:
                  enum: [text, list, command, link, files, choice, checklist, verdict]
                  description: what the hand writes
                says:
                  type: string
                  description: one line on what goes in this field
                expects:
                  type: [integer, string]
                  description: the exit code or the word a command answers with
                options:
                  type: array
                  description: the words a choice takes
    process:
      x-link: true
      description: the route the mint copies from
    process_hash:
      type: string
      description: the hash of the process file
    record:
      type: array
      x-engine: true
      description: the engine's entry per leaf
      items:
        type: object
        additionalProperties: false
        required: [step]
        properties:
          step:
            type: string
            x-names: steps
            x-leaf: true
            description: the leaf this entry stands for
          hand:
            type: string
            description: the box
          hash_before:
            type: string
            description: the branch tip at the take
          hash_after:
            type: string
            description: the branch tip at the hand-back
          returns:
            type: integer
            description: how often this leaf fails back
          skipped:
            type: boolean
            description: whether the pull passes this leaf over
          why:
            type: string
            description: the reason
          answered:
            type: array
            description: one entry per command field
            items:
              type: object
              additionalProperties: false
              required: [name]
              properties:
                name:
                  type: string
                  description: the field
                exit:
                  type: integer
                  description: the exit code
                said:
                  type: string
                  description: the last line
    group:
      type: string
      description: the branch this ticket lands on
    parent:
      type: string
      description: the ticket whose children step waits for this one
    depends_on:
      type: [array, string]
      description: the tickets this one waits for
    successors:
      type: [array, string]
      description: the tickets this one became
    todo:
      type: boolean
      description: the tag a hand puts on a note

body:
  headingLevel: 1
  order: strict
  extraSections: false
  tense: present
  sections:
    - header: Ask
      required: true
      x-written: draft
      description: what this ticket asks for
    - x-one-per: steps
      x-written: hand
    - header: Discussion
      required: true
      position: last
      x-written: anyone
      description: what anybody adds
`;
const at = (path) => join(ROOT, ...path.split("/"));

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

const onBranch = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${BRANCH}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  [`git rev-list --count HEAD..origin/${BRANCH}`]: { stdout: "0\n" },
  "git status --porcelain": { stdout: "" },
  sh: { exitCode: 0, stdout: "" },
  ...extra,
});

function doors(files, answers = {}, more = {}) {
  const said = fakeGit(onBranch(answers), ROOT);
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(".se/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    [at("spec/guidance/voice.md")]:
      "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Put the bottom line first.\n",
    ...files,
  });
  const it = {
    proc: said.proc,
    disk,
    git: said,
    join,
    clock: fakeClock(),
    agent: true,
    cloud: true,
    node: "node",
    ...more,
  };
  return { it, outside: said, disk };
}

const ranGit = (said) => said.ran.map((one) => one.argv.join(" "));

const GROUP_NOTE = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[group]]
steps:
  - name: sync
    does: takes trunk in
    when: cloud
    evidence:
      - name: sync
        form: command
        expects: 0
        says: the sync
  - name: split
    does: mints the children
    to: retro
    evidence:
      - name: children
        form: list
        says: every child
  - name: children
    by: children
    on_fail: split
  - name: retro
    steps:
      - name: notes
        does: drains the notes
        needs: ["retro notes"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes
      - name: cloud
        does: names what the box lacked
        when: cloud
        to: owner
        evidence:
          - name: lacked
            form: list
            says: what the box lacked
---

# Ask

Two tickets that land as one.

# sync

## sync

# split

## children

# children

# retro

## notes

### drained

## cloud

### lacked

# Discussion
`;

const CHILD = (state = "open", step = "design/draft", more = "") => `---
kind: [[ticket]]
state: ${state}
urgency: now
${step ? `step: ${step}\n` : ""}steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        input: draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail
  - name: implement
    checklist: ["touches no file the ask leaves out", "every door has a fake"]
    steps:
      - name: tests-red
        does: writes the tests
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests fail on their own assertion
      - name: reflect
        does: names the class of error
        when: returned
        to: retro
        evidence:
          - name: class
            form: text
            says: the class
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree lints
group: one-group
${more}---

# Ask

One piece of it.

# design

## draft

### approach

<!-- the approach -->

## review

### verdict

<!-- pass or fail -->

# implement

## tests-red

### tests

## reflect

### class

## change

### lint

# Discussion
`;

const filled = (text, heading, rows) =>
  text.replace(`${heading}\n`, `${heading}\n\n${rows}\n`);

const standing = (child = CHILD(), group = GROUP_NOTE, extra = {}) => ({
  [at("spec/tickets/one-group.md")]: group,
  [at("spec/tickets/a-child.md")]: child,
  ...extra,
});

// [[spec/design_output/pull#the-hand-out]]
test("a pull off a work branch refuses, and names the take", () => {
  const { it } = doors(
    {},
    { "git rev-parse --abbrev-ref HEAD": { stdout: "claude/roaming-hopper-ab12cd\n" } },
  );

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 2);
  assert.match(said, /branch take/);
});

// [[spec/design_output/pull#the-work-answer]]
test("the pull hands out the child's first leaf, writes the hold, and the answer says does, the fields and the guidance", () => {
  const { it, disk } = doors(standing());

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^work {2}a-child at design\/draft, leaf 1 of 5 under design/);
  assert.match(said, /writes the approach the ask calls for/);
  assert.match(said, /One piece of it\./);
  assert.match(said, /### approach {2}text: the approach/);
  assert.match(said, /Reads spec\/guidance\/voice:\n {2}1\. Say what is\./);
  assert.match(said, /branch pull a-child --pass/);
  const hold = JSON.parse(disk.read(HOLD));
  assert.equal(hold.ticket, "a-child");
  assert.equal(hold.step, "design/draft");
  assert.equal(hold.hash, SHA);
  assert.equal(hold.hand, HAND);
  assert.equal(hold.reads[0].name, "spec/guidance/voice");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a second pull with a hold standing answers refused, and names the ticket in hand", () => {
  const { it } = doors(standing());
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/);
  assert.match(said, /a-child stands in your hand at design\/draft/);
});

// [[spec/design_output/pull#the-hand-back-refused]]
test("a hand-back with a field empty answers refused, keeps the hold, and counts the refusal", () => {
  const { it, disk, outside } = doors(standing());
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/);
  assert.match(said, /approach under design\/draft holds no text/);
  assert.match(said, /a-child stays in hand/);
  assert.equal(JSON.parse(disk.read(HOLD)).refused, 1);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git commit")),
    "nothing lands",
  );
});

// [[spec/design_output/pull#the-pass]]
test("the voice rules read the evidence at the hand-back, and an error refuses it", () => {
  const vale = "/tree/.se/bin/vale";
  const long = JSON.stringify({
    "stdin.md": [{ Check: "VoiceParagraph.Sentence", Line: 2, Span: [1, 3], Message: "A sentence holds 25 words.", Severity: "error" }],
  });
  const { it, disk } = doors(standing(filled(CHILD(), "### approach", "A long approach.")), {
    [`${vale} --config=.vale.ini --path=spec/tickets/a-child.md --output=JSON --no-exit`]: { stdout: long },
  });
  it.vale = vale;
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(said, /design\/draft breaks Sentence at line 2 of its chapter: A sentence holds 25 words\./);
  assert.equal(disk.exists(HOLD), true);
});

// [[spec/design_output/pull#a-leaf-comes-back]]
test("a hand takes a leaf it passed back, and another hand's leaf stays", () => {
  const passed = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk, outside } = doors(standing(passed, withField(GROUP_NOTE, "state", "closed")));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--back", "design/draft"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/draft");
  assert.equal(recordIn(now).at(-1).returns, 1);
  assert.equal(recordIn(now).at(-1).why, "the hand takes it back");
  assert.ok(ranGit(outside).includes(`git push origin ${BRANCH}`));
  assert.match(said, /a-child stands at design\/draft again/);
  assert.match(said, /^work {2}a-child at design\/draft/m, "the next pull hands it out at once");

  const other = doors(standing(passed.replace(`hand: ${HAND}`, "hand: box other")));
  const refused = heard(() => work(ROOT, ["pull", "a-child", "--back", "design/draft"], other.it));
  assert.equal(refused.code, 1);
  assert.match(refused.said, /carries no hand-back by box d462e994b4cef/);
});

// [[spec/design_output/pull#the-pass]]
test("a pass writes the record, moves the step, commits by ticket and step, pushes, and hands out the next", () => {
  const { it, disk, outside } = doors(
    standing(CHILD(), withField(GROUP_NOTE, "state", "closed")),
  );
  heard(() => work(ROOT, ["pull"], it));
  disk.write(
    at("spec/tickets/a-child.md"),
    filled(CHILD(), "### approach", "Read the note, then write the verb."),
  );

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/review");
  assert.equal(fieldOf(now, "state"), "open");
  assert.deepEqual(recordIn(now).at(-1), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  assert.ok(ranGit(outside).includes("git add -A"));
  assert.ok(ranGit(outside).includes("git commit -m a-child: passes design/draft"));
  assert.ok(ranGit(outside).includes(`git push origin ${BRANCH}`));
  assert.equal(disk.exists(HOLD), false, "the hold drops");
  assert.match(said, /^work\n {2}a-child passes design\/draft/m);
  // [[spec/design_output/pull#the-hand-rule]]
  assert.match(
    said,
    /^spawn\n {2}a-child at design\/review waits for a hand other than box d462e994b4cef, which wrote design\/draft/m,
  );
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("a step that excludes the only hand answers spawn, with the helper's name and its prompt", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took, withField(GROUP_NOTE, "state", "closed")));

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^spawn\n {2}a-child at design\/review waits for a hand other than box d462e994b4cef/);
  assert.match(said, /named helper-2, and you work one step of one ticket/);
  assert.match(said, /branch pull --as helper-2/);
  assert.match(said, /branch pull a-child --as helper-2`\. It checks/);
  assert.equal(disk.exists(HOLD), false, "the spawn answer holds nothing");
  assert.equal(takeable(it, { text: took }), "design/review", "a spawned hand can take it");
  assert.equal(takeable(it, { text: took.replace("not: draft", "by: person") }), "");
  assert.equal(takeable(it, { text: CHILD("closed", "design/review") }), "");
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the spawn comes before the group's own leaves, and the box leaves children past no takeable child", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took, withField(GROUP_NOTE, "step", "children")));

  const { said } = heard(() => work(ROOT, ["pull"], it));

  assert.match(said, /^spawn\n {2}a-child at design\/review/);
  const group = disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(group, "step"), "children", "the group stays at children");
  assert.equal(recordIn(group).length, 0, "the box leaves no entry while a hand can take the child");

  const dropped = heard(() => work(ROOT, ["pull", "--drop"], it));
  assert.match(dropped.said, /nothing stands in your hand/);
});

// [[spec/design_output/pull#the-fields-ride-the-payload]]
test("the fields ride the payload, and the engine writes them under their headings before it checks", () => {
  const { it, disk } = doors(standing(CHILD(), withField(GROUP_NOTE, "state", "closed")));
  heard(() => work(ROOT, ["pull"], it));

  const wrong = heard(() => work(ROOT, ["pull", "a-child", "--pass", "--fields", '{"nowhere": "x"}'], it));
  assert.equal(wrong.code, 1);
  assert.match(wrong.said, /design\/draft holds no field nowhere/);

  const { code } = heard(() =>
    work(ROOT, ["pull", "a-child", "--pass", "--fields", '{"approach": "Read it.\\nThen write."}'], it),
  );
  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.match(now, /### approach\n\n<!-- the approach -->\n\nRead it\.\nThen write\.\n/);
  assert.equal(fieldOf(now, "step"), "design/review");

  const listed = withPayload(CHILD("open", "implement/tests-red"), "implement/tests-red", '{"tests": "node --test", "checked": "- one\\n- two"}');
  assert.match(listed.text, /### tests\n\nnode --test\n\n### checked\n\n- one\n- two\n\n## reflect/);
  assert.match(withPayload("x", "a", "nope").why, /takes a JSON object/);
});

// [[spec/design_output/pull#the-fields-ride-the-payload]]
test("the payload spans a fence, a porcelain row reads whole, and a files field meets no voice rule", () => {
  const fenced = filled(CHILD("open", "implement/tests-red"), "### tests", "```\nold one\n```");
  const put = withPayload(fenced, "implement/tests-red", '{"tests": "node --test"}');
  assert.match(put.text, /### tests\n\nnode --test\n\n## reflect/, "the fence goes with the old text");

  const vale = "/tree/.se/bin/vale";
  const ranVale = [];
  const route = CHILD("open", "verdict").replace(
    "group: one-group\n",
    "  - name: verdict\n    does: reads every hunk\n    input: [diff, implement]\n    to: retro\n    evidence:\n      - name: read\n        form: files\n        says: every file you read\n      - name: verdict\n        form: verdict\n        says: pass or fail\ngroup: one-group\n",
  );
  const body = route.replace("# Discussion\n", "# verdict\n\n## read\n\n## verdict\n\n# Discussion\n");
  const { it } = doors(standing(body, withField(GROUP_NOTE, "state", "closed")), {
    "git status --porcelain": { stdout: "M spec/tickets/a-child.md\n?? .vale.ini" },
    [`${vale} --config=.vale.ini --path=spec/tickets/a-child.md --output=JSON --no-exit`]: (_argv, init) => {
      ranVale.push(init.stdin);
      return { stdout: "{}" };
    },
  });
  it.vale = vale;
  heard(() => work(ROOT, ["pull"], it));

  const short = heard(() =>
    work(ROOT, ["pull", "a-child", "--fields", '{"read": "- .vale.ini", "verdict": "pass"}'], it),
  );
  assert.equal(short.code, 1);
  assert.match(short.said, /read under verdict leaves out spec\/tickets\/a-child\.md/, "the row reads whole");

  const whole = heard(() =>
    work(ROOT, ["pull", "a-child", "--fields", '{"read": "- .vale.ini\\n- spec/tickets/a-child.md", "verdict": "pass"}'], it),
  );
  assert.equal(whole.code, 0, whole.said);
  assert.ok(ranVale.length, "the voice reads the verdict");
  assert.doesNotMatch(ranVale.at(-1), /vale\.ini/, "the voice skips the files field");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a hold drops on request, and the leaf stays where it stands", () => {
  const { it, disk } = doors(standing());
  heard(() => work(ROOT, ["pull"], it));
  assert.equal(disk.exists(HOLD), true);

  const { code, said } = heard(() => work(ROOT, ["pull", "--drop"], it));

  assert.equal(code, 0);
  assert.match(said, /the hold drops, and a-child stays at design\/draft/);
  assert.equal(disk.exists(HOLD), false);
  assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"), "design/draft");
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("a hand under --as works one step under its own name, and the pull answers done after it", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took));
  const helper = join(ROOT, ".se/hold/box-d462e994b4cef-helper-2.json");

  const out = heard(() => work(ROOT, ["pull", "--as", "helper-2"], it));
  assert.equal(out.code, 0);
  assert.match(out.said, /^work {2}a-child at design\/review/);
  assert.equal(JSON.parse(disk.read(helper)).hand, "box d462e994b4cef · helper-2");

  disk.write(at("spec/tickets/a-child.md"), filled(took, "### verdict", "pass"));
  const back = heard(() => work(ROOT, ["pull", "a-child", "--as", "helper-2"], it));
  assert.equal(back.code, 0);
  assert.match(back.said, /^done\n {2}box d462e994b4cef · helper-2 works one step, and it is done/m);
  assert.doesNotMatch(back.said, /^work {2}/m, "a one-step hand takes no next leaf");
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(recordIn(now).at(-1).hand, "box d462e994b4cef · helper-2");
  assert.equal(fieldOf(now, "step"), "implement/tests-red");
  assert.equal(disk.exists(helper), false);
});

// [[spec/design_output/pull#the-hand-rule]]
test("another hand takes the review, and the same hand waits", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: "box other",
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it } = doors(standing(took));

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^work {2}a-child at design\/review/);
  assert.match(said, /the verdict field decides/);
});

// [[spec/design_output/pull#the-fail]]
test("a verdict field decides, the flag is refused there, and a fail sends the ticket back with a return", () => {
  const took = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: "box other",
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(standing(took));
  heard(() => work(ROOT, ["pull"], it));

  const flagged = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(flagged.code, 1);
  assert.match(flagged.said, /the field decides and the flag stays off/);

  disk.write(
    at("spec/tickets/a-child.md"),
    filled(took, "### verdict", "fail\n- the approach names no test"),
  );
  const { code, said } = heard(() => work(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/draft");
  const entry = recordIn(now).at(-1);
  assert.equal(entry.step, "design/review");
  assert.equal(entry.returns, 1);
  assert.equal(entry.why, "the approach names no test");
  assert.match(said, /fails design\/review back to design\/draft/);
});

// [[spec/design_output/pull#a-person-step-goes-in]]
test("a step failing back twice inserts a person step, and a third insertion asks for a split", () => {
  const once = withEntry(CHILD("open", "design/review"), {
    step: "design/review",
    hand: "box other",
    hash_before: "aaaa",
    hash_after: "aaaa",
    returns: 1,
    why: "thin",
  });
  const twice = filled(once, "### verdict", "fail\n- still thin");
  const { it, disk } = doors(standing(twice), {}, { fails: 2 });
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/person-1");
  assert.match(
    now,
    /- name: person-1\n\s+does: answers the question the engine asks\n\s+by: person\n\s+to: engine\n\s+asks: "design\/review failed back 2 times: still thin"/,
  );
  const bare = now.replace("    to: engine\n", "");
  const rooted = { ...it, root: ROOT };
  assert.match(withEngineReader(rooted, { text: bare }), /to: engine/, "the hand-out repairs a person step with no reader");
  assert.equal(withEngineReader(rooted, { text: now }), "");

  const colon = withEntry(CHILD("open", "design/review"), {
    step: "design/review",
    hand: "box other",
    hash_before: "aaaa",
    hash_after: "aaaa",
    returns: 1,
    why: "thin",
  });
  const asked = { name: "a-child", text: filled(colon, "### verdict", "fail\n- breaks Sentence at line 2: too long") };
  const put = withPersonStep({ ...it, root: ROOT, fails: 2 }, asked, "design/draft", "the hand-back met refused: breaks Sentence at line 2: too long");
  assert.equal(put.path, "design/person-1");
  assert.match(asked.text, /^\s+asks: "the hand-back met refused: breaks Sentence at line 2: too long"$/m, "a colon takes quotes");
  assert.equal(readNote(asked.text).front.said.steps[0].steps[0].asks, "the hand-back met refused: breaks Sentence at line 2: too long");
  const unquoted = asked.text.replace(/asks: "(.*)"/, "asks: $1");
  assert.match(withEngineReader(rooted, { text: unquoted }), /asks: "the hand-back met refused: breaks/, "the hand-out repairs a bare colon");
  assert.match(
    now,
    /^## person-1\n\n<!-- answers the question the engine asks -->\n\n### answer/m,
  );
  assert.match(said, /waits for a person at design\/person-1/);

  const one = { name: "a-child", text: now };
  assert.equal(
    withPersonStep({ ...it, splits: 1 }, one, "design/review", "again").path,
    "",
  );
});

// [[spec/design_output/pull#a-condition-skips-a-leaf]]
test("a leaf under when returned is skipped on the way forward, with the reason in the record", () => {
  const ready = filled(
    CHILD("open", "implement/tests-red"),
    "### tests",
    "node --test test/x.test.js",
  );
  const { it, disk } = doors(standing(ready), {
    sh: { exitCode: 1, stdout: "assertion, 1 test(s) fail on their own assertion\n" },
  });
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1, "the checked field is short, so the hand-back is refused");
  assert.match(
    said,
    /checked under implement\/tests-red holds 0 line\(s\), and the checklist holds 2/,
  );

  const checked = filled(
    ready,
    "### tests",
    "node --test test/x.test.js\n\n### checked\n\n- it touches the two files\n- the proc fake stands",
  );
  disk.write(at("spec/tickets/a-child.md"), checked);
  const passed = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(passed.code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "implement/change");
  const entries = recordIn(now);
  assert.deepEqual(entries.at(-2).answered, [
    {
      name: "tests",
      exit: 1,
      said: "assertion, 1 test(s) fail on their own assertion",
    },
  ]);
  assert.deepEqual(entries.at(-1), {
    step: "implement/reflect",
    skipped: true,
    why: "the ticket arrives here by no on_fail",
  });
});

// [[spec/design_output/pull#the-commands-answer]]
test("a command answering the wrong word or exit refuses the hand-back, and the answer is named", () => {
  const ready = filled(
    CHILD("open", "implement/tests-red"),
    "### tests",
    "node --test test/x.test.js\n\n### checked\n\n- one\n- two",
  );
  const { it } = doors(standing(ready), {
    sh: { exitCode: 0, stdout: "green, 3 test(s) pass\n" },
  });
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(
    said,
    /tests under implement\/tests-red expects assertion, and node --test test\/x\.test\.js answers green/,
  );
});

// [[spec/design_output/pull#the-hand-back-matches-the-hold]]
test("a hand-back the record answers gets the recorded answer, and a stale take hash gets refused", () => {
  const answered = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(
    standing(answered, withField(GROUP_NOTE, "state", "closed")),
  );
  disk.write(
    HOLD,
    JSON.stringify({
      ticket: "a-child",
      path: "spec/tickets/a-child.md",
      step: "design/draft",
      hand: HAND,
      hash: SHA,
    }),
  );

  const twice = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.match(twice.said, /answered already, and the record holds it/);
  assert.equal(disk.exists(HOLD), false);

  const stale = doors(standing(), {
    "git merge-base --is-ancestor 0000 HEAD": { exitCode: 1 },
  });
  stale.disk.write(
    HOLD,
    JSON.stringify({
      ticket: "a-child",
      path: "spec/tickets/a-child.md",
      step: "design/draft",
      hand: HAND,
      hash: "0000",
    }),
  );
  const { code, said } = heard(() =>
    work(ROOT, ["pull", "a-child", "--pass"], stale.it),
  );
  assert.equal(code, 1);
  assert.match(said, /the take hash 0000 trails work\/one-group, so the hold drops/);
  assert.equal(stale.disk.exists(HOLD), false);
});

// [[spec/design_output/pull#the-rejected-push]]
test("a rejected push fetches, rebases the commit, tries once more, and then answers refused", () => {
  let pushes = 0;
  const once = doors(standing(filled(CHILD(), "### approach", "The approach.")), {
    [`git push origin ${BRANCH}`]: () => ({ exitCode: pushes++ ? 0 : 1 }),
  });
  heard(() => work(ROOT, ["pull"], once.it));
  const { code } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], once.it));
  assert.equal(code, 0);
  const ran = ranGit(once.outside);
  assert.ok(ran.includes(`git rebase origin/${BRANCH}`));
  assert.equal(ran.filter((one) => one === `git push origin ${BRANCH}`).length, 2);

  const stuck = doors(standing(filled(CHILD(), "### approach", "The approach.")), {
    [`git push origin ${BRANCH}`]: { exitCode: 1 },
    [`git rebase origin/${BRANCH}`]: { exitCode: 1 },
  });
  heard(() => work(ROOT, ["pull"], stuck.it));
  const refused = heard(() => work(ROOT, ["pull", "a-child", "--pass"], stuck.it));
  assert.equal(refused.code, 1);
  assert.match(refused.said, /moves under this hand-back/);
  assert.ok(ranGit(stuck.outside).includes("git rebase --abort"));
  assert.equal(
    stuck.disk.exists(HOLD),
    true,
    "the hold stays, so the next pull pushes again",
  );
});

// [[spec/design_output/pull#a-need-is-a-verb]]
test("a need names a verb, and the box says which it holds", () => {
  assert.equal(holdsVerb("work test"), true);
  assert.equal(holdsVerb("branch pull"), true);
  assert.equal(holdsVerb("retro notes"), true);
  assert.equal(holdsVerb("retro collect"), false);
  assert.equal(holdsVerb("deploy"), false);
  assert.equal(holdsVerb("ticket"), true);
});

// [[spec/design_output/pull#a-need-is-a-verb]]
test("a child waits for an open dependency, and the group's own dependencies are the take's", () => {
  const waits = CHILD().replace("group: one-group\n", "group: one-group\ndepends_on: [\"a-loose-one\"]\n");
  const group = GROUP_NOTE.replace("process: [[group]]\n", "process: [[group]]\ndepends_on: [\"a-loose-one\"]\n");
  const { it } = doors(standing(waits, group, { [at("spec/tickets/a-loose-one.md")]: CHILD("open", "design/draft").replace("group: one-group\n", "") }));

  const { said } = heard(() => work(ROOT, ["pull"], it));

  assert.match(said, /^work {2}one-group at sync/, "the take arbitrates the group's dependencies");
  const hold = JSON.parse(it.disk.read(HOLD));
  assert.equal(hold.ticket, "one-group");
});

// [[spec/design_output/pull#a-need-is-a-verb]]
test("a leaf needing a verb the box lacks answers wait, with the reason", () => {
  const child = CHILD("open", "design/draft").replace(
    "  - name: design\n",
    '  - name: design\n    needs: ["deploy now"]\n',
  );
  const { it } = doors(
    standing(child, GROUP_NOTE.replace("state: open", "state: closed")),
  );

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^wait\n {2}a-child needs deploy now, which this box lacks/);
});

// [[spec/design_output/pull#children-before-their-group]]
test("the group's children step derives from its tickets, and the box leaves it while a child waits", () => {
  const parked = CHILD("open", "design/review").replace("        not: draft\n", "        by: person\n");
  const { it, disk } = doors(
    standing(parked, withField(GROUP_NOTE, "step", "children")),
    {
      sh: { exitCode: 0, stdout: "" },
    },
  );
  const held = withEntry(parked, {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  disk.write(at("spec/tickets/a-child.md"), held);

  const { code, said } = heard(() => work(ROOT, ["pull"], it));

  assert.equal(code, 0);
  assert.match(said, /^work {2}one-group at retro\/notes/);
  const now = disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(now, "step"), "retro/notes");
  assert.deepEqual(recordIn(now).at(-1), {
    step: "children",
    hand: HAND,
    skipped: true,
    why: "the box leaves it while a-child stand open",
  });
});

// [[spec/design_output/pull#children-before-their-group]]
test("every child closed passes the children step by the engine, and a dropped child fails it back", () => {
  const shut = CHILD("closed", "implement/change", "reason: done\n");
  const done = doors(standing(shut, withField(GROUP_NOTE, "step", "children")));
  heard(() => work(ROOT, ["pull"], done.it));
  const passed = done.disk.read(at("spec/tickets/one-group.md"));
  assert.equal(recordIn(passed).at(-1).step, "children");
  assert.equal(recordIn(passed).at(-1).hand, "the engine");
  assert.equal(fieldOf(passed, "step"), "retro/notes");

  const dropped = CHILD("closed", "design/draft", "reason: dropped\n");
  const back = doors(standing(dropped, withField(GROUP_NOTE, "step", "children")));
  const { said } = heard(() => work(ROOT, ["pull"], back.it));
  assert.equal(
    fieldOf(back.disk.read(at("spec/tickets/one-group.md")), "step"),
    "split",
  );
  assert.match(said, /^work {2}one-group at split/);
  assert.deepEqual(
    childrenSay([{ name: "x", text: dropped, private: false }], "one-group"),
    {
      open: [],
      dropped: ["x"],
      all: ["x"],
    },
  );
});

// [[spec/design_output/pull#children-before-their-group]]
test("the group's last leaf returns to children while a child stands open, and closes done once none does", () => {
  const last = withEntry(withField(GROUP_NOTE, "step", "retro/cloud"), {
    step: "children",
    hand: HAND,
    skipped: true,
    why: "the box leaves it while a-child stand open",
  });
  const parked = withEntry(CHILD("open", "design/review").replace("        not: draft\n", "        by: person\n"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const open = doors(standing(parked, filled(last, "### lacked", "- nothing")));
  heard(() => work(ROOT, ["pull"], open.it));
  assert.equal(JSON.parse(open.disk.read(HOLD)).step, "retro/cloud");
  const back = heard(() => work(ROOT, ["pull", "one-group", "--pass"], open.it));
  assert.equal(back.code, 0, back.said);
  const stays = open.disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(stays, "state"), "open");
  assert.equal(fieldOf(stays, "step"), "children");
  assert.match(back.said, /^ {2}a-child waits for a person at design\/review/m, "the box leaves once, and waits the second time");

  const shut = doors(
    standing(
      CHILD("closed", "implement/change", "reason: done\n"),
      filled(last, "### lacked", "- nothing"),
    ),
  );
  heard(() => work(ROOT, ["pull"], shut.it));
  heard(() => work(ROOT, ["pull", "one-group", "--pass"], shut.it));
  const closed = shut.disk.read(at("spec/tickets/one-group.md"));
  assert.equal(fieldOf(closed, "state"), "closed");
  assert.equal(fieldOf(closed, "reason"), "done");
});

// [[spec/design_output/pull#the-private-queue]]
test("a tagged note comes first, a private breakdown after the group's tickets, and a note waits for a retro hand", () => {
  const note = (todo, process = "note") => `---
kind: [[ticket]]
state: open
urgency: whenever
process: [[${process}]]
${todo ? "todo: true\n" : ""}steps:
  - name: decide
    does: says what the note becomes
    by: ${process === "note" ? "retro" : "anyone"}
    evidence:
      - name: outcome
        form: text
        says: what it becomes
---

# Ask

A thing to look at.

# decide

## outcome

# Discussion
`;
  const first = doors(
    standing(CHILD(), GROUP_NOTE, { [at(".se/tickets/parked.md")]: note(true) }),
  );
  const tagged = heard(() => work(ROOT, ["pull"], first.it));
  assert.match(tagged.said, /^work {2}parked at decide/);
  assert.equal(
    JSON.parse(first.disk.read(HOLD)).hash,
    "",
    "a private ticket takes no hash",
  );

  const later = doors(
    standing(
      CHILD("closed", "implement/change", "reason: done\n"),
      withField(GROUP_NOTE, "step", "children"),
      {
        [at(".se/tickets/a-note.md")]: note(false),
        [at(".se/tickets/a-piece.md")]: note(false, "trivial"),
      },
    ),
  );
  heard(() => work(ROOT, ["pull"], later.it));
  const hold = JSON.parse(later.disk.read(HOLD));
  assert.equal(
    hold.ticket,
    "one-group",
    "the group's own leaf comes before a private breakdown",
  );
  later.disk.remove(HOLD);
  later.disk.write(
    at("spec/tickets/one-group.md"),
    withField(GROUP_NOTE, "state", "closed"),
  );
  const { said } = heard(() => work(ROOT, ["pull"], later.it));
  assert.match(said, /^work {2}a-piece at decide/);
  assert.doesNotMatch(said, /a-note/, "a note waits for a retro hand");
});

// [[spec/design_output/pull#became]]
test("became closes the ticket with its successor, reads no field of the leaf, and refuses a successor standing nowhere", () => {
  const { it, disk } = doors(
    standing(CHILD(), GROUP_NOTE, {
      [at("spec/tickets/a-successor.md")]: CHILD("draft", ""),
    }),
  );
  heard(() => work(ROOT, ["pull"], it));

  const missing = heard(() =>
    work(ROOT, ["pull", "a-child", "--became", "nobody"], it),
  );
  assert.equal(missing.code, 1);
  assert.match(missing.said, /nobody stands nowhere yet/);

  const { code } = heard(() =>
    work(ROOT, ["pull", "a-child", "--became", "a-successor"], it),
  );
  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "state"), "closed");
  assert.equal(fieldOf(now, "reason"), "became");
  assert.equal(fieldOf(now, "successors"), "a-successor");
});

// [[spec/design_output/pull#a-leaf-inherits]]
test("a leaf inherits by, on_fail and the checklist from its phases, and reads add up", () => {
  const front = {
    steps: [
      {
        name: "implement",
        by: "agent",
        checklist: ["a"],
        reads: "[[x]]",
        steps: [
          { name: "change", checklist: ["b"], reads: ["[[y]]"], on_fail: "implement" },
        ],
      },
    ],
  };
  const leaf = leafOf(front, "implement/change");
  assert.equal(leaf.by, "agent");
  assert.equal(leaf.on_fail, "implement");
  assert.deepEqual(leaf.checklist, ["a", "b"]);
  const quoted = leafOf(
    readNote('---\nsteps:\n  - name: do\n    checklist: ["one, and two", "three"]\n---\n').front.said,
    "do",
  );
  assert.deepEqual(quoted.checklist, ["one, and two", "three"], "a comma inside quotes stays");
  assert.deepEqual(leaf.reads, ["x", "y"]);
  assert.equal(leaf.at, 0);
  assert.equal(leafOf(front, "implement"), null, "a phase is no leaf");
});

// [[spec/design_output/pull#the-fields-hold-their-forms]]
test("a leaf's chapter reads its fields by heading, past the comments and the engine's lines", () => {
  const text = filled(
    CHILD(),
    "### approach",
    "<!-- a comment -->\nThe approach.\nanswered: exit 0",
  );
  const said = chapterOf(text, "design/draft");
  assert.equal(said.stands, true);
  assert.deepEqual(said.fields.get("approach"), ["The approach."]);
  assert.equal(chapterOf(text, "design/nowhere").stands, false);
  assert.deepEqual(verdictIn(["pass"]), { said: "pass", reason: "" });
  assert.deepEqual(verdictIn(["fail: thin", "- and short"]), {
    said: "fail",
    reason: "thin; and short",
  });
  assert.deepEqual(verdictIn(["maybe"]), { said: "" });
});

// [[spec/design_output/pull#the-test-verb]]
test("the test verb answers green, assertion, build or missing over the tests the branch changes", () => {
  const pass = { exitCode: 0, stdout: "# tests 3\n# pass 3\n# fail 0\n" };
  assert.match(testSays(pass, ["a"]), /^green, 3 test\(s\) pass in 1 file\(s\)/);
  const red = {
    exitCode: 1,
    stdout: "not ok 1\n  code: 'ERR_ASSERTION'\n# tests 2\n# pass 1\n# fail 1\n",
  };
  assert.match(
    testSays(red, ["a"]),
    /^assertion, 1 test\(s\) fail on their own assertion/,
  );
  const broken = {
    exitCode: 1,
    stderr: "SyntaxError: Unexpected token\n",
    stdout: "# tests 0\n",
  };
  assert.match(
    testSays(broken, ["a"]),
    /^build, because a file loads no test: SyntaxError/,
  );
  const thrown = {
    exitCode: 1,
    stdout:
      "not ok 1\n  TypeError: x is not a function\n# tests 1\n# pass 0\n# fail 1\n",
  };
  assert.match(
    testSays(thrown, ["a"]),
    /^build, because 1 test\(s\) fail outside an assertion: TypeError/,
  );

  const none = doors(standing(), {
    "git merge-base origin/main HEAD": { stdout: "base111\n" },
    "git diff --name-only base111..HEAD": { stdout: "src/x.js\n" },
  });
  const missing = heard(() => work(ROOT, ["test"], none.it));
  assert.equal(missing.code, 1);
  assert.match(
    missing.said,
    /^missing, because the branch changes no test since base111/,
  );

  const some = doors(standing(), {
    "git merge-base origin/main HEAD": { stdout: "base111\n" },
    "git diff --name-only base111..HEAD": {
      stdout: "test/level0/x.test.js\nsrc/x.js\n",
    },
    "node --test --test-reporter=tap test/level0/x.test.js": pass,
  });
  const green = heard(() => work(ROOT, ["test"], some.it));
  assert.equal(green.code, 0);
  assert.match(green.said, /^green/);
});

// [[spec/design_output/pull#a-draft-opens]]
test("ticket open turns a draft with an ask into an open ticket at its first leaf, and refuses an empty ask", () => {
  const { it, disk } = doors(standing(CHILD("draft", "")));
  const { code, said } = heard(() => ticket(ROOT, ["open", "a-child"], it));
  assert.equal(code, 0);
  assert.match(said, /stands open at design\/draft/);
  assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "state"), "open");
  assert.equal(
    fieldOf(disk.read(at("spec/tickets/a-child.md")), "step"),
    "design/draft",
  );

  const empty = doors(standing(CHILD("draft", "").replace("One piece of it.\n", "")));
  assert.equal(heard(() => ticket(ROOT, ["open", "a-child"], empty.it)).code, 1);
});

// [[spec/design_output/pull#the-five-checks]]
test("the judge's material is the leaf's evidence and the rules its reads name, as JSON", () => {
  const { it } = doors(standing(filled(CHILD(), "### approach", "The approach.")));
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--judge"], it));

  assert.equal(code, 0);
  assert.deepEqual(JSON.parse(said), {
    ticket: "a-child",
    step: "design/draft",
    evidence: "approach:\nThe approach.",
    rules: ["Say what is.", "Put the bottom line first."],
  });
  const none = doors(standing());
  assert.equal(heard(() => work(ROOT, ["pull", "a-child", "--judge"], none.it)).said, "null");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the hold reads back what the pull writes, and a box with no id mints one", () => {
  const { it, disk } = doors(standing());
  it.root = ROOT;
  assert.equal(holdOf(it, HAND), null);
  disk.remove(at(".se/box.json"));
  it.random = () => "fresh1";
  heard(() => work(ROOT, ["pull"], it));
  assert.equal(JSON.parse(disk.read(at(".se/box.json"))).id, "fresh1");
  assert.equal(holdOf(it, "box fresh1").ticket, "a-child");
});
