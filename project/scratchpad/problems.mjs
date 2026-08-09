// Which trace nodes fail to answer their own template? No Session needed —
// conformance is a pure function over the corpus.
import { conformance, duplicateIds, loadTrace } from "../deliverable/engine/trace.ts";

const root = process.argv[2];
const corpus = loadTrace(root);
console.log("corpus:", corpus.length, "nodes");

for (const d of duplicateIds(corpus)) console.log("DUPLICATE ID:", d.id, "x", d.count);

let bad = 0;
for (const n of corpus) {
  const ps = conformance(root, n);
  if (ps.length === 0) continue;
  bad++;
  for (const p of ps) console.log(" -", p);
}
console.log(bad === 0 ? "every node answers its template" : `${bad} nodes do not answer their template`);

// AND THE COVERAGE, both ways, for the edges the reworked states declare.
const byId = new Map(corpus.map((n) => [n.id, n]));
const kids = new Map();
for (const n of corpus) for (const p of n.refines) kids.set(p, [...(kids.get(p) ?? []), n.id]);

for (const [child, parent] of [["story", "value-prop"], ["use-case", "story"], ["requirement", "use-case"]]) {
  const orphans = corpus.filter((n) => n.type === child && !n.refines.some((r) => byId.get(r)?.type === parent));
  const uncovered = corpus.filter((n) => n.type === parent && !(kids.get(n.id) ?? []).some((k) => byId.get(k)?.type === child));
  console.log(`\n${child} -> ${parent}`);
  if (orphans.length > 0) console.log("  refines no " + parent + ":", orphans.map((n) => n.id).join(" "));
  if (uncovered.length > 0) console.log("  no " + child + " refines it:", uncovered.map((n) => n.id).join(" "));
  if (orphans.length === 0 && uncovered.length === 0) console.log("  closed both ways");
}

// Dangling references anywhere.
const dangling = corpus.flatMap((n) => n.refines.filter((r) => !byId.has(r)).map((r) => `${n.id} -> ${r}`));
console.log("\ndangling refines:", dangling.length === 0 ? "none" : dangling.join("  "));
