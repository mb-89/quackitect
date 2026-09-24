// The word lists, read into the set a paragraph writes and the swaps a refusal
// teaches. The projection inlines them into one rule, so a term lands on the
// list and the next write reads it.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]

import { grouped, left, pattern, prelude, quoted, scripted } from "./snippets.js";

export const CORE = "spec/vocabulary/core.yml";
export const TERMS = "spec/vocabulary/terms.yml";
export const SWAPS = "spec/vocabulary/swaps.yml";

const WORD = /^[a-z][a-z-]*( [a-z][a-z-]*)*$/;
// A part shorter than this stands, in the check and in the rule alike. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
const SHORTEST = 3;

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function pathsOf(said) {
  const layer = said?.layers?.vocabulary ?? {};
  const one = (key, fallback) => {
    const held = layer[key];
    return typeof held === "string" && held.trim() ? held.trim() : fallback;
  };
  return {
    core: one("core", CORE),
    terms: one("terms", TERMS),
    swaps: one("swaps", SWAPS),
  };
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function coreOf(said) {
  return rowsOf(said?.words)
    .map((one) => ({
      word: lower(one.word),
      pos: String(one.pos ?? "").trim(),
      from: lower(one.from),
    }))
    .filter((one) => WORD.test(one.word));
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function termsOf(said) {
  return rowsOf(said?.terms)
    .map((one) => ({
      word: lower(one.word),
      means: String(one.means ?? "").trim(),
      source: String(one.source ?? "").trim(),
    }))
    .filter((one) => WORD.test(one.word));
}

// A swap wins over the corpus, so a swapped word stands on no list. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function wordsOf(lists) {
  const out = new Set();
  const swapped = swapsOf(lists);
  const take = (word) => {
    for (const part of word.split(/[ -]/)) {
      if (part && !swapped.has(part)) out.add(part);
    }
  };
  for (const one of coreOf(lists?.core)) take(one.word);
  for (const one of termsOf(lists?.terms)) take(one.word);
  return [...out].sort();
}

// A swap hands the writer the core word. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function swapsOf(lists) {
  const out = new Map();
  for (const one of rowsOf(lists?.swaps?.swaps)) {
    const word = lower(one.word);
    const write = lower(one.write);
    if (!WORD.test(word) || !write || out.has(word)) continue;
    out.set(word, write);
  }
  return new Map([...out].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
}

// Each row holds an ending and what takes its place, where a dash drops one more letter, and the rule and the check both read it. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export const ENDINGS = [
  { end: "ies", to: ["y"] },
  { end: "es", to: ["", "e"] },
  { end: "s", to: [""] },
  { end: "ied", to: ["y"] },
  { end: "ed", to: ["", "e", "-"] },
  { end: "ing", to: ["", "e", "-"] },
  { end: "ves", to: ["f", "fe"] },
  { end: "ily", to: ["y"], long: true },
  { end: "ly", to: ["", "e"], long: true },
  { end: "er", to: ["", "e"], long: true },
  { end: "est", to: ["", "e"], long: true },
  { end: "able", to: ["", "e"], long: true },
  { end: "ible", to: ["", "e"], long: true },
  { end: "less", to: [""], long: true },
  { end: "most", to: [""], long: true },
];

const DROP = "-";

// The shortest word a row reads, and the letters a stem cuts. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
function overOf(row) {
  return row.end.length + (row.long ? 1 : 0);
}

function cutOf(row, to) {
  return row.end.length + (to === DROP ? 1 : 0);
}

function addOf(to) {
  return to === DROP ? "" : to;
}

// A prefix on a listed word stands too: unread, rerun, misread, outlive. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export const PREFIXES = ["un", "re", "mis", "out", "over", "non", "pre", "sub"];

// The table read in JavaScript, for a check outside the rule. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export function knownIn(held) {
  const listed = (w) =>
    held.has(w) ||
    ENDINGS.some(
      (row) =>
        w.length > overOf(row) &&
        w.endsWith(row.end) &&
        row.to.some((to) => held.has(w.slice(0, w.length - cutOf(row, to)) + addOf(to))),
    );
  return (w) =>
    listed(w) ||
    PREFIXES.some(
      (pre) => w.length > pre.length + 2 && w.startsWith(pre) && listed(w.slice(pre.length)),
    );
}

// The table read as the Tengo the rule runs. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
function endingLines() {
  const out = [];
  for (const row of ENDINGS) {
    out.push(`  if n > ${overOf(row)} && text.has_suffix(w, ${quoted(row.end)}) {`);
    for (const to of row.to) {
      const cut = `w[:n-${cutOf(row, to)}]`;
      const stem = addOf(to) ? `${cut} + ${quoted(addOf(to))}` : cut;
      out.push(`    if inside[${stem}] != undefined { return true }`);
    }
    out.push("  }");
  }
  return out;
}

