// Render a decision log as a Mermaid gitGraph page — one file per visit,
// written where the details surface can open it. VS Code renders the fence
// itself since 1.121, so this writes text and nothing else.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DecisionNode } from "../decisions.ts";
import { replayVisitsText } from "../decisions.ts";
import { decisionsAsMarkdown } from "../gitgraph.ts";

const [, , source, outDir] = process.argv;
if (source === undefined || outDir === undefined) {
  process.stderr.write("usage: render-decisions <decisions.jsonl> <out-dir>\n");
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const visits = replayVisitsText(readFileSync(source, "utf8"));
for (const v of visits) {
  const nodes = v.nodes as unknown as DecisionNode[];
  const page = decisionsAsMarkdown(nodes, `${v.visit} — decisions`);
  const file = join(outDir, `${v.visit.replace(/[^A-Za-z0-9_-]/g, "-")}.md`);
  writeFileSync(file, page, "utf8");
  process.stdout.write(`${file}  (${nodes.length} points)\n`);
}
if (visits.length === 0) process.stdout.write("no visits in that log\n");
