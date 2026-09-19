// The escalation verb, driven through fake doors: the step it inserts, the
// choice its options write, and the roads it comes back refused on.
// [[spec/design_output/pull#a-person-step-goes-in]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf } from "../../src/scripts/group.js";
import { withPersonStep } from "../../src/scripts/pull.js";
import { pulling, work } from "../../src/scripts/work.js";
import {
  at,
  BRANCH,
  CHILD,
  doors,
  HOLD,
  heard,
  ROOT,
  ranGit,
  standing,
} from "./pull-doors.js";

// A desk hands the question to a person, and a cloud box answers it itself. [[spec/guidance/cloud]]
test("branch escalate inserts a person step before the held leaf, drops the hold and pushes", () => {
  const { it, disk, outside } = doors(standing(), {}, { cloud: false });
  heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(JSON.parse(disk.read(HOLD)).step, "design/draft");

  const { code, said } = heard(() =>
    work(ROOT, ["escalate", "which road does the owner want"], it),
  );

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/person-1");
  assert.match(
    now,
    /- name: person-1\n\s+does: answers the question the engine asks\n\s+by: person\n\s+to: engine\n\s+asks: which road does the owner want/,
  );
  const hold = disk.exists(HOLD) ? JSON.parse(disk.read(HOLD)) : null;
  assert.notEqual(hold?.step, "design/draft", "the hold on the escalated leaf drops");
  assert.ok(
    ranGit(outside).some((one) => one.startsWith("git commit")),
    "one commit names the ticket and the step",
  );
  assert.ok(ranGit(outside).includes(`git push origin ${BRANCH}`), "and it pushes");
});

test("branch escalate with options writes a choice answer carrying the words", () => {
  const { it, disk } = doors(standing());
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() =>
    work(ROOT, ["escalate", "which road", "--options", "left,right"], it),
  );

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.match(now, /form: choice/, "the answer takes the choice form");
  assert.match(now, /left/);
  assert.match(now, /right/);
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("branch escalate under --as reads that hand's hold, and keeps the name out of the question", () => {
  const { it, disk } = doors(standing());
  heard(() => pulling(ROOT, ["pull", "--as", "helper-2"], it));

  const { code, said } = heard(() =>
    work(ROOT, ["escalate", "which road", "--as", "helper-2"], it),
  );

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/person-1");
  assert.match(now, /asks: which road$/m, "the hand's name stays out of the question");
});

test("branch escalate with no question refuses, and says what it takes", () => {
  const { it } = doors(standing());
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["escalate"], it));

  assert.equal(code, 2);
  assert.match(said, /^refused/m);
  assert.match(said, /takes the question a person answers/);
});

test("branch escalate with no hold standing refuses, and names the pull", () => {
  const { it } = doors(standing());

  const { code, said } = heard(() => work(ROOT, ["escalate", "which road"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/m);
  assert.match(said, /ticket pull/);
});

test("a ticket at the split cap refuses another person step, and asks for a split", () => {
  const { it } = doors(standing());
  const rooted = { ...it, root: ROOT, splits: 1 };
  const one = { name: "a-child", text: CHILD("open", "design/review") };

  assert.equal(
    withPersonStep(rooted, one, "design/draft", "first").path,
    "design/person-1",
  );
  const { said } = heard(() =>
    assert.equal(withPersonStep(rooted, one, "design/draft", "second").path, ""),
  );
  assert.match(said, /carries 1 person steps already, so split it/);
});
