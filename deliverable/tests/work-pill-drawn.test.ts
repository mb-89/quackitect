// THE SOURCE IS NOT THE EVIDENCE. THE SERVED PAGE IS.
//
// Every other case about the pills reads the client script or the card's
// markup. None of them asked the one question the reader asks: what does the
// DRAWING the server returns actually carry?
//
// IT EARNED ITS KEEP AT ONCE. The pill class was right, the detail attribute
// was right and the handler was right, and the wire between them was broken on
// a container — which only the output showed.
//
// see guidance/craft/ux.md "A DRAWING CHANGE IS NOT DONE UNTIL ITS OUTPUT IS
// MEASURED", and dsp-mirror-render.md#a-pill-that-is-all-roll-up-takes-no-click
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { renderMirror } from "../engine/render.ts";
import { STYLE } from "../engine/renderstyle.ts";
import { Session } from "../engine/session.ts";
import { type MintDemand, mint } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

const NOW = "2026-08-26T10:00:00Z";

/** An open iteration holding work at one of its states. */
async function withWork(demands: MintDemand[]): Promise<string> {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the pills draw", "a state wears its buckets in the served drawing").seeded);
  pinIteration(root, itFind(root, id), "major");
  session.iterationOpen(id);
  mint(String(session.boundRecordHome()), `iterations/${id}/write-requirements`, demands, NOW);
  // MAIN, where the iteration is a CONTAINER. Its own count is zero and only
  // the roll-up is real, which is the case the fix is about.
  return renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", "main");
}

function demand(source: MintDemand["source"], name: string): MintDemand {
  return { source, source_ref: `docs/${name}.md`, step: "", statement: name, difficulty: "mechanical" };
}

describe("the served drawing wears the buckets", { concurrency: false }, () => {
  test("a container shows what is inside it and opens no bucket of its own", async () => {
    const html = await withWork([demand("reading", "an-input"), demand("evidence", "an-output")]);

    assert.match(html, /class="work-pill in"/, "the input bucket is drawn");
    assert.match(html, /class="work-pill out"/, "the output bucket is drawn");
    // THE FAILURE NAMES WHAT IS THERE. A regex against a 300kB page prints the
    // whole page and says nothing about which buckets were drawn.
    const buckets = [...html.matchAll(/data-detail="bucket:([^"]+)"/g)].map((m) => m[1]).sort();
    assert.deepEqual(buckets, [], "a count that is all roll-up opens nothing");
    assert.match(html, /class="work-pill-rollup"/, "the press falls through to the state, which opens the machine");
  });

  test("a bucket holding nothing is not drawn, because zero and absent look alike", async () => {
    const html = await withWork([demand("reading", "an-input")]);

    assert.match(html, /class="work-pill in"/, "what is owed is drawn");
    assert.doesNotMatch(html, /class="work-pill pending"/, "and what is empty is not");
    assert.doesNotMatch(html, /class="work-pill out"/);
  });

  // see dsp-mirror-render.md#done-hangs-off-the-opposite-corner
  // see dsp-mirror-render.md#done-hangs-off-the-opposite-corner
  test("the done pill hangs off the right-hand end of the bottom edge", async () => {
    // A READING DEMAND SETTLES FROM THE CREDIT and lands in the done bucket,
    // so one mint puts a pill on each edge. An evidence demand alone would
    // draw nothing at the bottom to compare against.
    const html = await withWork([demand("reading", "an-input"), demand("evidence", "an-output")]);

    const rects = [...html.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="(\d+)"[^>]*class="work-pill (\w+)"/g)].map((m) => ({
      x: Number(m[1]),
      y: Number(m[2]),
      bucket: m[4],
    }));
    const owed = rects.filter((r) => r.bucket === "in" || r.bucket === "out");

    assert.ok(owed.length > 0, `an owed pill is drawn — got ${rects.map((r) => r.bucket).join(", ") || "none"}`);
    // THE ANCHOR IS WHAT IS BEING MEASURED, so the assertion is about where the
    // rect starts rather than about which pills happen to exist.
    for (const r of rects.filter((p) => p.bucket === "done")) {
      assert.ok(r.x > Math.min(...owed.map((o) => o.x)), "done starts to the RIGHT of where the owed buckets start");
      assert.ok(r.y > Math.min(...owed.map((o) => o.y)), "and below them");
    }
  });

  test("nothing is dashed, and each bucket carries its own colour", () => {
    // The stylesheet is served with the page, so this reads what the reader
    // gets rather than what the source intends.
    assert.ok(!STYLE.includes(".work-pill.done { stroke-dasharray"), "the done bucket is no longer dashed");
    for (const bucket of ["in", "pending", "out", "done"]) {
      assert.ok(STYLE.includes(`.work-pill.${bucket} { stroke: var(--se-bucket-${bucket}); }`), `${bucket} has its own colour`);
    }
  });
});
