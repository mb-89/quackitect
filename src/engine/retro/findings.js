// The retro's findings: the rows every column answers, and the columns the
// readers write, one file a chapter and one for the field feedback.
// [[spec/guidance/retro/read]]

import { CUTS, cutsOf } from "./chapters.js";

export const FINDINGS = "findings";
// The column the owner's field feedback fills, beside the chapters. [[spec/guidance/retro/read]]
export const FEEDBACK = "feedback";
// The file prefix of an auditor's column. [[spec/guidance/retro/audit]]
export const AUDIT = "audit-";
// The five starfish questions, then the improvements, one row each. [[spec/guidance/retro/read]]
export const QUESTIONS = ["start", "stop", "keep", "more", "less"];
// The improvements, which are also the categories a class fix falls in. A new one here reaches the report unchanged. [[spec/guidance/retro/classify]]
export const CATEGORIES = ["mechanize", "guidance", "process", "code", "tools"];
export const ROWS = [...QUESTIONS, ...CATEGORIES];

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

// A finding's id: its column, its row, and its place in the row, counted from one. [[spec/guidance/retro/read]]
export function idOf(column, row, at) {
  return `${column}.${row}.${at + 1}`;
}

// Every finding of every column, by id. [[spec/guidance/retro/classify]]
export function itemsOf(columns) {
  return columns.flatMap((column) =>
    ROWS.flatMap((row) =>
      (column.findings[row] ?? []).map((text, at) => ({
        id: idOf(column.id, row, at),
        text,
      })),
    ),
  );
}

// The columns a retro's findings fill, and the faults of a column standing incomplete. [[spec/guidance/retro/read]]
export function columnsOf(it, home) {
  const { cuts } = cutsOf(it.disk.read(it.join(home, CUTS)));
  const wanted = cuts.map((one) => ({ id: one.id, title: one.title }));
  if (it.disk.exists(it.join(home, FINDINGS, `${FEEDBACK}.md`))) {
    wanted.push({ id: FEEDBACK, title: "field feedback" });
  }
  // An auditor's column stands beside the chapters, one a checklist group. [[spec/guidance/retro/audit]]
  const folder = it.join(home, FINDINGS);
  const audits = it.disk.exists(folder)
    ? it.disk
        .list(folder)
        .map((one) => one.name)
        .filter((one) => one.startsWith(AUDIT) && one.endsWith(".md"))
        .sort()
    : [];
  for (const one of audits) {
    const id = one.replace(/\.md$/, "");
    wanted.push({ id, title: `the checklist, ${id.slice(AUDIT.length)}` });
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
  return { columns, faults };
}
