// The write door over two fake roots. The path reads relative to the work
// root, and the schema comes off the method root, so a stub's bad ticket
// meets the vehicle's rules.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { relativeTo } from "../../.claude/skills/level0/lib/paths.js";
import { MARKS } from "../../.claude/skills/level0/lib/runs.js";
import { errorsIn, marksSeen, onWrite } from "../../src/bridge/write.js";
import { fakeDisk, norm } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { TICKET_SCHEMA as SCHEMA } from "./fixtures.js";
import {
  called,
  edits,
  NUMBERED,
  reads,
  realDisk,
  refused,
  served,
  TREE,
} from "./mark-doors.js";

const METHOD = "/tools";
const WORK = "/stub";

const GOOD = `---
kind: [[ticket]]
state: open
step: do
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change
---

# Ask

A small thing.

# do

## change

# Discussion
`;

const BAD = `---
kind: [[ticket]]
state: open
---

# Ask

A ticket with no route.

# Discussion
`;

// The box the server keeps per work root, with the doors this test needs. [[spec/design_output/level0#the-bridgehead-and-the-server]]
function box(files = {}) {
  const files_ = fakeDisk({
    [join(METHOD, "spec", "schemas", "ticket.schema.yaml")]: SCHEMA,
    ...files,
  });
  return {
    method: METHOD,
    work: WORK,
    root: WORK,
    disk: files_,
    log: fakeLog(),
    vale: { stands: () => false },
    projections: [],
  };
}

const write = (path, content) => ({ tool: "Write", file_path: path, content });

test("a ticket under the stub breaking the vehicle's schema comes back refused", async () => {
  const said = await onWrite(
    write(join(WORK, "spec", "tickets", "bad.md"), BAD),
    box(),
  );
  assert.ok(said?.result?.deny, "the door refuses");
  assert.match(said.result.deny, /steps/);
});

test("a ticket under the stub keeping the vehicle's schema passes, and the stub holds no schema", async () => {
  const it = box();
  assert.ok(
    !it.disk.exists(join(WORK, "spec", "schemas")),
    "the stub carries no schema of its own",
  );
  const said = await onWrite(write(join(WORK, "spec", "tickets", "good.md"), GOOD), it);
  assert.deepEqual(said, { pass: true });
});

// A warning lets the write land, and tells the agent it stands in the panel and to carry on. [[spec/design_output/level0#the-panel-holds-a-warning]]
test("a write at warning lands, and the note after it names the panel and says carry on", async () => {
  const at = join(WORK, "spec", "tickets", "warned.md");
  const warning = (rule) => ({
    file: "spec/tickets/warned.md",
    rule,
    line: 5,
    column: 1,
    message: "Cut this one in two.",
    severity: "warning",
  });
  const it = box();
  let found = [warning("VoiceVale.Passive")];
  it.vale = { stands: () => true, lint: async () => ({ ran: true, found }) };

  const said = await onWrite(write(at, GOOD), it);
  assert.equal(said?.result?.deny, undefined, "the write lands");
  assert.match(
    said?.after?.context?.[0] ?? "",
    /stand at warning, and the write lands/,
  );
  assert.match(said.after.context[0], /carry on/);
  assert.match(said.after.context[0], /Problems panel/);
  assert.match(said.after.context[0], /VoiceVale\.Passive/);
  assert.equal(
    it.disk.exists(join(WORK, ".se", ".runtime", "refactor.json")),
    false,
    "the door keeps no list of its own",
  );

  found = [];
  const clean = await onWrite(write(at, GOOD), it);
  assert.deepEqual(clean, { pass: true });
});

// The door reads the children off the work root, so a group's ask naming one comes back refused. [[spec/design_output/work#a-group-is-a-ticket]]
test("a group's ask naming a child of its own comes back refused", async () => {
  const kid = GOOD.replace("state: open\n", "state: open\ngroup: parent\n");
  const it = box({ [join(WORK, "spec", "tickets", "kid.md")]: kid });
  const parent = GOOD.replace("A small thing.", "The group carries kid and closes it.");
  const said = await onWrite(
    write(join(WORK, "spec", "tickets", "parent.md"), parent),
    it,
  );
  assert.ok(said?.result?.deny, "the door refuses");
  assert.match(said.result.deny, /restated/);
  const quiet = await onWrite(
    write(join(WORK, "spec", "tickets", "parent.md"), GOOD),
    it,
  );
  assert.deepEqual(quiet, { pass: true });
});

