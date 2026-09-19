// The retro's report as a verb: it refuses a chapter standing without its
// findings, and draws what the later steps wrote above the matrix.
// [[spec/guidance/retro/read]]

import { CUTS } from "./chapters.js";
import { CLASSES, RATES, recordOf } from "./classes.js";
import { EFFECT } from "./effect.js";
import { columnsOf } from "./findings.js";
import { reportOf } from "./report.js";
import { homeOf } from "./timeline.js";

export const REPORT = "report.md";

// [[spec/guidance/retro/read]]
export function matrix(it, name) {
  const home = name ? homeOf(it, name) : "";
  if (!home || !it.disk.exists(it.join(home, CUTS))) {
    console.error(
      "retro matrix reads the chapters of a retro, and none stand: ./RUNME.sh retro chapters <retro>",
    );
    return 2;
  }
  const { columns, faults } = columnsOf(it, home);
  if (faults.length) {
    for (const one of faults) console.error(one);
    return 1;
  }
  const read = (file) => {
    const at = it.join(home, file);
    return it.disk.exists(at) ? it.disk.read(at) : "";
  };
  const later = {
    record: read(CLASSES) ? recordOf(read(CLASSES)) : null,
    rates: read(RATES) ? JSON.parse(read(RATES)) : null,
    effect: read(EFFECT) ? JSON.parse(read(EFFECT)) : null,
  };
  it.disk.write(it.join(home, REPORT), reportOf(name, columns, later));
  console.log(
    `${it.join(home, REPORT)} draws ${columns.length} column(s), bottom line first.`,
  );
  return 0;
}
