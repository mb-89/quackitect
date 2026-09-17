// The word lists, read into the set a paragraph writes and the swaps a refusal
// teaches. The projection inlines them into one rule, so a term lands on the
// list and the next write reads it.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]

import { grouped, left, pattern, prelude, quoted, scripted } from "./snippets.js";

export const CORE = "spec/vocabulary/core.yml";
export const TERMS = "spec/vocabulary/terms.yml";
export const SWAPS = "spec/vocabulary/swaps.yml";

const WORD = /^[a-z][a-z-]*( [a-z][a-z-]*)*$/;
const LINK = /^\[\[[^\]\s]+\]\]$/;

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function pathsOf(said) {
  const layer = said?.layers?.vocabulary ?? {};
  const one = (key, fallback) => {
    const held = layer[key];
    return typeof held === "string" && held.trim() ? held.trim() : fallback;
  };
  return { core: one("core", CORE), terms: one("terms", TERMS), swaps: one("swaps", SWAPS) };
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function coreOf(said) {
  return rowsOf(said?.words)
    .map((one) => ({ word: lower(one.word), pos: String(one.pos ?? "").trim(), from: lower(one.from) }))
    .filter((one) => WORD.test(one.word));
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function termsOf(said) {
  return rowsOf(said?.terms)
    .map((one) => ({ word: lower(one.word), defines: String(one.defines ?? "").trim() }))
    .filter((one) => WORD.test(one.word));
}

// A term with no defining note is jargon. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function undefinedTerms(said) {
  return termsOf(said).filter((one) => !LINK.test(one.defines));
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

function rowsOf(said) {
  return (Array.isArray(said) ? said : []).filter((one) => one && typeof one === "object");
}

function lower(said) {
  return String(said ?? "")
    .trim()
    .toLowerCase();
}

// [[spec/funnel/a-paragraph-has-a-schema]]
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
    `${where} with the note that defines it.`;

  return scripted(`A word ${tail}`, [
    ...prelude([]),
    // [[spec/funnel/a-paragraph-has-a-schema]]
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
    // A plural, a past form and an -ing form stand in. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "listed := func(w) {",
    "  if inside[w] != undefined { return true }",
    "  n := len(w)",
    '  if n > 3 && text.has_suffix(w, "ies") {',
    '    if inside[w[:n-3] + "y"] != undefined { return true }',
    "  }",
    '  if n > 2 && text.has_suffix(w, "es") {',
    "    if inside[w[:n-2]] != undefined { return true }",
    "    if inside[w[:n-1]] != undefined { return true }",
    "  }",
    '  if n > 1 && text.has_suffix(w, "s") {',
    "    if inside[w[:n-1]] != undefined { return true }",
    "  }",
    '  if n > 3 && text.has_suffix(w, "ied") {',
    '    if inside[w[:n-3] + "y"] != undefined { return true }',
    "  }",
    '  if n > 2 && text.has_suffix(w, "ed") {',
    "    if inside[w[:n-2]] != undefined { return true }",
    "    if inside[w[:n-1]] != undefined { return true }",
    "    if inside[w[:n-3]] != undefined { return true }",
    "  }",
    '  if n > 3 && text.has_suffix(w, "ing") {',
    "    if inside[w[:n-3]] != undefined { return true }",
    '    if inside[w[:n-3] + "e"] != undefined { return true }',
    "    if inside[w[:n-4]] != undefined { return true }",
    "  }",
    // An adverb, a comparative, an -able and a -less form stand in too. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    '  if n > 3 && text.has_suffix(w, "ves") {',
    '    if inside[w[:n-3] + "f"] != undefined { return true }',
    '    if inside[w[:n-3] + "fe"] != undefined { return true }',
    "  }",
    '  if n > 4 && text.has_suffix(w, "ily") {',
    '    if inside[w[:n-3] + "y"] != undefined { return true }',
    "  }",
    '  if n > 3 && text.has_suffix(w, "ly") {',
    "    if inside[w[:n-2]] != undefined { return true }",
    '    if inside[w[:n-2] + "e"] != undefined { return true }',
    "  }",
    '  if n > 3 && text.has_suffix(w, "er") {',
    "    if inside[w[:n-2]] != undefined { return true }",
    "    if inside[w[:n-1]] != undefined { return true }",
    "  }",
    '  if n > 4 && text.has_suffix(w, "est") {',
    "    if inside[w[:n-3]] != undefined { return true }",
    "    if inside[w[:n-2]] != undefined { return true }",
    "  }",
    '  if n > 5 && (text.has_suffix(w, "able") || text.has_suffix(w, "ible")) {',
    "    if inside[w[:n-4]] != undefined { return true }",
    '    if inside[w[:n-4] + "e"] != undefined { return true }',
    "  }",
    '  if n > 5 && (text.has_suffix(w, "less") || text.has_suffix(w, "most")) {',
    "    if inside[w[:n-4]] != undefined { return true }",
    "  }",
    "  return false",
    "}",
    "",
    // A prefix on a listed word stands too: unread, rerun, misread, outlive. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    "known := func(w) {",
    "  if listed(w) { return true }",
    '  for pre in ["un", "re", "mis", "out", "over", "non", "pre", "sub"] {',
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
    "    if len(p) < 3 { continue }",
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
    `      ${quoted(` to ${where} with the note that defines it.`)}`,
    "  }",
    "  matches = append(matches, {begin: m.begin, end: m.end, message: say})",
    "}",
  ]);
}
