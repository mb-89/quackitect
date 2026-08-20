import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ids = [
  "opt-declarative-view-spec-evaluated-in-process",
  "req-emergency-sits-above-full",
  "opt-reconcile-at-entry-and-reload",
  "dsp-live-register",
  "opt-worktree-holds-only-the-record",
  "req-a-preflight-check-asks-the-reader-where-it-looked",
  "raid-iss-se-lint-has-no-whole-repo-sweep",
  "opt-thin-tree-reads-shared-from-trunk",
  "opt-a-clone-that-keeps-its-history",
  "opt-block-candidates-before-individual-review",
  "dsp-engine-delta",
  "opt-fan-the-method-out-to-every-tree",
  "opt-overlay-the-shared-layer-under-each-record",
  "raid-iss-the-refs-check-reads-a-node-tables-written-cells",
  "req-bm25-below-threshold-returns-empty",
];

function findAll(dir, out) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) findAll(join(dir, e.name), out);
    else if (e.isFile() && e.name.endsWith(".md")) out.push(join(dir, e.name));
  }
}

const all = [];
findAll("spec/trace", all);
const byId = new Map(all.map((p) => [p.split("/").pop().replace(/\.md$/, ""), p]));

for (const id of ids) {
  const p = byId.get(id);
  if (!p) {
    console.log(`${id}: NOT FOUND`);
    continue;
  }
  const text = readFileSync(p, "utf8");
  const m = text.match(/^statement:\s*(.*)$/m);
  console.log(`${id} :: ${p}\n  ${m ? m[1] : "(no statement line)"}`);
}
