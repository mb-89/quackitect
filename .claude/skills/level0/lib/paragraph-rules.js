// The rules the paragraph schema projects, over a sentence and over a table.
// The schema hands the values in, and this holds the Tengo they run.
// [[spec/design_output/projection#a-layer-writes-two-files]]

import { FRONT, prelude, scripted } from "./snippets.js";

// [[spec/design_output/projection#a-layer-writes-two-files]]
export function codeSpans(layer) {
  const most = Number(layer.codeSpans);

  return scripted(`A sentence holds ${most} code spans.`, [
    ...prelude(["rows"], true, layer.prose),
    FRONT,
    "fenced := false",
    "",
    "for row in rows(said) {",
    "  trimmed := text.trim_space(row.said)",
    '  if text.has_prefix(trimmed, "```") {',
    "    fenced = !fenced",
    "    continue",
    "  }",
    "  if fenced { continue }",
    '  if text.has_prefix(trimmed, "|") { continue }',
    '  if text.has_prefix(trimmed, "#") { continue }',
    '  if text.has_prefix(trimmed, ">") { continue }',
    "",
    "  for part in text.re_split(`[.!?]+(?:\\s|$)`, row.said, -1) {",
    '    seen := text.re_find("`[^`]*`", part, -1)',
    "    if is_undefined(seen) { continue }",
    `    if len(seen) > ${most} {`,
    "      matches = append(matches, {",
    "        begin: row.begin,",
    "        end: row.end,",
    `        message: "A sentence holds ${most} code spans, and this one holds " + string(len(seen)) + ". Carry the rest as a list or a table."`,
    "      })",
    "    }",
    "  }",
    "}",
  ]);
}

// A paragraph beside a table says again what a cell of it holds, and the two drift apart. [[spec/design_output/lsp#a-second-copy-draws]]
export function restatedTable(layer) {
  const most = Number(layer.table);

  return scripted("A paragraph says again what a cell of the table beside it holds.", [
    ...prelude(["rows"], true, layer.prose),
    FRONT,
    ...WORDS,
    ...RUN,
    ...ASIDE,
    ...walk(most),
  ]);
}

// The words a line holds, with a code span and a link blanked out. [[spec/design_output/lsp#a-second-copy-draws]]
const WORDS = [
  "wordsOf := func(one) {",
  '  clean := text.re_replace("`[^`]*`", one, " ")',
  '  clean = text.re_replace(`\\[\\[[^\\]]*\\]\\]`, clean, " ")',
  '  clean = text.re_replace(`[^a-z0-9]+`, text.to_lower(clean), " ")',
  "  return text.fields(clean)",
  "}",
  "",
];

// The longest run of words two places share. [[spec/design_output/lsp#a-second-copy-draws]]
const RUN = [
  "run := func(a, b) {",
  "  most := 0",
  "  for i := 0; i < len(a); i++ {",
  "    for j := 0; j < len(b); j++ {",
  "      n := 0",
  "      for i+n < len(a) && j+n < len(b) && a[i+n] == b[j+n] { n = n + 1 }",
  "      if n > most { most = n }",
  "    }",
  "  }",
  "  return most",
  "}",
  "",
];

// A heading, a row, an item and a quote stand outside the paragraph beside a table. [[spec/design_output/lsp#a-second-copy-draws]]
const ASIDE = [
  "aside := func(line) {",
  "  said := text.trim_space(line)",
  "  if len(said) == 0 { return true }",
  '  if text.has_prefix(said, "#") { return true }',
  '  if text.has_prefix(said, "|") { return true }',
  '  if text.has_prefix(said, "-") { return true }',
  '  if text.has_prefix(said, ">") { return true }',
  "  return false",
  "}",
  "",
];

// Each table takes the cells it holds and the lines touching it. [[spec/design_output/lsp#a-second-copy-draws]]
function walk(most) {
  return [
    "lines := rows(said)",
    "at := 0",
    "for at < len(lines) {",
    '  if !text.has_prefix(text.trim_space(lines[at].said), "|") {',
    "    at = at + 1",
    "    continue",
    "  }",
    "  from := at",
    "  cells := []",
    '  for at < len(lines) && text.has_prefix(text.trim_space(lines[at].said), "|") {',
    '    for cell in text.split(text.trim_space(lines[at].said), "|") {',
    "      one := text.trim_space(cell)",
    "      if len(one) > 0 && !text.re_match(`^[-: ]+$`, one) { cells = append(cells, wordsOf(one)) }",
    "    }",
    "    at = at + 1",
    "  }",
    "",
    "  near := []",
    "  up := from - 1",
    "  for up >= 0 && len(text.trim_space(lines[up].said)) == 0 { up = up - 1 }",
    "  for up >= 0 && !aside(lines[up].said) {",
    "    near = append(near, lines[up])",
    "    up = up - 1",
    "  }",
    "  down := at",
    "  for down < len(lines) && len(text.trim_space(lines[down].said)) == 0 { down = down + 1 }",
    "  for down < len(lines) && !aside(lines[down].said) {",
    "    near = append(near, lines[down])",
    "    down = down + 1",
    "  }",
    "",
    "  for row in near {",
    "    mine := wordsOf(row.said)",
    "    for cell in cells {",
    `      if run(mine, cell) >= ${most} {`,
    "        matches = append(matches, {",
    "          begin: row.begin,",
    "          end: row.end,",
    '          message: "This line says again what a cell of the table beside it holds. Cut it, and let the table carry it."',
    "        })",
    "        break",
    "      }",
    "    }",
    "  }",
    "}",
  ];
}
