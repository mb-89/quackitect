// The write door over a pair of fake roots. The path reads relative to the work
// root, and the schema comes off the method root, so a stub's bad ticket
// meets the vehicle's rules.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { onWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { conflicted, TICKET_SCHEMA as SCHEMA } from "./fixtures.js";
import {
  edits,
  NUMBERED,
  realDisk,
  refused,
  served,
  TREE,
  wrote,
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

// A draft takes a hand's write, where an open ticket takes its answers through the pull. [[spec/design_output/pull#the-fields-ride-the-payload]]
const DRAFT = GOOD.replace("state: open", "state: draft");

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

// No door reads a mark, so a write over a file the hand has read none of meets the rules alone. [[spec/tickets/every-road-has-a-caller]]
test("a write over a standing file lands whether or not the hand read it", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  assert.deepEqual(await onWrite(write(at, DRAFT), box({ [at]: DRAFT })), {
    pass: true,
  });

  const numbered = join(TREE, "notes.txt");
  const it = served(realDisk({ [numbered]: NUMBERED }));
  const said = await wrote(it, edits(numbered, "line 30\n", "thirty\n"));
  assert.equal(refused(said), "", "an edit nobody read lands");
});

test("the same bad ticket written into the vehicle's own tree is refused the same way", async () => {
  const said = await onWrite(write(join(METHOD, "spec", "tickets", "bad.md"), BAD), {
    ...box(),
    work: METHOD,
    root: METHOD,
  });
  assert.match(said?.result?.deny ?? "", /steps/);
});

// A break of form lands at any level, and the note names it; a private name still refuses. [[spec/design_output/level0#the-panel-holds-a-warning]]
test("a prose finding at error lands with the warning note, and a private name comes back refused", async () => {
  const at = join(WORK, "spec", "tickets", "warned.md");
  const finding = (rule) => ({
    file: "spec/tickets/warned.md",
    rule,
    line: 5,
    column: 1,
    message: "Say it another way.",
    severity: "error",
  });
  const it = box();
  let found = [finding("VoiceParagraph.Vocabulary")];
  it.vale = { stands: () => true, lint: async () => ({ ran: true, found }) };

  const said = await onWrite(write(at, GOOD), it);
  assert.equal(said?.result?.deny, undefined, "the write lands");
  assert.match(said?.after?.context?.[0] ?? "", /VoiceParagraph\.Vocabulary/);
  assert.match(said.after.context[0], /the write lands/);
  assert.equal(
    it.log.lines().some((one) => one.level === "warn" && one.kind === "vale"),
    true,
    "the log carries the warning",
  );

  found = [finding("VoiceVale.Private")];
  const home = await onWrite(write(at, GOOD), it);
  assert.match(home?.result?.deny ?? "", /VoiceVale\.Private/);
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
  const it = box({ [at]: DRAFT });
  const wrote = DRAFT.replace("state: draft", "state: closed").replace(
    "## change\n",
    "## change\n\nThe door puts the field back.\n",
  );

  const said = await onWrite(write(at, wrote), it);

  assert.equal(said?.result?.deny, undefined, "the write lands");
  assert.match(said.event.content, /^state: draft$/m, "state stands at its disk value");
  assert.match(said.event.content, /The door puts the field back\./, "the prose lands");
  assert.match(said.after.context.join("\n"), /state/, "the answer names the field");
});

// [[spec/design_output/schema#the-verbs-own-their-fields]]
test("an Edit over state, a route line and a prose field lands the prose and puts the rest back", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const it = box({ [at]: DRAFT });
  const old_string = DRAFT.slice(
    DRAFT.indexOf("state: draft"),
    DRAFT.indexOf("## change\n") + "## change\n".length,
  );
  const new_string = old_string
    .replace("state: draft", "state: closed")
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
  const it = box({ [at]: DRAFT });

  const said = await onWrite(
    {
      tool: "Edit",
      file_path: at,
      old_string: "state: draft",
      new_string: "state: closed",
    },
    it,
  );

  assert.match(said?.result?.deny ?? "", /state/);
});

