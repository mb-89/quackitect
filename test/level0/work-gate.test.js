// A group waiting on a question the owner closes on trunk stands at todo, and
// the take walks past it to the next free group, so one gate holds no other
// work up.
// [[spec/design_output/work#the-owner-opens-the-gate]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { heldIn, withField } from "../../src/engine/group.js";
import { work } from "../../src/scripts/work.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  HAND,
  heard,
  on,
  ROOT,
  ranGit,
  remoteSaying,
  SHA,
} from "./work-doors.js";

const GATE = "the-owner-flips";
const gated = (text) => text.replace(/^(kind: .*\n)/m, `$1depends_on: [${GATE}]\n`);
const QUESTION = (state) => `---
kind: [[ticket]]
state: ${state}
steps:
  - name: answer
    by: person
---

# Ask

Does the slice switch over?

# answer

# Discussion

Nothing yet.
`;

// Two free groups: the first waits on the gate, and the second holds a child a hand takes. [[spec/design_output/work#the-owner-opens-the-gate]]
function twoGroups(gate) {
  const first = gated(withField(GROUP_NOTE, "step", "children"));
  const second = withField(GROUP_NOTE, "step", "children");
  const answers = {
    ...remoteSaying(
      [
        { branch: "work/a-gated", tip: "aaa" },
        { branch: "work/b-free", tip: "bbb" },
      ],
      {
        "work/a-gated:spec/tickets/a-gated.md": first,
        "work/b-free:spec/tickets/b-free.md": second,
      },
    ),
    "git show origin/work/b-free:spec/tickets/b-free.md": { stdout: second },
    [`git show origin/main:spec/tickets/${GATE}.md`]: { stdout: QUESTION(gate) },
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    "git rev-parse HEAD": { stdout: `${SHA}\n` },
    "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    "git fetch --prune origin": { stdout: "" },
  };
  const files = {
    [on("a-gated")]: first,
    [on("a-child")]: gated(CHILD("a-gated", "open")),
    [on("b-free")]: second,
    [on("b-child")]: CHILD("b-free", "open"),
    ...HAND,
  };
  const { it, outside, disk } = doorsSaying(answers, files);
  const said = heard(() => work(ROOT, ["take"], { ...it, agent: true, cloud: true }));
  return { ...said, outside, disk };
}

test("a take walks past a group whose gate stands open on trunk, and claims the next free one", () => {
  const { code, said, outside, disk } = twoGroups("open");
  assert.equal(code, 0, said);
  assert.match(said, /work\/a-gated stays at todo/);
  assert.match(said, new RegExp(`a-child waits for ${GATE} to close`));
  assert.ok(
    !ranGit(outside).includes("git push origin work/a-gated"),
    "the gated group takes no claim",
  );
  assert.ok(
    ranGit(outside).includes("git push origin work/b-free"),
    "the next free group takes the claim",
  );
  assert.equal(heldIn(disk.read(on("b-free"))).hand, "box d462e994b4cef");
});

test("a gate the owner closes on trunk frees its group for the take", () => {
  const { code, said, outside } = twoGroups("closed");
  assert.equal(code, 0, said);
  assert.ok(
    ranGit(outside).includes("git push origin work/a-gated"),
    "the first group takes the claim once its gate stands closed",
  );
  assert.ok(!ranGit(outside).includes("git push origin work/b-free"));
});
