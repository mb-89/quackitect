// Demonstration script for tsp-candidate-couplings-are-disposed-one-by-one.
// Run as: node spec/iterations/i15-the-database-our-own-reader-over-obsidia/reports/demo-dispose-a-candidate-coupling.ts
// Calls the real, built rankCandidateCouplings and recordCouplingDisposition
// functions exactly as se_couplings handler in engine/tools-query.ts does.
import { rankCandidateCouplings, recordCouplingDisposition } from "../../../../deliverable/engine/disposition.ts";

const root = process.cwd();
const changeDescription = "fixed parseBase in tables.ts so a .base file top-level filters block, written once above views and shared by them, is no longer silently dropped";

console.log("=== STEP 1-2: describe a real change, ask for candidate couplings ===");
const ranked = rankCandidateCouplings(root, changeDescription);
console.log(`candidates returned: ${ranked.length}`);
for (const c of ranked.slice(0, 15)) console.log(`  ${c.score.toFixed(3)}  ${c.id}`);
if (ranked.length > 15) console.log(`  ... and ${ranked.length - 15} more`);

console.log("\n=== STEP 3: every candidate gets a disposition row, none silently dropped ===");
const dispositions = recordCouplingDisposition(root, ranked);
console.log(`disposition rows: ${dispositions.length}`);
const stillPending = dispositions.filter((d) => d.status === "pending");
console.log(`rows returned as pending (awaiting a human disposition act): ${stillPending.length}`);
console.log(`every candidate has exactly one row: ${dispositions.length === ranked.length}`);

console.log("\n=== STEP 4: below-threshold check (an unrelated description) ===");
const unrelated = rankCandidateCouplings(root, "zzqx unrelated nonsense words never in this corpus");
console.log(`candidates for a nonsense description: ${unrelated.length} (expect 0, explicit empty, not a guess)`);
