// THE RANKER, in one place. Two callers rank text against a query: the
// coupling proposer and se_help. They had one implementation between them and
// only the proposer could reach it, so the help verb counted overlapping words
// by hand and called that a score.
//
// WHAT COUNTING WORDS GETS WRONG. Every word weighs the same, so a query
// landing on "the" scores exactly as well as one landing on "park". Length is
// ignored, so a long document wins by having more chances to coincide. BM25
// fixes both: a term appearing everywhere is worth nearly nothing, and a
// document is measured against the average length rather than in isolation.

/** How much a repeated term keeps adding. The standard value. */
const K1 = 1.5;
/** How hard length is penalised. The standard value. */
const B = 0.75;

/** Words carrying no search intent. Left in, a nonsense query scores on them
 *  alone across a corpus this size. */
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "from",
  "as",
  "and",
  "or",
  "but",
  "nor",
  "so",
  "if",
  "then",
  "than",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "not",
  "no",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
]);

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOPWORDS.has(w));
}

export interface RankDoc {
  id: string;
  terms: string[];
}

export interface Ranked {
  id: string;
  score: number;
}

/** HOW MANY DOCUMENTS EACH QUERY TERM LIVES IN. Exposed because a caller
 *  deciding whether an answer is relevant AT ALL needs to know which of the
 *  matched terms were rare, and the score alone cannot say. */
export function docFrequency(query: string[], docs: RankDoc[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const term of new Set(query)) {
    let n = 0;
    for (const d of docs) if (d.terms.includes(term)) n += 1;
    df.set(term, n);
  }
  return df;
}

/** Rank every document against the query, best first.
 *
 *  A FIELD BOOST IS A REPEATED TERM. A caller wanting a title to count for
 *  more than the body puts the title's words into `terms` several times. That
 *  is the ordinary way to express a boost here, and it needs no extra
 *  parameter. */
export function bm25(query: string[], docs: RankDoc[], threshold = 0.01): Ranked[] {
  const N = docs.length;
  if (N === 0 || query.length === 0) return [];
  const avgdl = docs.reduce((sum, d) => sum + d.terms.length, 0) / N;
  const df = docFrequency(query, docs);
  const scored: Ranked[] = [];
  for (const d of docs) {
    let score = 0;
    for (const term of query) {
      const n = df.get(term) ?? 0;
      if (n === 0) continue;
      const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);
      let f = 0;
      for (const t of d.terms) if (t === term) f += 1;
      if (f === 0) continue;
      score += (idf * (f * (K1 + 1))) / (f + K1 * (1 - B + (B * d.terms.length) / avgdl));
    }
    if (score > threshold) scored.push({ id: d.id, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}
