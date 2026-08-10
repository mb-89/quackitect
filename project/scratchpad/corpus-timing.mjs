// What does one corpus load cost, cold and stamped? The number behind the
// hash rule in software.md. No Session needed — loadTrace is a pure read.
import { loadTrace } from "../deliverable/engine/trace.ts";

const root = process.argv[2] ?? ".";
const runs = Number(process.argv[3] ?? 20);

const t0 = performance.now();
const first = loadTrace(root);
const cold = performance.now() - t0;

const t1 = performance.now();
for (let i = 0; i < runs; i++) loadTrace(root);
const warm = (performance.now() - t1) / runs;

console.log(`corpus: ${first.length} nodes`);
console.log(`cold  : ${cold.toFixed(1)} ms`);
console.log(`stamped: ${warm.toFixed(1)} ms  (mean of ${runs})`);
console.log(`saved : ${(cold - warm).toFixed(1)} ms per repeat load`);

// A WALK HOP ASKS FOR IT ONCE PER MACHINE. Eleven hops into an iteration with
// two drawn sub-machines is what the 274-second pull was made of.
console.log(`\n11 hops x 3 machines, cold   : ${(cold * 33).toFixed(0)} ms`);
console.log(`11 hops x 3 machines, stamped: ${(warm * 33).toFixed(0)} ms`);
