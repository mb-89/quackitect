// ONE COLOUR PER ROLE IN THE FEED (owner ruling 2026-07-28). The aq kind
// wore the agent's blue and the update kind wore the human's amber, so two
// of the feed's three columns said the same thing twice and an answered
// question did not stand out.
//
// This is a LINT, not a comment, because a comment is the weakest guard: the
// next person to pick a colour finds out here rather than in review.
//
// The values are read from project/brand/palette.css, so this lints the FILE a
// person edits rather than a copy of it in the source.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { FEED_ROLES, feedColours, RESERVED_ROLES, renderMirror, reservedColours } from "../engine/render.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

test("the palette declares every role the code asks for", () => {
  // A missing variable renders as an empty colour, which is invisible rather
  // than wrong — the failure mode worth catching mechanically.
  const feed = feedColours(REPO_ROOT);
  for (const role of FEED_ROLES) {
    assert.match(feed[role] ?? "", /^#[0-9a-f]{6}$/i, `--se-feed-${role} is missing from palette.css`);
  }
  for (const [i, role] of RESERVED_ROLES.entries()) {
    assert.match(reservedColours(REPO_ROOT)[i] ?? "", /^#[0-9a-f]{6}$/i, `--se-${role} is missing from palette.css`);
  }
});

test("no two feed roles share a colour", () => {
  const seen = new Map<string, string>();
  for (const [role, colour] of Object.entries(feedColours(REPO_ROOT))) {
    const lower = colour.toLowerCase();
    const already = seen.get(lower);
    assert.equal(already, undefined, `${role} and ${already} share ${colour} — every role gets its own`);
    seen.set(lower, role);
  }
  assert.equal(seen.size, FEED_ROLES.length);
});

test("no feed role steals a colour the voice already spent", () => {
  // Green is pass, red is failure, amber is attention. A kind painted amber
  // reads as a verdict on the act rather than as its type.
  const reserved = new Set(reservedColours(REPO_ROOT).map((c) => c.toLowerCase()));
  for (const [role, colour] of Object.entries(feedColours(REPO_ROOT))) {
    assert.ok(!reserved.has(colour.toLowerCase()), `${role} takes ${colour}, which the voice reserves`);
  }
});

// A COLOUR WRITTEN AT THE PLACE IT IS USED IS A DEFECT (ux.md). The rule was
// prose, it was broken repeatedly, and prose that keeps breaking wants a lint.
test("no six-digit hex is written into the renderer", () => {
  const source = readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
  const offenders: string[] = [];
  for (const [i, line] of source.split("\n").entries()) {
    const hit = line.match(/#[0-9a-f]{6}\b/i);
    // The fallback is a legibility floor for a tree with no palette at all,
    // and it is the one place a literal has to live.
    if (hit !== null && !line.includes("PALETTE_FALLBACK") && !line.includes("var(--")) {
      offenders.push(`${i + 1}: ${line.trim().slice(0, 100)}`);
    }
  }
  assert.deepEqual(offenders, [], "colours belong in project/brand/palette.css");
});

// A CONTROL THAT DOES NOTHING IS WORSE THAN NO CONTROL. VS Code sandboxes its
// webview without allow-popups, and a nested frame can only NARROW a sandbox,
// so window.open inside the editor silently does nothing. Every call must
// therefore be guarded by the embed flag, or a modifier key becomes a dead key.
test("no window.open runs inside the editor, where the sandbox kills it", () => {
  const source = readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
  const offenders: string[] = [];
  for (const [i, line] of source.split("\n").entries()) {
    if (!line.includes("window.open(")) continue;
    // Guarded either by the flag on the same line, or by an embedOpen() call
    // that returns before reaching it.
    if (line.includes("!EMBED")) continue;
    offenders.push(`${i + 1}: ${line.trim().slice(0, 90)}`);
  }
  // The .replink pair is guarded upstream by embedOpen(), which posts to the
  // extension and returns. Those two are reached only in a standalone browser.
  const guardedUpstream = source.includes("if (embedOpen(rpl.dataset.path)) return;");
  assert.ok(guardedUpstream, "the document links still route through the host in embed mode");
  assert.equal(offenders.length, 2, `only the embedOpen-guarded pair may be unflagged:\n${offenders.join("\n")}`);
});

test("every feed colour actually reaches the page", () => {
  // A palette entry nothing asks for is dead configuration, and a role the
  // page never draws is a colour nobody sees. Both are the same bug.
  assert.equal(typeof renderMirror, "function");
  const source = readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
  for (const role of FEED_ROLES) {
    assert.ok(source.includes(`var(--se-feed-${role})`), `${role} is declared but never drawn`);
  }
});
