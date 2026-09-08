// The voice rules, declared once. The hooks module, the linter and the
// language server all read this file, so a rule is written in one place and
// every door says the same thing about it. See spec/guidance/voice.md.
//
// A rule carries `find`, which answers the spans it refuses in one text, and
// may carry `fix`, which rewrites a span. A rule with a fix is applied by
// `format`; a rule without one is reported and left to a person.

import { sentencesIn, wordsIn } from "./text.mjs";

export const MAX_SENTENCE_WORDS = 25;
export const MAX_PARAGRAPH_SENTENCES = 6;

const span = (text, index, length, said, instead) => ({
  said: said ?? text.slice(index, index + length),
  index,
  length,
  instead,
});

export const rules = [
  {
    name: "shouted-lead",
    why: "A paragraph opens plainly, so a reader meets the sentence rather than the shouting.",
    instead: "Write the opening as a sentence.",
    scope: "line",
    find(text) {
      const out = [];
      // Ten or more characters of capitals, closing on a stop or a comma. An
      // acronym inside a sentence is shorter than that and passes.
      for (const found of text.matchAll(/(^|(?<=[.!?]\s))([A-Z][A-Z0-9 ,'-]{9,})([.,:])/g)) {
        const at = found.index + found[1].length;
        out.push(span(text, at, found[2].length + found[3].length, undefined, sentenceCase(found[2]) + found[3]));
      }
      return out;
    },
    fix: (said) => sentenceCase(said.replace(/[.,:]$/, "")) + (said.match(/[.,:]$/)?.[0] ?? ""),
  },
  {
    name: "antithesis",
    why: "Say what is. A second half saying what it is not costs a reader a clause and teaches nothing.",
    instead: "Drop the half that says what the thing is not.",
    scope: "line",
    find(text) {
      const out = [];
      const shapes = [
        /\brather than\b/g,
        /\binstead of\b/g,
        /\band not\b/g,
        /\bis not a\b/g,
        /\bnever\b/g,
      ];
      for (const shape of shapes) {
        for (const found of text.matchAll(shape)) {
          out.push(span(text, found.index, found[0].length));
        }
      }
      return out;
    },
  },
  {
    name: "long-sentence",
    why: `A sentence holds ${MAX_SENTENCE_WORDS} words, so a reader takes it in one pass.`,
    instead: "Cut the sentence in two.",
    scope: "paragraph",
    find(text) {
      const out = [];
      let at = 0;
      for (const sentence of sentencesIn(text)) {
        const found = text.indexOf(sentence, at);
        const words = wordsIn(sentence).length;
        if (words > MAX_SENTENCE_WORDS && found >= 0) {
          out.push(span(text, found, sentence.length, sentence, `${words} words; hold it to ${MAX_SENTENCE_WORDS}.`));
        }
        if (found >= 0) at = found + sentence.length;
      }
      return out;
    },
  },
  {
    name: "long-paragraph",
    why: `A paragraph holds ${MAX_PARAGRAPH_SENTENCES} sentences. A table and a list are not paragraphs and are not counted.`,
    instead: "Break the paragraph.",
    scope: "paragraph",
    find(text) {
      const count = sentencesIn(text).length;
      if (count <= MAX_PARAGRAPH_SENTENCES) return [];
      return [span(text, 0, Math.min(text.length, 60), text.slice(0, 60),
        `${count} sentences; hold it to ${MAX_PARAGRAPH_SENTENCES}.`)];
    },
  },
  {
    name: "contraction",
    why: "Write both words. A contraction reads faster and translates worse.",
    instead: "Write the two words out.",
    scope: "line",
    find(text) {
      const out = [];
      for (const found of text.matchAll(/\b(\w+)(n't|'re|'ve|'ll|'s a|'s the)\b/g)) {
        const put = expand(found[0]);
        if (put) out.push(span(text, found.index, found[0].length, found[0], put));
      }
      return out;
    },
    fix: (said) => expand(said) ?? said,
  },
  {
    name: "latin-abbreviation",
    why: "Write it out. A Latin short form is one more thing a reader decodes.",
    instead: "Write the English words.",
    scope: "line",
    find(text) {
      const out = [];
      for (const found of text.matchAll(/\b(e\.g\.|i\.e\.|etc\.|viz\.|cf\.)/gi)) {
        out.push(span(text, found.index, found[0].length, found[0], latin(found[0])));
      }
      return out;
    },
    fix: (said) => latin(said),
  },
];

export const byName = new Map(rules.map((r) => [r.name, r]));

// The rules a person's own judgement settles, asked of the model rather than of
// a pattern. Measured 2026-09-08: $.model.classify answers "passive" for "The
// file was written by the engine" and "active" for "The engine writes the file".
export const judged = [
  {
    name: "passive",
    why: "Write in the active voice and name who acts.",
    instead: "Name the actor and put it in front of the verb.",
    labels: ["active", "passive"],
    refuses: "passive",
    ask: (sentence) =>
      `Is this sentence written in the active or the passive voice? Sentence: ${sentence}`,
  },
];

// Inside a run of capitals nothing tells an acronym from an ordinary word, so
// this lowers every word after the first and leaves an acronym for a person to
// restore. Guessing produced "This IS the important PART" and was worse.
function sentenceCase(said) {
  const words = said.trim().split(/\s+/);
  return words
    .map((w, i) => (i === 0 ? w[0] + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(" ");
}

function expand(said) {
  const known = {
    "n't": " not", "'re": " are", "'ve": " have", "'ll": " will",
  };
  const m = said.match(/^(\w+?)(n't|'re|'ve|'ll)$/);
  if (!m) return undefined;
  if (m[2] === "n't") {
    if (/^can$/i.test(m[1])) return m[1] + "not";
    if (/^wo$/i.test(m[1])) return (m[1][0] === "W" ? "Will" : "will") + " not";
    return m[1] + " not";
  }
  return m[1] + known[m[2]];
}

function latin(said) {
  const known = {
    "e.g.": "for example", "i.e.": "that is", "etc.": "and so on",
    "viz.": "namely", "cf.": "compare",
  };
  return known[said.toLowerCase()] ?? said;
}
