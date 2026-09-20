// The table a chapter holds, where its schema names one: the heads it opens
// with, and each row naming an item of the chapter it follows.
// [[spec/design_output/schema#a-chapter-holds-a-table]]

const FENCE = /^\s*(```|~~~)/;
const ROW = /^\s*\|(.*)\|\s*$/;
const RULE_ROW = /^[\s|:-]+$/;

// [[spec/design_output/schema#a-chapter-holds-a-table]]
export function tableFaults(held, spec, note, where, itemsIn, fault) {
  const heads = spec.heads ?? [];
  const rows = rowsIn(held.own);
  const at = (row) => held.line + row.line;
  if (!rows.length) {
    const said = `${held.header} holds a table headed ${heads.join(", ")}.`;
    return [fault(held.header, where, held.line, said)];
  }
  const out = [];
  if (heads.length && cellsOf(rows[0].said).join("|") !== heads.join("|")) {
    const said = `The table under ${held.header} opens with the heads ${heads.join(", ")}.`;
    out.push(fault(held.header, where, at(rows[0]), said));
  }
  if (!spec.namesOf) return out;
  const chapter = note.sections.find(
    (one) => one.header === spec.namesOf && one.level === held.level,
  );
  const items = chapter ? itemsIn(chapter.own).length : 0;
  let last = 0;
  for (const row of rows.slice(1)) {
    const first = cellsOf(row.said)[0] || "nothing";
    const number = /^\d+$/.test(first) ? Number(first) : 0;
    if (number < 1 || number > items) {
      const said = `A row of ${held.header} opens with the number of an item of ${spec.namesOf}, and this one opens with ${first}.`;
      out.push(fault(held.header, where, at(row), said));
      continue;
    }
    if (number < last) {
      const said = `A row of ${held.header} for item ${number} stands after one for item ${last}, and the numbers run up.`;
      out.push(fault(held.header, where, at(row), said));
    }
    last = number;
  }
  return out;
}

// The head row the schema names, and one row under it where the rows name a list. [[spec/design_output/schema#a-chapter-holds-a-table]]
export function tableRows(spec) {
  const heads = spec.heads ?? [];
  const out = [`| ${heads.join(" | ")} |`, `|${heads.map(() => "---").join("|")}|`];
  if (spec.namesOf) {
    const cells = heads.map((_, i) => (i ? "Say the first one here." : "1"));
    out.push(`| ${cells.join(" | ")} |`);
  }
  return out;
}

// The rows of the table a chapter holds, with the rule line under the head out. [[spec/design_output/schema#a-chapter-holds-a-table]]
export function rowsIn(rows) {
  const out = [];
  let fenced = false;
  for (let i = 0; i < rows.length; i++) {
    if (FENCE.test(rows[i])) {
      fenced = !fenced;
      continue;
    }
    if (fenced || !ROW.test(rows[i]) || RULE_ROW.test(rows[i])) continue;
    out.push({ said: rows[i], line: i + 1 });
  }
  return out;
}

export function cellsOf(row) {
  return (ROW.exec(row)?.[1] ?? "").split("|").map((one) => one.trim());
}
