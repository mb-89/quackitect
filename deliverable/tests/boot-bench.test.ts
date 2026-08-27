// The boot bench — a session boot lands the walk at the front desk, serves
// boot's own reading only, and stays inside the 20-second bound. Realizes
// tsp-boot-bench (req-boot-ends-at-front-desk); the bound is judged on the
// reference machine, and the suite's timing log keeps the measured number
// so drift shows across runs.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { itSeed } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { freshRoot, gitInit, proofFor, workHere } from "./helpers.ts";

test("with an open record standing, boot ends at the desk inside the bound, on boot's own reading", async () => {
  const root = freshRoot();
  gitInit(root);
  itSeed(root, "an open record standing at boot", "the boot must not walk into it");
  const started = performance.now();
  const s = new Session(root);
  s.setAutonomy(1);
  s.setTarget("front_desk");
  const reads: string[] = [];
  let r = await s.pull();
  for (let i = 0; i < 40; i++) {
    if (r.pull === "read") {
      const doc = r.document as { path?: string; content?: string };
      reads.push(String(doc.path ?? ""));
      r = await s.pull({ form: { read: proofFor(String(doc.content ?? "")) } });
      continue;
    }
    // A REAL WALKER DOES THE STEP BEFORE IT PULLS AGAIN. Boot's own marked step
    // holds prepare_desk shut until it is settled, so answering the reading
    // alone never reaches the desk.
    if (r.pull !== "do" || r.arrived === true) break;
    if (r.refusal === undefined) break;
    if (workHere(s) === 0) break;
    r = await s.pull();
  }
  const elapsed = performance.now() - started;
  assert.deepEqual(
    s.active(),
    ["front_desk"],
    `boot ends at the desk, never inside the open record (landed on ${JSON.stringify(s.active())})`,
  );
  assert.ok(
    reads.every((p) => !p.includes("/machines/methods/")),
    `boot serves boot's own reading, never a record route's method cards: ${reads.join(" · ")}`,
  );
  assert.ok(elapsed < 20_000, `boot took ${Math.round(elapsed)} ms against the 20 s bound`);
});
