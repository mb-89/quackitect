// The tense reader: one veto over Vale's past tense finding, where the form
// is its own lemma or its -s or -ing form, and the line each fault stands in.
// [[spec/design_output/level0#the-tense-reader]]

import model from "wink-eng-lite-web-model";
import winkNLP from "wink-nlp";

const nlp = winkNLP(model);
const its = nlp.its;
const PAST = "PastTense";

export function withoutFalsePast(text, found) {
  const lines = String(text ?? "").split("\n");
  return (found ?? []).filter((one) => {
    if (!String(one?.rule ?? "").endsWith(PAST)) return true;
    const line = lines[Number(one.line) - 1] ?? "";
    return readsAsPast(line, String(one.said ?? ""));
  });
}

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

function isPast(token) {
  const word = token.word.toLowerCase();
  const lemma = String(token.lemma ?? "").toLowerCase();
  if (!lemma || word === lemma) return false;
  if (word.endsWith("ing")) return false;
  const third = [`${lemma}s`, `${lemma}es`, lemma.replace(/y$/, "ies")];
  return !third.includes(word);
}

export function withContext(text, found) {
  const lines = String(text ?? "").split("\n");
  return (found ?? []).map((one) => ({
    ...one,
    context: (lines[Number(one.line) - 1] ?? "").trim(),
  }));
}
