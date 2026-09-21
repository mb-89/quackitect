// The shape every projected rule wears, and the Tengo a script rule shares.
// The paragraph module hands over the values, and this one writes the frame:
// the head of a rule file, the helpers its script opens with, and the small
// quoting a rule needs.
// [[spec/design_output/projection#a-layer-writes-two-files]]

import { frontless } from "./helpers.js";

export const LINK = "spec/funnel/a-paragraph-has-a-schema.md";
export const WIDTH = { banner: 76, row: 72 };

// Vale hands a rule the whole file, frontmatter and all. A verb writes most of those fields and the schema rules them, so a prose rule blanks the block and keeps the fields the schema calls prose. [[spec/tickets/voice-rules-skip-the-record]]
export const FRONT = "said := frontless(scope)";

export function head(message, level = "error") {
  return [
    "extends: script",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    `level: ${level}`,
    "scope: raw",
    "script: |",
  ].join("\n");
}

export function scripted(message, lines) {
  return `${head(message)}\n${lines.map((one) => `  ${one}`.trimEnd()).join("\n")}\n`;
}

// [[spec/design_output/projection#what-stands-outside-a-layer]]
export function prelude(wanted, blanks = true, prose = []) {
  const held = new Map([...HELPERS, ["frontless", frontless(prose)]]);
  const names = blanks
    ? ["blanked", "frontless", "plain", ...wanted]
    : ["frontless", ...wanted];
  return [
    'text := import("text")',
    "",
    "matches := []",
    "",
    ...names.flatMap((name) => [...(held.get(name) ?? []), ""]),
  ];
}

const HELPERS = new Map([
  [
    "blanked",
    [
      "blanked := func(said, pattern) {",
      "  found := text.re_find(pattern, said, -1)",
      "  if is_undefined(found) { return said }",
      "  parts := []",
      "  at := 0",
      "  for one in found {",
      "    m := one[0]",
      "    parts = append(parts, said[at:m.begin])",
      '    parts = append(parts, text.repeat(" ", m.end - m.begin))',
      "    at = m.end",
      "  }",
      "  parts = append(parts, said[at:])",
      '  return text.join(parts, "")',
      "}",
    ],
  ],
  [
    "plain",
    [
      "plain := func(said) {",
      "  out := frontless(said)",
      '  out = blanked(out, "(?s)```.*?```")',
      "  out = blanked(out, `(?s)~~~.*?~~~`)",
      "  out = blanked(out, `(?s)<!--.*?-->`)",
      "  out = blanked(out, `(?m)^(?:\\t| {4,}).*$`)",
      // A span wraps over one line break at most, so a lone mark reaches no span past the next line. [[spec/tickets/a-lone-mark-pairs-wrong]]
      '  out = blanked(out, "`[^`\\n]*(?:\\n[^`\\n]*)?`")',
      "  out = blanked(out, `https?://[^\\s)]+`)",
      "  out = blanked(out, `\\[\\[[^\\]]*\\]\\]`)",
      "  out = blanked(out, `\\[[^\\]]*\\]\\([^)]*\\)`)",
      "  out = blanked(out, `[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+`)",
      "  return out",
      "}",
    ],
  ],
  [
    "rows",
    [
      "rows := func(said) {",
      "  out := []",
      "  at := 0",
      '  for line in text.split(frontless(said), "\\n") {',
      "    out = append(out, {said: line, begin: at, end: at + len(line)})",
      "    at += len(line) + 1",
      "  }",
      "  return out",
      "}",
    ],
  ],
  [
    "structure",
    [
      "structure := func(line) {",
      "  t := text.trim_space(line)",
      '  if text.has_prefix(t, "#") { return true }',
      '  if text.has_prefix(t, "|") { return true }',
      '  if text.has_prefix(t, ">") { return true }',
      '  if text.has_prefix(t, "- ") { return true }',
      '  if text.has_prefix(t, "* ") { return true }',
      '  if text.has_prefix(t, "+ ") { return true }',
      '  if text.has_prefix(t, "---") { return true }',
      "  if text.re_match(`^[0-9]+[.)] `, t) { return true }",
      "  if text.re_match(`^ {4,}[^ ]`, line) { return true }",
      "  return false",
      "}",
    ],
  ],
  [
    "words",
    [
      "words := func(said) {",
      "  n := 0",
      '  for one in text.split(said, " ") {',
      "    if len(text.trim_space(one)) > 0 { n = n + 1 }",
      "  }",
      "  return n",
      "}",
    ],
  ],
]);

export function quoted(said) {
  return JSON.stringify(String(said));
}

// [[spec/funnel/a-paragraph-has-a-schema]]
export function grouped(said, at = WIDTH.row) {
  const out = [];
  let row = "";
  for (const one of said) {
    if (row && `${row} ${one}`.length > at) {
      out.push(row);
      row = one;
      continue;
    }
    row = row ? `${row} ${one}` : one;
  }
  if (row) out.push(row);
  return out;
}

export function counted(message, scope, token, most) {
  return [
    "extends: occurrence",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    `scope: ${scope}`,
    `max: ${most}`,
    `token: '${token}'`,
    "",
  ].join("\n");
}

// [[spec/design_output/projection#the-grammar-rules]]
export function sequenced(message, heads, tag, left = []) {
  const said = heads.flatMap((head) => left.map((one) => `${head} ${one}`)).sort();
  return [
    "extends: sequence",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    "ignorecase: true",
    ...(said.length ? ["exceptions:", ...said.map((one) => `  - ${one}`)] : []),
    "tokens:",
    `  - pattern: '(?:${heads.join("|")})'`,
    "    tag: VB*",
    `  - tag: ${tag}`,
    "",
  ].join("\n");
}

export function swapped(message, pairs, how) {
  return [
    "extends: substitution",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    ...(how.ignorecase ? ["ignorecase: true"] : []),
    ...(how.nonword ? ["nonword: true"] : []),
    ...(how.replace ? ["action:", "  name: replace"] : []),
    "swap:",
    ...pairs.map(([from, to]) => `  ${single(from)}: ${JSON.stringify(to)}`),
    "",
  ].join("\n");
}

// [[spec/design_output/projection#the-grammar-rules]]
export function single(said) {
  return `'${String(said).split("'").join("''")}'`;
}

export function escaped(set) {
  return set
    .split("")
    .map((one) => `\\${one}`)
    .join("");
}

export function pattern(said) {
  return said.replace(/[\\^$.|?*+()[\]{}]/g, "\\$&");
}

// [[spec/design_output/projection#the-grammar-rules]]
export function left(layer) {
  return (layer?.exceptions ?? [])
    .map((one) => String(one?.word ?? one))
    .filter(Boolean);
}