// Every word of a means line the lists leave out, one row a term. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function looseMeanings(lists) {
  const known = knownIn(new Set(wordsOf(lists)));
  const out = [];
  for (const one of termsOf(lists?.terms)) {
    const loose = one.means
      .toLowerCase()
      .split(/[^a-z-]+/)
      .flatMap((word) => word.split("-"))
      .filter((part) => part.length >= SHORTEST && !known(part));
    if (loose.length) out.push({ word: one.word, loose });
  }
  return out;
}

function rowsOf(said) {
  return (Array.isArray(said) ? said : []).filter(
    (one) => one && typeof one === "object",
  );
}

function lower(said) {
  return String(said ?? "")
    .trim()
    .toLowerCase();
}

// [[spec/design_output/projection#the-second-target]]
function pathOf(layer) {
  const said = String(layer?.terms ?? "").trim();
  return said || TERMS;
}

// The rule refuses a word the list leaves out. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export function vocabularyRule(layer, lists) {
  const words = wordsOf(lists);
  const swaps = swapsOf(lists);
  const where = pathOf(layer);
  const tail =
    "stands outside the words this tree writes. Write a core word, or add it to " +
    `${where} with one line that says what it means.`;

  return scripted(`A word ${tail}`, [
    ...prelude([], true, layer.prose),
    // [[spec/design_output/projection#the-second-target]]
    // A map literal this long overruns the Tengo stack. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "list := `",
    ...grouped(words),
    "`",
    "",
    "inside := {}",
    "for w in text.re_split(`\\s+`, list, -1) {",
    "  if len(w) > 0 { inside[w] = 1 }",
    "}",
    "",
    "roads := `",
    ...grouped([...swaps].map(([from, to]) => `${from}=${to}`)),
    "`",
    "",
    "swaps := {}",
    "for one in text.re_split(`\\s+`, roads, -1) {",
    '  pair := text.split(one, "=")',
    "  if len(pair) == 2 { swaps[pair[0]] = pair[1] }",
    "}",
    "",
    // [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "listed := func(w) {",
    "  if inside[w] != undefined { return true }",
    "  n := len(w)",
    ...endingLines(),
    "  return false",
    "}",
    "",
    // A prefix on a listed word stands too: unread, rerun, misread, outlive. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "known := func(w) {",
    "  if listed(w) { return true }",
    `  for pre in [${PREFIXES.map(quoted).join(", ")}] {`,
    "    if len(w) > len(pre) + 2 && text.has_prefix(w, pre) && listed(w[len(pre):]) { return true }",
    "  }",
    "  return false",
    "}",
    "",
    "said := plain(scope)",
    "said = blanked(said, `(?m)^#{1,6} +`)",
    "said = blanked(said, `(?m)^[ \\t]*(?:[-*+]|[0-9]+[.)]) +`)",
    "said = blanked(said, `(?m)^[ \\t]*> ?`)",
    "said = blanked(said, `\\|`)",
    "said = blanked(said, `[*_]`)",
    ...left(layer).map((one) => `said = blanked(said, ${quoted(pattern(one))})`),
    "",
    // A capital past the first word names a thing. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "opens := func(at) {",
    "  i := at - 1",
    "  for i >= 0 {",
    "    c := said[i:i+1]",
    '    if c == " " || c == "\\t" || c == "\\n" { i-- ; continue }',
    '    if c == "." || c == "!" || c == "?" || c == ":" || c == ";" { return true }',
    "    return false",
    "  }",
    "  return true",
    "}",
    "",
    "found := text.re_find(`[A-Za-z][A-Za-z0-9'’-]*`, said, -1)",
    "if is_undefined(found) { found = [] }",
    "",
    "for one in found {",
    "  m := one[0]",
    "  w := m.text",
    "  if text.re_match(`[0-9_]`, w) { continue }",
    "  head := w[0:1]",
    "  if head != text.to_lower(head) && !opens(m.begin) { continue }",
    // One letter names a key, a column or a label. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "  if len(w) == 1 { continue }",
    "",
    "  low := text.to_lower(w)",
    '  low = text.trim_suffix(low, "\'s")',
    '  low = text.trim_suffix(low, "’s")',
    '  if text.contains(low, "\'") || text.contains(low, "’") { continue }',
    "",
    '  bad := ""',
    '  for part in text.split(low, "-") {',
    "    p := text.trim_space(part)",
    // A prefix such as re- or co- stands on no list. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    `    if len(p) < ${SHORTEST} { continue }`,
    "    if known(p) { continue }",
    "    bad = p",
    "    break",
    "  }",
    '  if bad == "" { continue }',
    "",
    "  road := swaps[bad]",
    '  say := bad + " stands outside the words this tree writes. "',
    "  if road != undefined {",
    '    say += "Write " + road + " instead."',
    "  } else {",
    `    say += ${quoted("Write a core word, or add ")} + bad +`,
    `      ${quoted(` to ${where} with one line that says what it means.`)}`,
    "  }",
    "  matches = append(matches, {begin: m.begin, end: m.end, message: say})",
    "}",
  ]);
}