// [[spec/design_output/level0#a-write-meets-its-mark]]
test("a write over a standing file this hand has read none of comes back refused", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const said = await onWrite(write(at, GOOD), box({ [at]: GOOD }));
  assert.match(said?.result?.deny ?? "", /has read none of it/);
});

test("a read marks the file, and the write over it lands", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const it = box({ [at]: GOOD });
  marksSeen(it, relativeTo(it.root, at), GOOD);
  assert.deepEqual(await onWrite(write(at, GOOD), it), { pass: true });
});

test("a file moving after the read refuses the write that follows", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const it = box({ [at]: GOOD });
  marksSeen(it, relativeTo(it.root, at), `${GOOD}\n`);
  const said = await onWrite(write(at, GOOD), it);
  assert.match(said?.result?.deny ?? "", /moved on the disk after you read it/);
});

test("a write landing marks what it leaves, so the next write over it lands", async () => {
  const at = join(WORK, "spec", "tickets", "born.md");
  const it = box();
  assert.deepEqual(await onWrite(write(at, GOOD), it), { pass: true });
  it.disk.write(at, GOOD);
  assert.deepEqual(await onWrite(write(at, GOOD), it), { pass: true });
});

test("the same bad ticket written into the vehicle's own tree is refused the same way", async () => {
  const said = await onWrite(write(join(METHOD, "spec", "tickets", "bad.md"), BAD), {
    ...box(),
    work: METHOD,
    root: METHOD,
  });
  assert.match(said?.result?.deny ?? "", /steps/);
});

// A rule of form reads warning, and the write lands with it standing in the Problems panel. [[spec/rationales/voice#11-form-and-substance]]
test("a warning lets the write land, and an error refuses it", () => {
  const warned = { rule: "VoiceParagraph.Sentence", line: 1, severity: "warning" };
  const erred = { rule: "VoiceParagraph.Vocabulary", line: 1, severity: "error" };
  const bare = { rule: "VoiceVale.History", line: 1 };
  assert.deepEqual(errorsIn([warned]), [], "a warning alone refuses nothing");
  assert.deepEqual(
    errorsIn([warned, erred, bare]),
    [erred, bare],
    "an error stands, and a finding naming no side reads error",
  );
  assert.deepEqual(errorsIn(undefined), []);
});

// [[spec/design_output/level0#a-broken-rule-says-so]]
test("a lint that ran nowhere refuses a prose write and names the fault, and a write outside prose lands", async () => {
  const broken = {
    ...box(),
    vale: {
      stands: () => true,
      lint: async () => ({ ran: false, why: "E201 Invalid rule", found: [] }),
    },
  };
  const said = await onWrite(
    write(join(WORK, "spec", "notes.md"), "# Notes\n"),
    broken,
  );
  assert.match(String(said?.result?.deny ?? ""), /E201 Invalid rule/);
  assert.equal(
    broken.log.lines().some((one) => one.level === "warn" && one.kind === "vale"),
    true,
    "the log carries the fault at warn",
  );

  const rule = await onWrite(write(join(WORK, "spec", "rule.yml"), "a: b\n"), broken);
  assert.equal(rule?.result?.deny, undefined, "the hand mending a rule file writes it");
});

// [[spec/design_output/level0#a-broken-rule-says-so]]
test("a box with no vale lets the write land, and says so in the log once", async () => {
  const bare = box();
  await onWrite(write(join(WORK, "spec", "one.md"), "# One\n"), bare);
  await onWrite(write(join(WORK, "spec", "two.md"), "# Two\n"), bare);
  assert.equal(
    bare.log.lines().filter((one) => one.kind === "vale" && one.level === "warn")
      .length,
    1,
  );
});

