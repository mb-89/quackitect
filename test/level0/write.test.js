// The write door over two fake roots. The path reads relative to the work
// root, and the schema comes off the method root, so a stub's bad ticket
// meets the vehicle's rules.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { onWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { TICKET_SCHEMA as SCHEMA } from "./fixtures.js";
import { edits, NUMBERED, realDisk, refused, served, TREE, wrote } from "./mark-doors.js";

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

// No door reads a mark, so a write over a file the hand has read none of meets the rules alone. [[spec/tickets/every-road-has-a-caller]]
test("a write over a standing file lands whether or not the hand read it", async () => {
  const at = join(WORK, "spec", "tickets", "good.md");
  assert.deepEqual(await onWrite(write(at, GOOD), box({ [at]: GOOD })), { pass: true });

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
  const it = box({ [at]: GOOD });
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
