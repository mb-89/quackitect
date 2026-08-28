// A DROP ONTO A STATE LANDS IN THAT STATE (owner).
//
// THE DRAWING AND THE STORE NAME A STATE DIFFERENTLY. The drawing labels a box
// with the LAST SEGMENT of its position; a token records the WHOLE position. A
// drop carrying the label therefore matched no place, and the editor grew a
// bucket by that name sitting beside the state's own heading — the same state
// drawn twice, which reads as the drop landing somewhere else.
//
// TWO ANSWERS, NOT ONE. A drop onto the DRAWING is always a state, so a name
// nothing answers to still gets a position. A drop onto an editor HEADING may
// genuinely be a bucket, so a name nothing answers to stays a bucket.
//
// see dsp-the-bucket-editor.md#behavior-and-constraints
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { knownPosition, landingPlace } from "../engine/mirror.ts";
import { type MintDemand, mintBothSources } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";
const AT = "iterations/i-test/decompose";

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: `docs/${statement}.md`, step: "", statement };
}

/** The two fields these readers touch. Nothing else about a mirror is involved,
 *  so nothing else is built. */
function surface(root: string, active: string[]): Parameters<typeof landingPlace>[0] {
  return { root, session: { active: () => active } } as unknown as Parameters<typeof landingPlace>[0];
}

function withWork(active: string[]): Parameters<typeof landingPlace>[0] {
  const root = freshRoot();
  mintBothSources(root, AT, [demand("wire the pill")], NOW);
  return surface(root, active);
}

describe("a drop resolves the name the drawing gave it", { concurrency: true }, () => {
  test("a bare state name becomes the position work already stands at", () => {
    const at = withWork([AT]);
    assert.equal(landingPlace(at, "decompose"), AT, "the label resolves to the whole position");
  });

  test("a whole position is left exactly as it came", () => {
    const at = withWork([AT]);
    assert.equal(landingPlace(at, AT), AT);
  });

  // A STATE NOBODY HAS WORKED YET IS STILL A STATE. The prefix comes from the
  // walk, which is standing in the machine being drawn.
  test("a state holding no work takes the walk's own container", () => {
    const at = withWork([AT]);
    assert.equal(landingPlace(at, "verification"), "iterations/i-test/verification");
  });

  test("the walk's active position answers even where no work stands there", () => {
    const at = surface(freshRoot(), ["iterations/i-test/gate-inputs"]);
    assert.equal(landingPlace(at, "gate-inputs"), "iterations/i-test/gate-inputs");
  });

  // THE EDITOR'S HEADINGS ARE NOT ALL PLACES, so this reader never invents one.
  test("a name nothing answers to is not a position", () => {
    const at = withWork([AT]);
    assert.equal(knownPosition(at, "this afternoon"), undefined, "a bucket stays a bucket");
    assert.equal(knownPosition(at, "decompose"), AT, "and a state is found by its label");
  });

  test("the backlog is never resolved to a position", () => {
    const at = withWork([AT]);
    assert.equal(knownPosition(at, "backlog"), undefined, "it is the front desk's pending bucket, not a place");
  });
});
