// The retro's report, bottom line first: the class fixes per category, the
// effect of the last retro, the promotions, then the matrix and every finding.
// [[spec/guidance/retro/classify]]

import { CATEGORIES, idOf, ROWS } from "./findings.js";

const NONE = "·";

// The whole report over the columns, and over whatever the later steps wrote. [[spec/guidance/retro/classify]]
export function reportOf(name, columns, later = {}) {
  return [
    `# Retro ${name}`,
    "",
    ...bottomLine(later.record, later.rates),
    ...effectOf(later.effect),
    ...listOf(
      "Promotions",
      later.record?.promotions,
      ["what", "from", "to"],
      "No promotion stands.",
    ),
    ...listOf(
      "New checklist items",
      later.record?.checklist,
      ["item", "why"],
      "The checklist takes no new item.",
    ),
    ...listOf(
      "Limits",
      later.record?.limits,
      ["what", "why"],
      "The retro names no limit.",
    ),
    ...drainedOf(later.record),
    ...matrixOf(columns),
    ...detailsOf(columns, later.record),
    "",
  ].join("\n");
}

// A section holding one table, or its line for none. [[spec/guidance/retro/classify]]
function listOf(title, list, fields, none) {
  const out = [`## ${title}`, ""];
  if (!list?.length) return [...out, none, ""];
  out.push(`| ${fields.join(" | ")} |`, `|${fields.map(() => "---").join("|")}|`);
  for (const one of list)
    out.push(`| ${fields.map((field) => one[field]).join(" | ")} |`);
  return [...out, ""];
}

// Where every collected note and memory goes. [[spec/guidance/retro/classify]]
function drainedOf(record) {
  const drained = Object.entries(record?.dispositions ?? {}).filter(([id]) =>
    /^(note|memory):/.test(id),
  );
  const out = ["## Notes and memory", ""];
  if (!drained.length)
    return [...out, "No note or memory carries a disposition yet.", ""];
  out.push("| item | goes |", "|---|---|");
  for (const [id, said] of drained.sort()) out.push(`| ${id} | ${said} |`);
  return [...out, ""];
}

// The class fixes, a table per category, each ranked by its rate. [[spec/guidance/retro/classify]]
function bottomLine(record, rates) {
  const out = ["## Bottom line", ""];
  if (!record || !rates) return [...out, "The classify step stands open.", ""];
  const held = (id) =>
    Object.values(record.dispositions).filter((said) => said === id).length;
  for (const category of CATEGORIES) {
    const mine = record.classes
      .filter((one) => one.category === category)
      .sort((a, b) => rates.classes[b.id].rate - rates.classes[a.id].rate);
    if (!mine.length) continue;
    out.push(
      `### ${category}`,
      "",
      "| class | defect | fix | rate an hour | tickets | findings |",
      "|---|---|---|---|---|---|",
    );
    for (const one of mine) {
      const tickets = (one.tickets ?? []).join(", ") || NONE;
      out.push(
        `| ${one.id} · ${one.class} | ${one.defect} | ${one.fix} | ${rates.classes[one.id].rate} | ${tickets} | ${held(one.id)} |`,
      );
    }
    out.push("");
  }
  out.push(
    `Rates count pattern matches per active hour, over ${rates.hours} active hour(s).`,
    "",
  );
  return out;
}

// The last retro's classes, counted again here. [[spec/guidance/retro/effect]]
function effectOf(effect) {
  const out = ["## Effect of the last retro", ""];
  if (!effect?.classes?.length)
    return [...out, "No earlier retro holds class fixes.", ""];
  out.push(
    `Measured against ${effect.last}.`,
    "",
    "| class | fix | before | now | verdict |",
    "|---|---|---|---|---|",
  );
  for (const one of effect.classes) {
    out.push(
      `| ${one.id} · ${one.class} | ${one.fix} | ${one.before.rate} | ${one.now.rate} | ${one.verdict} |`,
    );
  }
  return [...out, ""];
}

// The table of references: a row per question and improvement, a column per chapter. [[spec/guidance/retro/read]]
function matrixOf(columns) {
  const head = `| | ${columns.map((one) => `${one.id} · ${one.title}`).join(" | ")} |`;
  const rule = `|---|${columns.map(() => "---").join("|")}|`;
  const rows = ROWS.map((row) => {
    const cells = columns.map((column) => {
      const items = column.findings[row] ?? [];
      return items.length
        ? items.map((_, at) => idOf(column.id, row, at)).join(", ")
        : NONE;
    });
    return `| ${row} | ${cells.join(" | ")} |`;
  });
  return ["## The matrix", "", head, rule, ...rows, ""];
}

// Every finding in full, each with where it goes. [[spec/guidance/retro/classify]]
function detailsOf(columns, record) {
  const goes = (id) => {
    const said = record?.dispositions?.[id];
    return said ? ` → ${said}` : "";
  };
  return [
    "## Details",
    ...columns.flatMap((column) => [
      "",
      `### ${column.id} · ${column.title}`,
      ...ROWS.flatMap((row) =>
        (column.findings[row] ?? []).map((item, at) => {
          const id = idOf(column.id, row, at);
          return `- \`${id}\` ${item}${goes(id)}`;
        }),
      ),
    ]),
  ];
}
