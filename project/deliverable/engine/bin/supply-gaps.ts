// WHAT THE SUPPLY CHECK FINDS, over every machine that compiles today.
//
// Run before wiring the check into the compile, because a check that refuses
// has to be measured first: if it bites on a correct machine the rule is wrong,
// and finding that out at boot is finding it out too late.
//
//   node project/deliverable/engine/bin/supply-gaps.ts --root <project root>
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { compileMachine } from "../machines/compile.ts";
import { saysGap, supplyGaps } from "../machines/supply.ts";
import { CHANGE_COLUMNS, compileColumn, compileM0, readRigorMatrix } from "../rigor-matrix.ts";

const i = process.argv.indexOf("--root");
const root = i >= 0 ? process.argv[i + 1] : process.cwd();
const dir = join(root, "project", "deliverable", "machines");

let found = 0;
for (const n of readdirSync(dir).filter((f) => f.endsWith(".canvas"))) {
  let gaps: ReturnType<typeof supplyGaps>;
  try {
    gaps = supplyGaps(root, compileMachine(root, join("project", "deliverable", "machines", n)));
  } catch (e) {
    process.stdout.write(`${n}: did not compile — ${String((e as Error).message)}\n`);
    continue;
  }
  process.stdout.write(`${n}: ${String(gaps.length)} gap(s)\n`);
  for (const g of gaps) process.stdout.write(`  - ${saysGap(g)}\n`);
  found += gaps.length;
}
// AND EVERY PINNED COLUMN. The drawn machines above carry few forms; the
// matrix rows carry nearly all of them, and they only become states once a
// size is pinned. Measuring the canvases alone would report a clean system.
const matrix = readRigorMatrix(root);
for (const column of [...CHANGE_COLUMNS]) {
  let gaps: ReturnType<typeof supplyGaps>;
  try {
    gaps = supplyGaps(root, compileColumn(matrix, column));
  } catch (e) {
    process.stdout.write(`${column}: did not compile — ${String((e as Error).message)}\n`);
    continue;
  }
  process.stdout.write(`${column}: ${String(gaps.length)} gap(s)\n`);
  for (const g of gaps) process.stdout.write(`  - ${saysGap(g)}\n`);
  found += gaps.length;
}
const m0 = supplyGaps(root, compileM0(matrix, "probe"));
process.stdout.write(`M0: ${String(m0.length)} gap(s)\n`);
for (const g of m0) process.stdout.write(`  - ${saysGap(g)}\n`);
found += m0.length;

process.stdout.write(`total: ${String(found)}\n`);
