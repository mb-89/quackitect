// A fail sends the ticket back once, and a second fail sends it to the owner
// through a person step in the fail commit. The doors these cases drive stand
// in pull-doors.js beside this file.
// [[spec/tickets/one-review-a-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { fieldOf, withEntry } from "../../src/engine/group.js";
import { withPersonStep } from "../../src/scripts/pull.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  CHILD,
  deskDoors,
  doors,
  filled,
  HOLD,
  heard,
  ROOT,
  standing,
} from "./pull-doors.js";

// The ticket failed back from design/review once already. [[spec/design_output/pull#the-fail]]
const failedOnce = () =>
  withEntry(CHILD("open", "design/review"), {
    step: "design/review",
    hand: "box other",
    hash_before: "aaaa",
    hash_after: "aaaa",
    returns: 1,
    why: "thin",
  });

// A review failing, the ticket standing at design/review. Git keeps each commit of the hand-back with the ticket as it stood then. [[spec/design_output/pull#the-fail]]
function failedTwice(more, text = null) {
  const commits = [];
  let disk = null;
  const git = (argv) => {
    if (argv[1] === "commit")
      commits.push({
        subject: argv[3],
        text: disk.read(at("spec/tickets/a-child.md")),
      });
    return { exitCode: 0 };
  };
  // A desk works on trunk alone. [[spec/design_output/work#a-desk-works-on-trunk]]
  const made = (more.cloud ? doors : deskDoors)(
    standing(text ?? filled(failedOnce(), "### verdict", "fail\n- still thin")),
    { git },
    { fails: 2, ...more },
  );
  disk = made.disk;
  heard(() => pulling(ROOT, ["pull"], made.it));
  commits.length = 0;
  const back = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  return { ...made, back, commits, now: disk.read(at("spec/tickets/a-child.md")) };
}

const designSteps = (text) =>
  readNote(text).front.said.steps[0].steps.map((one) => String(one.name));

test("a first fail sends design/review back to design/draft, with no person step", () => {
  const first = filled(CHILD("open", "design/review"), "### verdict", "fail\n- thin");
  const { back, now } = failedTwice({ cloud: false }, first);

  assert.equal(back.code, 0, back.said);
  assert.equal(fieldOf(now, "step"), "design/draft");
  assert.deepEqual(designSteps(now), ["draft", "review"], "the route gains no step");
});

test("a second fail on a desk puts a person step before design/draft, asking the reason, in the fail commit", () => {
  const { back, now, commits } = failedTwice({ cloud: false });

  assert.equal(back.code, 0, back.said);
  assert.equal(fieldOf(now, "step"), "design/person-1", "the ticket goes to the owner");
  assert.deepEqual(designSteps(now), ["person-1", "draft", "review"]);
  const person = readNote(now).front.said.steps[0].steps[0];
  assert.equal(person.by, "person", "a desk sends it to a person");
  assert.match(String(person.asks), /still thin/, "the step asks the fail's reason");
  // The hand-out after the fail commits for the next ticket, so the case reads this ticket's commits alone. [[spec/design_output/pull#the-fail]]
  const own = commits.filter((one) => one.subject.startsWith("a-child:"));
  assert.equal(own.length, 1, "one commit lands the fail");
  assert.match(own[0].subject, /^a-child: fails design\/review back to design\/draft/);
  assert.match(
    own[0].text,
    /- name: person-1\n/,
    "the person step rides the fail commit",
  );
});

// A cloud box answers its own questions, so the step it inserts waits for nobody. [[spec/guidance/cloud]]
test("a second fail on a cloud box puts in a person step any hand answers", () => {
  const { back, now } = failedTwice({ cloud: true });

  assert.equal(back.code, 0, back.said);
  assert.equal(fieldOf(now, "step"), "design/person-1");
  const person = readNote(now).front.said.steps[0].steps[0];
  assert.equal(person.name, "person-1");
  assert.equal(person.by, "anyone", "a cloud box answers it itself");
});

// Past the split cap the person step stays out, and the wait road stands. [[spec/design_output/pull#the-fail]]
test("a second fail past the split cap asks for a split, drops the hold, answers wait, and writes no step", () => {
  const held = {
    name: "a-child",
    text: filled(failedOnce(), "### verdict", "fail\n- still thin"),
  };
  const { it } = doors(standing(), {}, { cloud: false });
  heard(() =>
    withPersonStep({ ...it, root: ROOT }, held, "design/draft", "an earlier question"),
  );
  const carrying = held.text.replace(
    /^step: design\/person-1$/m,
    "step: design/review",
  );

  const { back, now, disk } = failedTwice({ cloud: false, splits: 1 }, carrying);

  assert.equal(back.code, 0, back.said);
  assert.equal(fieldOf(now, "step"), "design/draft");
  assert.deepEqual(
    designSteps(now),
    ["person-1", "draft", "review"],
    "no second person step",
  );
  assert.match(
    back.said,
    /carries 1 person steps already, so split it/,
    "the answer asks for a split",
  );
  assert.match(back.said, /^wait/m);
  assert.match(back.said, /fails design\/review back to design\/draft/);
  assert.match(back.said, /The hold drops here/);
  assert.equal(disk.exists(HOLD), false, "the hold drops");
});

// The refusal cap reaches the fail, so it takes the fail's road to the owner. [[spec/design_output/pull#the-hand-back-refused]]
test("a hand-back meeting the refusal cap at the fail cap puts a person step before the leaf, asking the finding", () => {
  const { it, disk } = deskDoors(standing(), {}, { refusals: 1, fails: 1 });
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/person-1");
  assert.deepEqual(designSteps(now), ["person-1", "draft", "review"]);
  const person = readNote(now).front.said.steps[0].steps[0];
  assert.equal(person.by, "person");
  assert.match(String(person.asks), /the hand-back met refused 1 times/);
});
