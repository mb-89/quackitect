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
    ...promotionsOf(later.record),
    ...matrixOf(columns),
    ...detailsOf(columns, later.record),
    "",
  ].join("\n");
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

// What moves up the ladder: a script to the official scripts or the engine, a sentence to a check. [[spec/guidance/retro/classify]]
function promotionsOf(record) {
  const out = ["## Promotions", ""];
  if (!record?.promotions?.length) return [...out, "No promotion stands.", ""];
  out.push("| what | from | to |", "|---|---|---|");
  for (const one of record.promotions)
    out.push(`| ${one.what} | ${one.from} | ${one.to} |`);
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