// An open ticket takes its answers through the pull, and its Discussion from anybody. [[spec/design_output/pull#the-fields-ride-the-payload]]
test("the door refuses an agent write to an open ticket, and a draft takes one", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const byHand = (text) =>
    text.replace("## change\n", "## change\n\nWritten by hand.\n");

  const open = await onWrite(write(at, byHand(GOOD)), box({ [at]: GOOD }));
  assert.match(open?.result?.deny ?? "", /--fields/, "the refusal names the payload");

  const draft = await onWrite(write(at, byHand(DRAFT)), box({ [at]: DRAFT }));
  assert.equal(draft?.result?.deny, undefined, "a draft takes the write");

  const talk = GOOD.replace(
    "# Discussion\n",
    "# Discussion\n\n- A line anybody adds.\n",
  );
  const said = await onWrite(write(at, talk), box({ [at]: GOOD }));
  assert.equal(said?.result?.deny, undefined, "the Discussion takes a line");
});

// The door reads a closed ticket as history, the way the check reads it. [[spec/tickets/a-closed-ticket-takes-writes]]
test("a Discussion line on a closed ticket carrying when returned lands, and the same line on an open one comes back refused", async () => {
  const returned = GOOD.replace(
    "    to: retro\n",
    "    to: retro\n    when: returned\n",
  );
  const at = join(WORK, "spec", "tickets", "old.md");
  const line = () => ({
    tool: "Edit",
    file_path: at,
    old_string: "# Discussion\n",
    new_string: "# Discussion\n\n- A line of history.\n",
  });

  const closed = returned.replace("state: open", "state: closed");
  const landed = await onWrite(line(), box({ [at]: closed }));
  assert.equal(landed?.result?.deny, undefined, "the closed ticket takes the line");

  const refused_ = await onWrite(line(), box({ [at]: returned }));
  assert.match(
    refused_?.result?.deny ?? "",
    /returned/,
    "the open ticket meets the schema",
  );
});

// A governed folder holds its own kind alone, so a page or a picture written there comes back refused. [[spec/tickets/each-folder-holds-its-kind]]
test("a screenshot written under spec/tickets comes back refused, naming the ticket kind", async () => {
  const said = await onWrite(
    write(join(WORK, "spec", "tickets", "screen.png"), "not a note"),
    box(),
  );
  assert.match(said?.result?.deny ?? "", /spec\/tickets\/screen\.png/);
  assert.match(said.result.deny, /ticket/);
});

// A merge leaves a ticket unmerged with its markers in, and the verbs write no ticket that reads as none, so the door opens it to a hand until the merge commits. [[spec/design_output/pull#a-merge-opens-the-ticket]]
test("an unmerged ticket takes a hand's whole write, and the same write outside a merge comes back refused", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const marked = GOOD.replace(
    "state: open\n",
    `state: open\n${conflicted(["record: []"], ["cloud: true"]).join("\n")}\n`,
  );
  const resolved = GOOD.replace("## change\n", "## change\n\nWritten by hand.\n");
  const merging = (listed) => {
    const it = box({ [at]: marked });
    it.proc = fakeProc({
      "git ls-files -u -- spec/tickets/good.md": { stdout: listed },
    });
    return it;
  };

  const inMerge = await onWrite(
    write(at, resolved),
    merging("100644 abc123 2\tspec/tickets/good.md\n"),
  );
  assert.equal(inMerge?.result?.deny, undefined, "the unmerged ticket takes the write");

  const outside = await onWrite(write(at, resolved), {
    ...merging(""),
    disk: fakeDisk({
      [join(METHOD, "spec", "schemas", "ticket.schema.yaml")]: SCHEMA,
      [at]: GOOD,
    }),
  });
  assert.match(
    outside?.result?.deny ?? "",
    /--fields/,
    "outside a merge the door holds",
  );
});

test("a write to an unmerged ticket still carrying a marker comes back refused, naming the lines", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  const marked = GOOD.replace(
    "state: open\n",
    `state: open\n${conflicted(["record: []"], ["cloud: true"]).join("\n")}\n`,
  );
  const it = box({ [at]: marked });
  it.proc = fakeProc({
    "git ls-files -u -- spec/tickets/good.md": {
      stdout: "100644 abc123 2\tspec/tickets/good.md\n",
    },
  });

  const said = await onWrite(write(at, marked), it);

  assert.match(
    said?.result?.deny ?? "",
    /still carries conflict markers, at line\(s\) 4, 6, 8/,
  );
});
