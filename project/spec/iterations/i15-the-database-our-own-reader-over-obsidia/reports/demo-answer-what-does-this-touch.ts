// Demonstration script for tsp-a-structured-query-answers-what-a-decision-touches.
// Run as: node project/spec/iterations/i15-the-database-our-own-reader-over-obsidia/reports/demo-answer-what-does-this-touch.ts
// Calls the real, built se_query handler path (answerStructuredQuery) exactly as
// the se_query tool handler in engine/tools-query.ts does, from the repo root.
import { answerStructuredQuery } from "../../../../deliverable/engine/query.ts";

const root = process.cwd();

console.log("=== STEP 2: ask the query verb for architecture decisions, naming fields ===");
const r1 = answerStructuredQuery(root, {
  base: "spec/queries/decisions-architecture.base",
  fields: ["name", "statement", "addresses"],
});
console.log(`rows returned: ${r1.rows.length}`);
console.log("all matched names:", r1.rows.map((r) => r.name));
const mine = r1.rows.find((r) => r.name === "adr-query-in-engine");
console.log("row for adr-query-in-engine:", JSON.stringify(mine, null, 2));

console.log("\n=== STEP 3: ask for a field this view does not carry ===");
try {
  answerStructuredQuery(root, {
    base: "spec/queries/decisions-architecture.base",
    fields: ["name", "decided_in"],
  });
  console.log("NO REFUSAL — unexpected");
} catch (err) {
  console.log("refused as expected:");
  console.log(String((err as Error).message ?? err));
  console.log(JSON.stringify(err, null, 2));
}

console.log("\n=== STEP 4: follow one row id (name) to its file ===");
console.log(mine ? `file to read next: project/spec/decisions/${mine.name}.md` : "no row found");
