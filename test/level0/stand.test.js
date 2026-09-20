// What stands free. A branch nobody claims stands free, and so does a branch
// whose claim goes stale, because the box that made it hands nothing back.
// [[spec/design_output/work#a-stale-group-is-yours]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { STALE } from "../../src/scripts/group.js";
import { freeIn, freeNow, staleClaim, staleSpan } from "../../src/scripts/stand.js";
import { DONE, HELD, standingOf, TODO } from "../../src/scripts/work.js";

// A group's standing comes off its state and its record, so a case writes those. [[spec/design_output/work#held-derives-from-the-record]]
const said = (standing, waits) => {
  const front = [
    "kind: [[ticket]]",
    `state: ${standing === DONE ? "closed" : "open"}`,
    "process: [[group]]",
  ];
  if (waits) front.push(`depends_on: ${waits}`);
  if (standing === HELD) front.push("record:", "  - step: sync", "    hash_before: a1");
  return `---\n${front.join("\n")}\n---\n\n# Ask\n\nOne piece of it.\n`;
};

const HOUR = 3600;
const NOW = 1_800_000_000_000;

// The read carries the tip's time, so the age reads off a number a case sets. [[spec/design_output/work#the-listing-reads-git-once]]
const box = (stale = "") => ({ stale });
const tip = (secondsAgo, more = {}) => ({
  branch: "work/one",
  when: Math.floor(NOW / 1000) - secondsAgo,
  ...more,
});

test("freeNow names a branch at todo waiting on nobody, and no other", () => {
  const free = freeNow(
    new Map([
      ["work/open", said(TODO)],
      ["work/waiting", said(TODO, "open")],
      ["work/holding", said(HELD)],
      ["work/finished", said(DONE)],
    ]),
  );

  assert.deepEqual(free, ["work/open"]);
});

test("freeNow frees a branch whose dependency left the queue", () => {
  const waits = said(TODO, "merged-already");

  assert.deepEqual(freeNow(new Map([["work/late", waits]])), ["work/late"]);
});

test("a dependency done and unmerged holds its dependent, and merged frees it", () => {
  const tickets = new Map([
    ["work/the-schema-reads", said(DONE)],
    ["work/the-schema-refuses", said(TODO, "the-schema-reads")],
  ]);

  assert.deepEqual(freeNow(tickets), [], "done waits on a merge");
  assert.deepEqual(freeNow(tickets, new Set(["work/the-schema-reads"])), [
    "work/the-schema-refuses",
  ]);
  assert.equal(
    standingOf(tickets, new Set(["work/the-schema-reads"])).get(
      "work/the-schema-reads",
    ),
    "merged",
  );
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("the span reads work.staleAfter, and STALE where the config says nothing", () => {
  assert.equal(staleSpan({ stale: "1h" }), HOUR);
  assert.equal(staleSpan({}), staleSpan({ stale: STALE }));
  assert.equal(staleSpan({ stale: "nonsense" }), staleSpan({}));
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("a claim younger than the span stands fresh, and an older one stands stale", () => {
  assert.equal(staleClaim(tip(HOUR), NOW, box("12h")).stale, false);
  assert.equal(staleClaim(tip(HOUR * 13), NOW, box("12h")).stale, true);
  assert.equal(staleClaim(tip(HOUR), NOW, box("12h")).age, "1h");
});

// A box that runs out of session hands nothing back, so the claim comes back on its own. [[spec/design_output/work#a-stale-group-is-yours]]
test("the take passes over a fresh claim, and takes a stale one", () => {
  const standing = new Map([["work/one", HELD]]);
  const stood = (secondsAgo) => [tip(secondsAgo, { ticket: said(HELD) })];

  const fresh = freeIn(stood(HOUR), standing, box("12h"), NOW);
  assert.deepEqual(fresh, [], "a box still holds it, so the take passes over");

  const stale = freeIn(stood(HOUR * 13), standing, box("12h"), NOW);
  assert.deepEqual(
    stale.map((one) => one.branch),
    ["work/one"],
    "the claim goes stale, so the branch comes back",
  );
});

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
test("a stale claim waiting on a dependency stays out of the take", () => {
  const stand = [
    { branch: "work/one", ticket: said(HELD, "two") },
    { branch: "work/two", ticket: said(TODO) },
  ];
  const standing = new Map([
    ["work/one", HELD],
    ["work/two", TODO],
  ]);

  const free = freeIn(stand, standing, box(HOUR * 13, "12h"), NOW).map(
    (one) => one.branch,
  );
  assert.deepEqual(free, ["work/two"], "the dependency holds it, stale or not");
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("a take carrying no clock reads no claim as stale", () => {
  const stand = [{ branch: "work/one", ticket: said(HELD) }];
  const standing = new Map([["work/one", HELD]]);

  assert.deepEqual(freeIn(stand, standing), [], "no clock, so the age reads nowhere");
  assert.deepEqual(freeIn(stand, standing, box(HOUR * 13, "12h"), 0), []);
});
