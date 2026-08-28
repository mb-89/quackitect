// THE BAR SAYS WHICH PIECE OF WORK, not only which state.
//
// A state name holds still for an hour. The reader watching the walk wants to
// see something FLIP, and the piece of work in hand is the thing that does.
//
// THE SOURCE IS NOT THE EVIDENCE. THE SERVED PAGE IS — so every case here reads
// the markup renderMirror actually returns.
//
// see guidance/craft/ux.md "A REFERENCE IS A LINK, NEVER TEXT"
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { type MintDemand, mint, take } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";

const CHIP = 'class="ghost cur-state doclink in-hand"';
const POSITION = 'class="ghost cur-state" data-machine';

/** An open iteration with work minted where the walk actually stands. */
async function bar(demands: MintDemand[], held?: string): Promise<{ html: string; home: string; at: string }> {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const id = String(
    session.iterationSeed("prove the bar shows the work in hand", "a reader sees which piece of work is being done").seeded,
  );
  pinIteration(root, itFind(root, id), "major");
  session.iterationOpen(id);
  const home = String(session.boundRecordHome());
  const at = session.active()[0] ?? "";
  const report = mint(home, at, demands, NOW);
  if (held !== undefined) {
    const hit = [...report.minted, ...report.matched].find((i) => i.statement === held);
    if (hit !== undefined) take(home, hit.id, "the walker", "picking this one up");
  }
  const html = await renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", "main");
  return { html, home, at };
}

function demand(name: string, opened: string): MintDemand {
  return { source: "step", source_ref: `card.md#${opened}`, step: opened, statement: name, difficulty: "mechanical" };
}

describe("the bar shows the piece of work in hand", { concurrency: false }, () => {
  test("one open item at the position draws a chip that opens its token", async () => {
    const { html } = await bar([demand("fix the leaving guard", "a")]);
    assert.match(html, /class="ghost cur-state doclink in-hand"/, "nothing in the bar says what is being worked");
    assert.match(html, /data-path="spec\/iterations\/[^"]*\/work\/wk-[0-9a-f]+\.md"/, "the chip does not carry the token's own file");
    assert.match(html, /fix the leaving guard/, "the chip does not say what the work is");
  });

  // LEFT OF THE POSITION, because the work is the finer-grained fact and the
  // reader scans left to right from what changes most often.
  test("the chip sits left of the state", async () => {
    const { html } = await bar([demand("fix the leaving guard", "a")]);
    const chip = html.indexOf(CHIP);
    const state = html.indexOf(POSITION);
    assert.notEqual(chip, -1, "the chip is drawn");
    assert.notEqual(state, -1, "the position button is drawn");
    assert.ok(chip < state, `the chip must come first — chip at ${chip}, state at ${state}`);
  });

  // A HAND MARKS WORK BEFORE IT ACTS, so an item carrying a holder is the one
  // being worked, whatever else stands open beside it.
  test("taken beats merely open", async () => {
    const { html } = await bar([demand("the older one", "a"), demand("the taken one", "b")], "the taken one");
    const said = /doclink in-hand"[^>]*>([^<]*)</.exec(html)?.[1] ?? "";
    assert.match(said, /the taken one/, `the chip showed the wrong item: ${said}`);
    assert.match(html, /in hand: the walker/, "the chip does not say who is holding it");
  });

  // NOTHING IN HAND SHOWS AS NOTHING, the same way an unrouted target draws no
  // arrow. An empty bar is a real state of the walk.
  test("nothing at the position draws no chip", async () => {
    const { html } = await bar([]);
    assert.doesNotMatch(html, /doclink in-hand/, "a chip was drawn with no work standing");
    assert.match(html, /class="ghost cur-state" data-machine/, "the position button still stands");
  });

  // A LINK AND NEVER A BUTTON. The click handler binds `.doclink`, so a button
  // wearing the same classes would draw correctly and do nothing.
  test("the chip is an anchor, so the one click handler reaches it", async () => {
    const { html } = await bar([demand("fix the leaving guard", "a")]);
    assert.match(html, /<a class="ghost cur-state doclink in-hand"/, "a button here opens nothing");
  });
});
