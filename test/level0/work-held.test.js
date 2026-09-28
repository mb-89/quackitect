// A take naming a branch, on a box that holds another: the name wins, or the take refuses.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#the-take-writes-the-record]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { heldIn, recordIn, withEntry, withField } from "../../src/engine/group.js";
import { work } from "../../src/scripts/work.js";
import {
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  on,
  ROOT,
  ranGit,
  remoteSaying,
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

// A group another box holds, and a take naming it. [[spec/tickets/stale-hold-frees-the-branch]]
const HELD_ELSEWHERE = withEntry(
  GROUP_NOTE,
  { step: "sync", hand: "box 0ther1d", hash_before: "a1b2c3" },
  fakeFront(),
);
const takingHeld = (when, more = {}) => {
  const { it, outside, disk } = doorsSaying(
    {
      ...groupRemote(),
      ...more,
      ...remoteSaying([{ branch: "work/one-group", tip: "aaa", when }], {
        [`work/one-group:${GROUP_AT}`]: HELD_ELSEWHERE,
      }),
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    },
    { [on("one-group")]: HELD_ELSEWHERE, ...HAND },
  );
  const said = heard(() =>
    work(ROOT, ["take", "one-group"], {
      ...it,
      agent: true,
      cloud: true,
      clock: fakeClock(NOW),
      stale: "30m",
    }),
  );
  return { ...said, ran: ranGit(outside), text: disk.read(on("one-group")) };
};

// [[spec/tickets/stale-hold-frees-the-branch]]
test("a take over a hold past work.staleAfter closes that hold and writes its own", () => {
  const { code, said, ran, text } = takingHeld(SECONDS_NOW - 3600);
  assert.equal(code, 0, said);
  assert.ok(ran.includes("git switch work/one-group"), said);
  const rows = recordIn(text);
  assert.equal(rows.at(0).hand, "box 0ther1d");
  assert.ok(rows.at(0).hash_after, "the stale hold carries its hash_after");
  assert.notEqual(heldIn(text).hand, "box 0ther1d", "the take holds it now");
  assert.ok(
    ran.some(
      (one) => one.startsWith("git commit") && one.includes("over from box 0ther1d"),
    ),
    ran.join("\n"),
  );
});

// The claim lands first, so the push door meets the moved hold, and main comes in after it. [[spec/tickets/stale-hold-moves-by-take]]
test("a take over a stale hold behind main pushes the claim, then takes main in", () => {
  const { code, said, ran } = takingHeld(SECONDS_NOW - 3600, {
    "git rev-list --count HEAD..origin/main": { stdout: "3\n" },
  });
  assert.equal(code, 0, said);
  const pushed = ran.findIndex((one) =>
    one.startsWith("git push origin work/one-group"),
  );
  const merged = ran.findIndex((one) => one.startsWith("git merge origin/main"));
  assert.ok(pushed >= 0, ran.join("\n"));
  assert.ok(merged > pushed, ran.join("\n"));
});

// [[spec/tickets/stale-hold-frees-the-branch]]
test("a take over a hold under work.staleAfter refuses, and writes nothing", () => {
  const { code, said, ran, text } = takingHeld(SECONDS_NOW - 60);
  assert.equal(code, 1, said);
  assert.equal(heldIn(text).hand, "box 0ther1d");
  assert.ok(!ran.some((one) => one.startsWith("git commit")));
});

// [[spec/tickets/stale-hold-frees-the-branch]]
test("a release of another box's hold closes it, and the commit names the hand-over", () => {
  const { it, outside, disk } = doorsSaying(groupRemote(HELD_ELSEWHERE), {
    [on("one-group")]: HELD_ELSEWHERE,
    ...HAND,
  });
  const { code, said } = heard(() => work(ROOT, ["release"], it));
  assert.equal(code, 0, said);
  assert.equal(heldIn(disk.read(on("one-group"))), null);
  assert.ok(
    ranGit(outside).some(
      (one) =>
        one.startsWith("git commit") && one.includes("frees it from box 0ther1d"),
    ),
  );
});
