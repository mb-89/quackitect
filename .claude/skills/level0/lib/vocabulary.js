// The word lists, read into the set a paragraph writes and the swaps a refusal
// teaches. A list holding a word writes the vocabulary rule's head, and the Go
// rules read the lists themselves, so a term lands and the next write reads it.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]

import { scripted } from "./snippets.js";

export const CORE = "spec/vocabulary/core.yml";
export const TERMS = "spec/vocabulary/terms.yml";
export const SWAPS = "spec/vocabulary/swaps.yml";
export const STEMS = "spec/config/stems.yaml";

const WORD = /^[a-z][a-z-]*( [a-z][a-z-]*)*$/;
// A part shorter than this stands in the check. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
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
    // The layer holds a line of prose under stems, so the table takes a key of its own. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
    endings: one("endings", STEMS),
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

// A row names an ending and what takes its place: none cuts it, drop cuts one letter more. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
const NONE = "none";
const DROP = "drop";

// The table the lists hand in, one row an ending, and the prefixes. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export function stemsOf(said) {
  const endings = rowsOf(said?.endings)
    .map((one) => ({
      end: lower(one.end),
      to: (Array.isArray(one.to) ? one.to : []).map(lower).filter(Boolean),
      long: one.long === true,
    }))
    .filter((one) => one.end && one.to.length);
  const prefixes = (Array.isArray(said?.prefixes) ? said.prefixes : []).map(lower).filter(Boolean);
  return { endings, prefixes };
}

// The shortest word a row reads, and the letters a stem cuts. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
function overOf(row) {
  return row.end.length + (row.long ? 1 : 0);
}

function cutOf(row, to) {
  return row.end.length + (to === DROP ? 1 : 0);
}

function addOf(to) {
  return to === DROP || to === NONE ? "" : to;
}

// The table read in JavaScript, for a check outside the rule. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
export function knownIn(held, stems) {
  const listed = (w) =>
    held.has(w) ||
    stems.endings.some(
      (row) =>
        w.length > overOf(row) &&
        w.endsWith(row.end) &&
        row.to.some((to) => held.has(w.slice(0, w.length - cutOf(row, to)) + addOf(to))),
    );
  return (w) =>
    listed(w) ||
    stems.prefixes.some(
      (pre) => w.length > pre.length + 2 && w.startsWith(pre) && listed(w.slice(pre.length)),
    );
}

// Every word of a means line the lists leave out, one row a term. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function looseMeanings(lists) {
  const known = knownIn(new Set(wordsOf(lists)), stemsOf(lists?.stems));
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
export function vocabularyRule(layer) {
  const where = pathOf(layer);
  return scripted(
    "A word stands outside the words this tree writes. Write a core word, or add it to " +
      `${where} with one line that says what it means.`,
  );
}
