// The three word lists, read into the set a paragraph writes and the swaps a
// refusal teaches. The core is the words the standard and the corpus admit,
// the terms are this tree's own words with the note defining each, and the
// swaps hand a refused word its core word. The projection inlines all three
// into one rule, so a term lands on the list and the next write reads it.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]

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
