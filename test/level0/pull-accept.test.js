// The final acceptance: a gate carrying final, driven through the pull over
// the fake doors in pull-doors.js. It waits on the work under it, reruns over
// the diff since its last verdict, and closes onto a question past its cap.
// [[spec/tickets/the-last-gate-accepts]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf, frontOf } from "../../src/engine/group.js";
import { workAnswer } from "../../src/scripts/pull-chapter.js";
import { rejected } from "../../src/scripts/pull-gate.js";
import { takeable } from "../../src/scripts/pull-hand.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import { holdsHere } from "../../src/scripts/pull-when.js";
import { entriesOf } from "../../src/scripts/pull-writes.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  BRANCH,
  doors,
  filled,
  HAND,
  heard,
  ranGit,
  ROOT,
  SHA,
  standing,
} from "./pull-doors.js";

const LAST = "c".repeat(40);

// A ticket standing at its final acceptance, the work done before it. [[spec/tickets/the-last-gate-accepts]]
const FINAL = (record = "") => `---
kind: [[ticket]]
state: open
urgency: now
step: accept
steps:
  - name: implement
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree lints
  - name: accept
    gate: the work answers the ask
    final: true
    input: [implement/change]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
group: one-group
${record}---

# Ask

One piece of it.

# implement

## change

### lint

./RUNME.sh lint

# accept

## verdict

# Discussion
`;

// A route whose red pass ran before its final gate, the verdict written. [[spec/tickets/accept-reads-red-as-green]]
const REDDENED = filled(
  FINAL()
    .replace(
      "  - name: accept\n",
      "  - name: tests-red\n    does: writes the failing cases\n    evidence:\n      - name: tests\n        form: command\n        expects: assertion\n        says: the cases fail\n  - name: accept\n",
    )
    .replace(
      "# accept\n",
      "# tests-red\n\n## tests\n\n./RUNME.sh test test/one.test.js\n\n# accept\n",
    ),
  "## verdict",
  "accept",
);
const RED_RUN = "sh -c ./RUNME.sh test test/one.test.js";

// A fix ticket the acceptance minted, standing open under it. [[spec/tickets/the-last-gate-accepts]]
const FIX = `---
kind: [[ticket]]
state: open
urgency: now
step: do
steps:
  - name: do
    does: makes the change
    evidence:
      - name: says
        form: text
        says: what changes
parent: a-child
group: one-group
---

# Ask

The fix.

# do

## says

# Discussion
`;

// The route a point's fix ticket takes. [[spec/tickets/the-last-gate-accepts]]
const TRIVIAL = `for: a fix small enough that the ask is the design
steps:
  - name: do
    does: makes the change
    by: anyone
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes
`;

// The question route the cap mints onto, one person step. [[spec/tickets/the-last-gate-accepts]]
const QUESTION = `for: a question only a person answers
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    evidence:
      - name: answer
        form: text
        says: the answer
`;

// A verdict short of accept, recorded at the acceptance. [[spec/tickets/the-last-gate-accepts]]
const SHORT = (returns) => `  - step: accept
    hand: box other
    hash_before: ${"a".repeat(40)}
    hash_after: ${LAST}
    returns: ${returns}
    why: the work misses a line
`;

// [[spec/tickets/the-last-gate-accepts]]
test("a final acceptance waits while a fix ticket under it stands open", () => {
  const { it } = doors(
    standing(FINAL(), undefined, { [at("spec/tickets/fix-it.md")]: FIX }),
  );
  const took = heard(() => pulling(ROOT, ["pull", "a-child"], it));

  assert.doesNotMatch(
    took.said,
    /^work\s+a-child at accept/m,
    "the gate waits on its fix ticket",
  );
});

// [[spec/tickets/the-last-gate-accepts]]
test("a rerun names the diff since its last verdict, and runs every command", () => {
  const made = doors(standing(FINAL(`record:\n${SHORT(1)}`)));
  const took = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  assert.match(
    took.said,
    new RegExp(LAST),
    "the hand-out names the diff since the last verdict",
  );

  made.disk.write(
    at("spec/tickets/a-child.md"),
    filled(made.disk.read(at("spec/tickets/a-child.md")), "## verdict", "accept"),
  );
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  assert.ok(
    ranGit(made.outside).some((one) => one.includes("./RUNME.sh lint")),
    "the hand-back runs every command field of the leaves before the gate",
  );
});

