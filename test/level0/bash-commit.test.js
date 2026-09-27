// The commit half of the bash door: a change lands with its test, and a
// merge passes whole because its code met the door with tests already.
// [[spec/design_output/tree#the-rules-over-two-files]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { NAMED, named, VERB_ALONE } from "./fixtures.js";

const ROOT = "/tree";
const COMMIT = 'git commit -m "the door reads the delta"';
const CODE = [
  "diff --git a/src/bridge/one.js b/src/bridge/one.js",
  "+++ b/src/bridge/one.js",
  "@@ -0,0 +1 @@",
  "+export const one = 1;",
  "",
].join("\n");

// A call names its ticket at the head of its description, so a case wraps its command with the shared open one. [[spec/design_output/level0#a-shell-names-its-ticket]]
const call = (command) => ({ command, description: `${NAMED}: drives the door` });

// The box carries the environment, so a case sets one on it and touches nothing outside. [[spec/design_output/doors#a-door-reads-the-outside]]
function box(merging, seed = {}) {
  return {
    env: {},
    disk: fakeDisk({ ...named(ROOT), ...seed }),
    proc: fakeProc({
      "git rev-parse --abbrev-ref HEAD": { stdout: "claude/a-thing\n" },
      "git diff --cached --unified=0": { stdout: CODE },
      "git rev-parse -q --verify MERGE_HEAD": merging
        ? { stdout: "abc123\n" }
        : { stdout: "", exitCode: 1 },
    }),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");

test("a commit carrying code and no test is refused at the door", async () => {
  assert.match(denied(await onBash(call(COMMIT), box(false))), /no test beside it/);
});

// A break of form in the message refuses nothing, and a private name refuses it. A raw commit then meets the verb rule alone. [[spec/design_output/bash#git-writes-take-verbs]]
test("a message breaking a rule of form meets the verb rule alone, and one carrying a private name is refused", async () => {
  const saying = (found) => ({
    ...box(true),
    vale: { stands: () => true, lint: async () => ({ ran: true, found }) },
  });
  const finding = (rule) => [
    { rule, line: 1, column: 1, severity: "error", message: "say it plainly" },
  ];
  const landed = await onBash(
    call(COMMIT),
    saying(finding("VoiceParagraph.Vocabulary")),
  );
  assert.match(denied(landed), VERB_ALONE);
  assert.match(
    denied(await onBash(call(COMMIT), saying(finding("VoiceVale.Private")))),
    /VoiceVale\.Private/,
  );
});

test("a merge commit passes the test rule whole, and meets the verb rule alone", async () => {
  assert.match(denied(await onBash(call(COMMIT), box(true))), VERB_ALONE);
});

// A warning holds no push at this door. [[spec/design_output/config#the-engine-controls]]
test("a push off a work branch meets the verb rule alone, whatever the lint says", async () => {
  const warned = [
    {
      rule: "VoiceVale.Passive",
      line: 1,
      column: 1,
      severity: "warning",
      message: "passive",
    },
  ];
  const it = {
    ...box(false),
    vale: { stands: () => true, lint: async () => ({ ran: true, found: warned }) },
  };
  assert.match(
    denied(await onBash(call("git push origin claude/a-thing"), it)),
    VERB_ALONE,
  );
});

// The change leaf stages code alone, and the test its tests-red leaf landed rides the ticket. [[spec/design_output/tree#the-rules-over-two-files]]
test("a commit whose test a held ticket carries passes the test rule, and meets the verb rule alone", async () => {
  const seed = {
    // The call names the ticket in hand, so the name door passes it. [[spec/tickets/the-todo-joins-the-queue]]
    [`${ROOT}/.se/.runtime/hold/a-hand.json`]: JSON.stringify({
      ticket: NAMED,
      path: "spec/tickets/one.md",
    }),
    [`${ROOT}/spec/tickets/one.md`]:
      "# Ask\n\n### tests\n\n    ./RUNME.sh branch test test/level0/one.test.js\n",
  };
  assert.match(denied(await onBash(call(COMMIT), box(false, seed))), VERB_ALONE);
});
