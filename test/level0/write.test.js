// The write door over two fake roots. The path reads relative to the work
// root, and the schema comes off the method root, so a stub's bad ticket
// meets the vehicle's rules.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { relativeTo } from "../../.claude/skills/level0/lib/paths.js";
import { errorsIn, marksSeen, onWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { TICKET_SCHEMA as SCHEMA } from "./fixtures.js";

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

// A warning lets the write land, puts the rows on the refactoring hand's list, and tells the agent to carry on. [[spec/design_output/level0#a-warning-feeds-the-list]]
test("a write at warning lands, feeds the refactor list, and the note after it says carry on", async () => {
  const at = join(WORK, "spec", "tickets", "warned.md");
  const warning = (rule) => ({
    file: "spec/tickets/warned.md",
    rule,
    line: 5,
    column: 1,
    message: "Cut this one in two.",
    severity: "warning",
  });
  const it = box({ [join(WORK, ".se", ".runtime", "refactor.json")]: "[]\n" });
  let found = [warning("VoiceVale.Passive")];
  it.vale = { stands: () => true, lint: async () => ({ ran: true, found }) };

  const said = await onWrite(write(at, GOOD), it);
  assert.equal(said?.result?.deny, undefined, "the write lands");
  assert.match(
    said?.after?.context?.[0] ?? "",
    /stand at warning, and the write lands/,
  );
  assert.match(said.after.context[0], /carry on/);
  const list = JSON.parse(it.disk.read(join(WORK, ".se", ".runtime", "refactor.json")));
  assert.deepEqual(
    list.map((one) => `${one.file} ${one.rule}`),
    ["spec/tickets/warned.md VoiceVale.Passive"],
  );

  found = [];
  const clean = await onWrite(write(at, GOOD), it);
  assert.deepEqual(clean, { pass: true });
  assert.deepEqual(
    JSON.parse(it.disk.read(join(WORK, ".se", ".runtime", "refactor.json"))),
    [],
    "a clean write takes the file's rows off the list",
  );
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

// A rule of form reads warning, and the write lands with it standing for the refactoring hand. [[spec/rationales/voice#11-form-and-substance]]
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