// A group's second round meets the command its last retro wrote, which drains only at the retro past the gate. [[spec/design_output/pull#the-final-acceptance]]
test("a final gate leaves the command of a leaf past it to that leaf", () => {
  const made = doors(
    standing(
      filled(
        FINAL()
          .replace(
            "group: one-group\n",
            "  - name: retro\n    steps:\n      - name: notes\n        does: decides every note\n        evidence:\n          - name: drained\n            form: command\n            expects: 0\n            says: the notes drain\ngroup: one-group\n",
          )
          .replace(
            "# Discussion\n",
            "# retro\n\n## notes\n\n### drained\n\n./RUNME.sh retro notes\n\n# Discussion\n",
          ),
        "## verdict",
        "accept",
      ),
    ),
    {
      "sh -c ./RUNME.sh retro notes": { stdout: "1 note(s) stand open\n", exitCode: 1 },
    },
  );
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  const back = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  assert.doesNotMatch(back.said, /refused/, "the gate takes the verdict");
  const ran = ranGit(made.outside);
  assert.ok(
    ran.some((one) => one.includes("./RUNME.sh lint")),
    "the leaf before the gate runs",
  );
  assert.ok(
    !ran.some((one) => one.includes("retro notes")),
    "the leaf past the gate waits",
  );
});

// [[spec/tickets/accept-reads-red-as-green]]
test("a final gate passes over a red pass whose cases now run green", () => {
  const made = doors(standing(REDDENED), {
    [RED_RUN]: { stdout: "green, 2 test(s) pass in 1 file(s)\n" },
  });
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  const back = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  assert.doesNotMatch(back.said, /refused/, "the gate takes the verdict");
  const text = made.disk.read(at("spec/tickets/a-child.md"));
  assert.ok(
    entriesOf(frontOf(text)).some((one) => one.step === "accept"),
    "the record keeps the verdict",
  );
});

// [[spec/tickets/accept-reads-red-as-green]]
test("a final gate refuses a red pass whose cases still fail", () => {
  const made = doors(standing(REDDENED), {
    [RED_RUN]: { stdout: "assertion, 1 test(s) fail on their own assertion\n" },
  });
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  const back = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  assert.match(back.said, /refused/, "the gate refuses the verdict");
  assert.match(
    back.said,
    /tests under tests-red expects green/,
    "the refusal names the red field",
  );
});

// [[spec/tickets/the-last-gate-accepts]]
test("past its cap the process closes became onto a question ticket", () => {
  const record = `record:\n${SHORT(1)}${SHORT(2)}`;
  const files = standing(
    filled(FINAL(record), "## verdict", "reject\n- the work misses a line still"),
    undefined,
    { [at("spec/processes/question.yaml")]: QUESTION },
  );
  const made = doors(files, {}, { fails: 2 });
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  const text = made.disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(text, "state"), "closed", "the process closes past its cap");
  assert.match(text, /became/, "it closes became onto the question");
});

// [[spec/tickets/the-last-gate-accepts]]
test("a process inside a delivery skips its acceptance", () => {
  const { it } = doors({});
  const loose = "---\nkind: [[ticket]]\n---\n\n# Ask\n\nOne.\n";
  const held = "---\nkind: [[ticket]]\ngroup: one-group\n---\n\n# Ask\n\nOne.\n";
  assert.equal(
    holdsHere(it, "backlog", {}, loose).holds,
    true,
    "a ticket in no group meets its acceptance",
  );
  assert.equal(
    holdsHere(it, "backlog", {}, held).holds,
    false,
    "a ticket in a delivery skips it",
  );
});

// A first run finds no verdict, so its diff starts at the first take. [[spec/tickets/first-accept-names-its-base]]
test("a first run names the diff since the first take", () => {
  const take = "d".repeat(40);
  const text = FINAL(
    `record:\n  - step: implement/change\n    hand: box other\n    hash_before: ${take}\n    hash_after: ${LAST}\n`,
  );
  const { it } = doors({}, {}, { root: ROOT });
  const one = { name: "a-child", text, front: frontOf(text) };
  assert.match(
    workAnswer(it, one, leafOf(frontOf(text), "accept")),
    new RegExp(`since ${take}`),
  );
});

