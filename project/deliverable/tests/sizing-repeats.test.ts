// A SIZING DECISION REPEATS AND SHOWS ITS INPUT — req-a-machine-decision-repeats,
// and tsp-a-sizing-decision-repeats-and-shows-its-input.
//
// TWO HALVES AND BOTH ARE OWED. The decision repeats, AND the engine records
// what it read. A decision that repeats and shows nothing cannot be audited;
// one that shows its input and wanders cannot be trusted.
//
// THE INPUT AND THE DECISION GO OUT TOGETHER under the declared architecture:
// the two-part difficulty says what the work is like and the rung says what we
// would pick. That redundancy was argued as a cost and it discharges a must.
//
// THE IMPORT IS DYNAMIC for the reason engine/sizing.ts does not exist yet —
// see tests/sizing-block.test.ts.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

interface Difficulty {
  judgement: string;
  reading: string;
}
interface Sizing {
  rungFor(d: Difficulty): { rung?: string; unmatched?: Difficulty };
  publish(d: Difficulty): { pair: Difficulty; rung?: string; unmatched?: Difficulty };
}

async function sizing(): Promise<Sizing> {
  return (await import("../engine/sizing.ts")) as unknown as Sizing;
}

const HERE = fileURLToPath(new URL(".", import.meta.url));

test("the same inputs give the same answer, a hundred times over", async () => {
  const { rungFor } = await sizing();
  const first = JSON.stringify(rungFor({ judgement: "C3", reading: "R1" }));
  for (let i = 0; i < 100; i++) {
    assert.equal(JSON.stringify(rungFor({ judgement: "C3", reading: "R1" })), first, `repetition ${i} answered differently`);
  }
});

test("and the same answer in a fresh process", async () => {
  const { rungFor } = await sizing();
  const here = JSON.stringify(rungFor({ judgement: "C3", reading: "R1" }));
  const script = 'import("../engine/sizing.ts").then(m=>process.stdout.write(JSON.stringify(m.rungFor({judgement:"C3",reading:"R1"}))))';
  const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], { cwd: HERE, encoding: "utf8" });
  assert.equal(out, here, "an in-process cache passes the case above and fails this one");
});

test("order does not change an answer", async () => {
  const { rungFor } = await sizing();
  const pairs = [
    { judgement: "C0", reading: "R4" },
    { judgement: "C4", reading: "R0" },
    { judgement: "C2", reading: "R2" },
  ];
  const forward = pairs.map((p) => JSON.stringify(rungFor(p)));
  const backward = [...pairs].reverse().map((p) => JSON.stringify(rungFor(p)));
  assert.deepEqual([...backward].reverse(), forward, "a block that carries state between calls fails here and nowhere else");
});

test("the published result carries what the decision read", async () => {
  const { publish } = await sizing();
  const out = publish({ judgement: "C3", reading: "R1" });
  assert.deepEqual(out.pair, { judgement: "C3", reading: "R1" }, "the pair IS the input and it goes out beside the decision");
});

test("the recorded input re-derives the recorded decision", async () => {
  const { publish, rungFor } = await sizing();
  const out = publish({ judgement: "C3", reading: "R1" });
  assert.equal(rungFor(out.pair).rung, out.rung, "recording an input nobody checks is the failure this case exists for");
});

test("a changed input changes the answer", async () => {
  const { rungFor } = await sizing();
  const low = rungFor({ judgement: "C0", reading: "R0" }).rung;
  const high = rungFor({ judgement: "C4", reading: "R4" }).rung;
  assert.notEqual(low, high, "without this the cases above pass on a block that returns a constant");
});
