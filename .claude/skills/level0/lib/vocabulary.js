// The word list, read into the set a paragraph writes and the swaps a refusal
// teaches. The projection inlines both into one rule, so a word lands on the
// list and the next write reads it.
// [[spec/funnel/a-paragraph-has-a-schema]]

// [[spec/funnel/a-paragraph-has-a-schema]]
export const LIST = "spec/vocabulary/words.yml";

// [[spec/funnel/a-paragraph-has-a-schema]]
export const SESSION = "session";

const WORD = /^[a-z][a-z-]*$/;

// [[spec/funnel/a-paragraph-has-a-schema]]
export function pathOf(said) {
  const held = said?.layers?.vocabulary?.words;
  return typeof held === "string" && held.trim() ? held.trim() : "";
}

// [[spec/funnel/a-paragraph-has-a-schema]]
export function entriesOf(said) {
  const rows = Array.isArray(said?.words) ? said.words : [];
  return rows
    .filter((one) => one && typeof one === "object")
    .map((one) => ({
      word: lower(one.word),
      from: lower(one.from),
      meaning: String(one.meaning ?? "").trim(),
      insteadOf: [one.insteadOf ?? []].flat().map((each) => lower(each)),
    }))
    .filter((one) => WORD.test(one.word));
}

// [[spec/funnel/a-paragraph-has-a-schema]]
export function wordsOf(said) {
  const out = new Set();
  for (const one of entriesOf(said)) {
    for (const part of one.word.split("-")) {
      if (part) out.add(part);
    }
  }
  return [...out].sort();
}

// A swap hands the writer the better word. [[spec/funnel/a-paragraph-has-a-schema]]
export function swapsOf(said) {
  const out = new Map();
  const held = new Set(wordsOf(said));
  for (const one of entriesOf(said)) {
    for (const each of one.insteadOf) {
      if (!WORD.test(each) || held.has(each) || out.has(each)) continue;
      out.set(each, one.word);
    }
  }
  return new Map([...out].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
}

// [[spec/funnel/a-paragraph-has-a-schema]]
export function addedIn(said) {
  return entriesOf(said).filter((one) => one.from === SESSION);
}

function lower(said) {
  return String(said ?? "")
    .trim()
    .toLowerCase();
}
