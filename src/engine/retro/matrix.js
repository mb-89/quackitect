// The retro's matrix: ten rows, a column a chapter, and a reference in every
// cell whose details stand under the table.
// [[spec/guidance/retro/read]]

import { CHAPTERS, CUTS, cutsOf } from "./chapters.js";
import { homeOf } from "./timeline.js";

export const FINDINGS = "findings";
export const REPORT = "report.md";
// The column the owner's field feedback fills, beside the chapters. [[spec/guidance/retro/read]]
export const FEEDBACK = "feedback";
// The five starfish questions, then the five improvements, one row each. [[spec/guidance/retro/read]]
export const ROWS = [
  "start",
  "stop",
  "keep",
  "more",
  "less",
  "mechanize",
  "guidance",
  "process",
  "code",
  "tools",
];

// One chapter's findings: a section per row, and the items under it in order. A row with no section answers null. [[spec/guidance/retro/read]]
export function findingsOf(text) {
  const out = Object.fromEntries(ROWS.map((row) => [row, null]));
  let row = "";
  for (const line of String(text ?? "").split("\n")) {
    const head = /^##\s+(\w+)/.exec(line);
    if (head) {
      row = ROWS.includes(head[1].toLowerCase()) ? head[1].toLowerCase() : "";
      if (row) out[row] = [];
      continue;
    }
    const item = /^- (.+)$/.exec(line);
    if (row && item) out[row].push(item[1].trim());
  }
  return out;
}

// The report: the table of references, and under it every finding in full. [[spec/guidance/retro/read]]
export function reportOf(name, columns) {
  const ref = (column, row, at) => `${column.id}.${row}.${at + 1}`;
  const head = `| | ${columns.map((one) => `${one.id} · ${one.title}`).join(" | ")} |`;
  const rule = `|---|${columns.map(() => "---").join("|")}|`;
  const rows = ROWS.map((row) => {
    const cells = columns.map((column) => {
      const items = column.findings[row] ?? [];
      return items.length ? items.map((_, at) => ref(column, row, at)).join(", ") : "·";
    });
    return `| ${row} | ${cells.join(" | ")} |`;
  });
  const details = columns.flatMap((column) => [
    "",
    `## ${column.id} · ${column.title}`,
    ...ROWS.flatMap((row) =>
      (column.findings[row] ?? []).map(
        (item, at) => `- \`${ref(column, row, at)}\` ${item}`,
      ),
    ),
  ]);
  return [`# Retro ${name}`, "", head, rule, ...rows, ...details, ""].join("\n");
}

// The verb: refuses a chapter standing without its findings or a row, and writes the report. [[spec/guidance/retro/read]]
export function matrix(it, name) {
  const home = name ? homeOf(it, name) : "";
  if (!home || !it.disk.exists(it.join(home, CUTS))) {
    console.error(
      "retro matrix reads the chapters of a retro, and none stand: ./RUNME.sh retro chapters <retro>",
    );
    return 2;
  }
  const { cuts } = cutsOf(it.disk.read(it.join(home, CUTS)));
  const wanted = cuts.map((one) => ({ id: one.id, title: one.title }));
  if (it.disk.exists(it.join(home, FINDINGS, `${FEEDBACK}.md`))) {
    wanted.push({ id: FEEDBACK, title: "field feedback" });
  }
  const faults = [];
  const columns = wanted.map((one) => {
    const at = it.join(home, FINDINGS, `${one.id}.md`);
    if (!it.disk.exists(at)) {
      faults.push(`${FINDINGS}/${one.id}.md stands nowhere`);
      return { ...one, findings: {} };
    }
    const findings = findingsOf(it.disk.read(at));
    for (const row of ROWS) {
      if (findings[row] === null)
        faults.push(`${FINDINGS}/${one.id}.md carries no ${row} section`);
    }
    return { ...one, findings };
  });
  if (faults.length) {
    for (const one of faults) console.error(one);
    return 1;
  }
  it.disk.write(it.join(home, REPORT), reportOf(name, columns));
  console.log(
    `${it.join(home, REPORT)} draws ${columns.length} column(s) and ${ROWS.length} rows.`,
  );
  return 0;
}

export { CHAPTERS };