// A field the engine owns comes back to its value on the disk, and the prose beside it lands. [[spec/design_output/schema#the-verbs-own-their-fields]]
test("a Write carrying state and a prose field lands the prose, puts state back, and names it", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const it = box({ [at]: GOOD });
  marksSeen(it, relativeTo(it.root, at), GOOD);
  const wrote = GOOD.replace("state: open", "state: closed").replace(
    "## change\n",
    "## change\n\nThe door puts the field back.\n",
  );

  const said = await onWrite(write(at, wrote), it);

  assert.equal(said?.result?.deny, undefined, "the write lands");
  assert.match(said.event.content, /^state: open$/m, "state stands at its disk value");
  assert.match(said.event.content, /The door puts the field back\./, "the prose lands");
  assert.match(said.after.context.join("\n"), /state/, "the answer names the field");
});

// [[spec/design_output/schema#the-verbs-own-their-fields]]
test("an Edit over state, a route line and a prose field lands the prose and puts the rest back", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const it = box({ [at]: GOOD });
  marksSeen(it, relativeTo(it.root, at), GOOD);
  const old_string = GOOD.slice(
    GOOD.indexOf("state: open"),
    GOOD.indexOf("## change\n") + "## change\n".length,
  );
  const new_string = old_string
    .replace("state: open", "state: closed")
    .replace("makes the change the ask names", "makes it")
    .replace("## change\n", "## change\n\nThe door puts the route back.\n");

  const said = await onWrite(
    { tool: "Edit", file_path: at, old_string, new_string },
    it,
  );

  assert.equal(said?.result?.deny, undefined, "the edit lands");
  assert.equal(
    said.event.new_string,
    old_string.replace("## change\n", "## change\n\nThe door puts the route back.\n"),
    "state and the route stand as the disk holds them, and the prose lands",
  );
  assert.match(said.after.context.join("\n"), /state/);
  assert.match(said.after.context.join("\n"), /steps/);
});

// [[spec/design_output/schema#the-verbs-own-their-fields]]
test("an Edit changing engine fields alone comes back refused, naming them, because nothing of it lands", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const it = box({ [at]: GOOD });
  marksSeen(it, relativeTo(it.root, at), GOOD);

  const said = await onWrite(
    {
      tool: "Edit",
      file_path: at,
      old_string: "state: open",
      new_string: "state: closed",
    },
    it,
  );

  assert.match(said?.result?.deny ?? "", /state/);
});

// [[spec/design_output/level0#a-write-meets-its-mark]]
test("a mark written on one box reads on a fresh box over the same disk", async () => {
  const at = join(TREE, "notes.txt");
  const disk = realDisk({ [at]: NUMBERED });
  await called(served(disk), reads(at));

  const said = await called(served(disk), edits(at, "line 3\n", "three\n"));

  assert.equal(refused(said), "", "the restarted box reads the mark off the disk");
});

// [[spec/design_output/level0#a-write-meets-its-mark]]
test("a Read of lines 10 to 20 lets an Edit inside them land, and refuses one at line 30", async () => {
  const at = join(TREE, "notes.txt");
  const it = served(realDisk({ [at]: NUMBERED }));
  await called(it, reads(at, { offset: 10, limit: 11 }));

  const outside = await called(it, edits(at, "line 30\n", "thirty\n"));
  assert.match(refused(outside), /moved on the disk after you read it/);

  const inside = await called(it, edits(at, "line 15\n", "fifteen\n"));
  assert.equal(refused(inside), "", "an edit inside the span lands");
});

// [[spec/design_output/level0#a-write-meets-its-mark]]
test("a read handing back the text the mark holds writes the marks file once", async () => {
  const at = join(TREE, "notes.txt");
  const kept = norm(join(TREE, MARKS));
  const disk = realDisk({ [at]: NUMBERED });
  const it = served(disk);
  await called(it, reads(at));
  const first = disk.times.get(kept);
  assert.ok(first, "the first read writes the marks file");
  assert.deepEqual(Object.keys(JSON.parse(disk.read(kept))), ["notes.txt"]);

  await called(it, reads(at));
  assert.equal(
    disk.times.get(kept),
    first,
    "a second read of the same text writes nothing",
  );
});
