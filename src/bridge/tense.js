// The tense reader. Vale tags a verb with a small tagger and reads a present
// form like set, put or straight as past at a line start. wink-nlp reads the
// line whole, with a lemma a token, so one veto stands over Vale's finding: a
// form that is its own lemma, or its -s or -ing form, is present on its face,
// and the finding falls. What Vale still finds is narration, or a participle
// its exceptions name.
// [[spec/design_output/level0#the-tense-reader]]

import model from "wink-eng-lite-web-model";
import winkNLP from "wink-nlp";

const nlp = winkNLP(model);
const its = nlp.its;
const PAST = "PastTense";

// Vale's findings, less the past tense ones the line reads as present.
export function withoutFalsePast(text, found) {
  const lines = String(text ?? "").split("\n");
  return (found ?? []).filter((one) => {
    if (!String(one?.rule ?? "").endsWith(PAST)) return true;
    const line = lines[Number(one.line) - 1] ?? "";
    return readsAsPast(line, String(one.said ?? ""));
  });
}

// The word, read in its line: past unless its form is present on its face.
export function readsAsPast(line, word) {
  const wanted = word.trim().toLowerCase();
  if (!wanted) return true;
  let past = true;
  nlp
    .readDoc(line)
    .tokens()
    .each((token) => {
      if (token.out().toLowerCase() !== wanted) return;
      past = isPast({ word: token.out(), lemma: token.out(its.lemma) });
    });
  return past;
}

// A form that is neither its lemma nor its -s nor its -ing form.
function isPast(token) {
  const word = token.word.toLowerCase();
  const lemma = String(token.lemma ?? "").toLowerCase();
  if (!lemma || word === lemma) return false;
  if (word.endsWith("ing")) return false;
  const third = [`${lemma}s`, `${lemma}es`, lemma.replace(/y$/, "ies")];
  return !third.includes(word);
}

// The line a finding stands in, for the refusal to quote.
export function withContext(text, found) {
  const lines = String(text ?? "").split("\n");
  return (found ?? []).map((one) => ({
    ...one,
    context: (lines[Number(one.line) - 1] ?? "").trim(),
  }));
}
