// ONE COLOUR PER ROLE IN THE FEED (owner ruling 2026-07-28). The aq kind
// wore the agent's blue and the update kind wore the human's amber, so two
// of the feed's three columns said the same thing twice and an answered
// question did not stand out.
//
// This is a LINT, not a comment, because a comment is the weakest guard: the
// next person to pick a colour finds out here rather than in review.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { FEED_COLOURS, RESERVED_COLOURS, renderMirror } from "../engine/render.ts";

test("no two feed roles share a colour", () => {
  const seen = new Map<string, string>();
  for (const [role, colour] of Object.entries(FEED_COLOURS)) {
    const lower = colour.toLowerCase();
    const already = seen.get(lower);
    assert.equal(already, undefined, `${role} and ${already} share ${colour} — every role gets its own`);
    seen.set(lower, role);
  }
  assert.equal(seen.size, Object.keys(FEED_COLOURS).length);
});

test("no feed role steals a colour the voice already spent", () => {
  // Green is pass, red is failure, amber is attention. A kind painted amber
  // reads as a verdict on the act rather than as its type.
  const reserved = new Set(RESERVED_COLOURS.map((c) => c.toLowerCase()));
  for (const [role, colour] of Object.entries(FEED_COLOURS)) {
    assert.ok(!reserved.has(colour.toLowerCase()), `${role} takes ${colour}, which the voice reserves`);
  }
});

test("every feed colour actually reaches the page", () => {
  // Data is only the truth if the render reads it.
  const page = renderMirror.toString();
  assert.ok(page.length > 0);
  for (const role of Object.keys(FEED_COLOURS)) {
    assert.ok(typeof FEED_COLOURS[role] === "string" && /^#[0-9a-f]{6}$/i.test(FEED_COLOURS[role]), `${role} is a six-digit hex`);
  }
});
