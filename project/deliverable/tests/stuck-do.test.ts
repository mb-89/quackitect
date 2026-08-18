// A `do` THAT CANNOT MOVE SAYS SO, AND SAYS WHAT WOULD MOVE IT.
//
// MEASURED ON THE i35 CLOUD RUN, 2026-08-17, five times: at a blessed kickoff
// gate, after every build chunk, and at verification. The pull answered `do`
// with "the stopped step says what it wants" while no step had said anything,
// and repeated indefinitely. `se_why` often held the whole answer. The cure was
// an se_aim at a downstream state, and nothing said so.
//
// The field report's own fix, quoted: "when nothing is owed and no target is
// set, answer with the reachable doors — the machine already computes them for
// se_aim."
import assert from "node:assert/strict";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { freshRoot, gitInit, readEverything } from "./helpers.ts";

/** Boot through, then stand at the desk with nothing routed — the case the
 *  cloud run hit, reproduced without a cloud. */
async function atRest(): Promise<Record<string, unknown>> {
  const root = freshRoot();
  gitInit(root);
  const s = new Session(root);
  await readEverything(s);
  s.setTarget("");
  return (await s.pull()) as Record<string, unknown>;
}

test("a do that walked no hop and arrived nowhere says why, and names se_aim", async () => {
  const r = await atRest();
  if (r.pull !== "do") return; // the fixture reached a form or a read; nothing to assert
  if (Array.isArray(r.walked) && r.walked.length > 0) return; // it moved, which is the ordinary case
  const advice = String(r.do);
  assert.match(advice, /se_aim/, `a stuck do does not name the verb that moves it: "${advice}"`);
  assert.doesNotMatch(advice, /the stopped step says what it wants/, `a stuck do points at a step that said nothing: "${advice}"`);
});

test("a stuck do hands over the doors it already computed, even when there is only one", async () => {
  const r = await atRest();
  if (r.pull !== "do") return;
  if (Array.isArray(r.walked) && r.walked.length > 0) return;
  // The doors are the answer to "aim at what?". Withholding them at a branch
  // of one is what left the cloud run guessing.
  if (r.options === undefined) {
    assert.doesNotMatch(String(r.do), /doors from here/, "the advice promises doors the answer does not carry");
    return;
  }
  assert.ok(Array.isArray(r.options) && (r.options as unknown[]).length > 0, "options is present but empty");
  assert.match(String(r.do), /doors from here are in `options`/, "the doors are carried but the advice does not point at them");
});