// [[spec/tickets/the-last-gate-accepts]]
test("a final gate stands untakeable while a fix ticket under it stands open", () => {
  const { it } = doors({});
  const one = { name: "a-child", text: FINAL() };
  assert.equal(takeable(it, one, [one, { name: "fix-it", text: FIX }]), "");
});

// [[spec/tickets/the-last-gate-accepts]]
test("accept with points at a final gate mints the fix and waits at the gate", () => {
  const files = standing(
    filled(
      FINAL(),
      "## verdict",
      "accept with points\n- cut-the-long-line: the list runs long",
    ),
    undefined,
    { [at("spec/processes/trivial.yaml")]: TRIVIAL },
  );
  const made = doors(files);
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  const text = made.disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(text, "step"), "accept", "the step stays on the gate");
  assert.equal(fieldOf(text, "state"), "open");
  assert.ok(
    entriesOf(frontOf(text)).some((one) => one.step === "accept"),
    "the record keeps the verdict",
  );
  assert.ok(
    made.disk.exists(at("spec/tickets/cut-the-long-line.md")),
    "the fix ticket stands",
  );
});

// [[spec/tickets/commit-stages-a-moved-path]]
test("a group's own acceptance mints its points into the group", () => {
  const group = FINAL().replace("group: one-group\n", "process: [[group]]\n");
  const files = standing(
    FIX.replace("state: open", "state: closed"),
    filled(
      group,
      "## verdict",
      "accept with points\n- cut-the-long-line: the list runs long",
    ),
    { [at("spec/processes/trivial.yaml")]: TRIVIAL },
  );
  const made = doors(files);
  heard(() => pulling(ROOT, ["pull", "one-group"], made.it));
  heard(() => pulling(ROOT, ["pull", "one-group"], made.it));

  const fix = made.disk.read(at("spec/tickets/cut-the-long-line.md"));
  assert.equal(fieldOf(fix, "parent"), "one-group");
  assert.equal(fieldOf(fix, "group"), "one-group", "the point stands in the group");
});

// A group's group line names its parent, and its own gate still files into it. [[spec/design_output/pull#a-finding-rides-out]]
test("a nested group's acceptance mints its points into the nested group, not its parent", () => {
  const group = FINAL().replace(
    "group: one-group\n",
    "process: [[group]]\ngroup: outer-group\n",
  );
  const files = standing(
    FIX.replace("state: open", "state: closed"),
    filled(
      group,
      "## verdict",
      "accept with points\n- cut-the-long-line: the list runs long",
    ),
    { [at("spec/processes/trivial.yaml")]: TRIVIAL },
  );
  const made = doors(files);
  heard(() => pulling(ROOT, ["pull", "one-group"], made.it));
  heard(() => pulling(ROOT, ["pull", "one-group"], made.it));

  const fix = made.disk.read(at("spec/tickets/cut-the-long-line.md"));
  assert.equal(
    fieldOf(fix, "group"),
    "one-group",
    "the point stands in the nested group",
  );
});

// [[spec/tickets/the-last-gate-accepts]]
test("the reject road closes a final gate past its cap", () => {
  const record = `record:\n${SHORT(1)}${SHORT(2)}`;
  const text = FINAL(record);
  const made = doors(
    standing(text, undefined, { [at("spec/processes/question.yaml")]: QUESTION }),
    {},
    { fails: 2 },
  );
  const one = { name: "a-child", text, front: frontOf(text), private: false };
  const who = { hand: HAND, branch: BRANCH };
  made.it.root = ROOT;
  const { said } = heard(() =>
    rejected(
      made.it,
      who,
      one,
      leafOf(frontOf(text), "accept"),
      { hash: SHA },
      "short still",
      [],
    ),
  );

  assert.match(said, /a-child closes became a-child-question/);
  assert.ok(
    made.disk.exists(at("spec/tickets/a-child-question.md")),
    "the question stands",
  );
});
