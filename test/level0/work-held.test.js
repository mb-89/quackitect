// A take naming a branch, on a box that holds another: the name wins, or the take refuses.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#the-take-writes-the-record]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { withEntry, withField } from "../../src/engine/group.js";
import { work } from "../../src/scripts/work.js";
import {
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  on,
  ranGit,
  remoteSaying,
  ROOT,
  SHA,
} from "./work-doors.js";

// [[spec/design_output/work#the-take-writes-the-record]]
test("a take on a box holding its branch hands the ask again, and claims nothing new", () => {
  const held = withEntry(
    GROUP_NOTE,
    {
      step: "sync",
      hand: "box d462e994b4cef",
      hash_before: SHA,
    },
    fakeFront(),
  );
  for (const argv of [["take"], ["take", "one-group"]]) {
    const { it, outside } = doorsSaying(groupRemote(held), {
      [on("one-group")]: held,
      ...HAND,
    });

    const { code, said } = heard(() =>
      work(ROOT, argv, { ...it, agent: true, cloud: true }),
    );

    assert.equal(code, 0, said);
    assert.match(said, /You already hold work\/one-group/);
    assert.match(said, /Two tickets that land as one/, "the ask comes again");
    assert.ok(
      !ranGit(outside).some(
        (one) => one.startsWith("git switch") || one.startsWith("git commit"),
      ),
      "the box stays where it stands and writes no second claim",
    );
  }
});

// A box holding work/old-group, and a take naming work/one-group. [[spec/tickets/take-honours-the-name]]
const OLD_AT = "spec/tickets/old-group.md";
const NOW = "2026-01-01T03:00:00.000Z";
const HELD_OLD = withEntry(
  GROUP_NOTE.replace("Two tickets that land as one.", "The old work."),
  { step: "sync", hand: "box d462e994b4cef", hash_before: SHA },
  fakeFront(),
);
const takingPast = (old, ref) => {
  const { it, outside } = doorsSaying(
    {
      ...groupRemote(),
      ...remoteSaying(
        [
          { branch: "work/old-group", tip: "bbb", ...ref },
          { branch: "work/one-group", tip: "aaa" },
        ],
        {
          [`work/old-group:${OLD_AT}`]: old,
          [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
        },
      ),
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/old-group\n" },
    },
    { [on("old-group")]: old, [on("one-group")]: GROUP_NOTE, ...HAND },
  );
  const said = heard(() =>
    work(ROOT, ["take", "one-group"], {
      ...it,
      agent: true,
      cloud: true,
      clock: fakeClock(NOW),
    }),
  );
  return { ...said, ran: ranGit(outside) };
};
const SECONDS_NOW = Math.floor(new Date(NOW).getTime() / 1000);

// [[spec/design_output/work#the-take-writes-the-record]]
test("a named take drops a hold standing done, merged or stale, and lands on the name", () => {
  const closed = withField(HELD_OLD, "state", "closed", fakeFront());
  for (const [old, ref] of [
    [closed, { when: SECONDS_NOW - 60 }],
    [HELD_OLD, { when: SECONDS_NOW - 60, merged: true }],
    [HELD_OLD, { when: 1 }],
  ]) {
    const { code, said, ran } = takingPast(old, ref);
    assert.equal(code, 0, said);
    assert.ok(ran.includes("git switch work/one-group"), said);
    assert.doesNotMatch(said, /The old work/, "no brief for the held branch");
    assert.doesNotMatch(said, /You already hold/);
  }
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("a named take refuses while the held branch stands in work, and names both", () => {
  const { code, said, ran } = takingPast(HELD_OLD, { when: SECONDS_NOW - 60 });
  assert.equal(code, 1, said);
  assert.match(said, /work\/old-group/);
  assert.match(said, /work\/one-group/);
  assert.match(said, /\.\/RUNME\.sh branch release/);
  assert.doesNotMatch(said, /The old work/, "no brief for the held branch");
  assert.ok(!ran.some((one) => one.startsWith("git switch")));
});
