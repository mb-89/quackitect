// el-coupling-disposer (fn-run-a-governed-walk.rank-candidate-couplings,
// fn-run-a-governed-walk.record-a-coupling-disposition). dsp-coupling-disposer.

import { loadTrace } from "./trace.ts";

export interface RankedCandidate {
  id: string;
  score: number;
}

const K1 = 1.5;
const B = 0.75;
// Below this, a candidate is not proposed at all — req-bm25-below-threshold-returns-empty.
const THRESHOLD = 0.01;
// Common short words carry no relevance and, on a small corpus, can push a
// score above THRESHOLD on overlap alone. Filtering them is standard BM25
// practice, not a project-specific tuning knob.
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "this",
  "that",
  "it",
  "as",
  "by",
  "from",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => !STOPWORDS.has(t));
}

function bm25(query: string[], docs: { id: string; terms: string[] }[]): RankedCandidate[] {
  const N = docs.length;
  if (N === 0 || query.length === 0) return [];
  const avgdl = docs.reduce((sum, d) => sum + d.terms.length, 0) / N;
  const df = new Map<string, number>();
  for (const term of new Set(query)) df.set(term, docs.filter((d) => d.terms.includes(term)).length);
  const scored = docs.map((d) => {
    let score = 0;
    for (const term of query) {
      const n = df.get(term) ?? 0;
      if (n === 0) continue;
      const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);
      const f = d.terms.filter((t) => t === term).length;
      score += (idf * (f * (K1 + 1))) / (f + K1 * (1 - B + (B * d.terms.length) / avgdl));
    }
    return { id: d.id, score };
  });
  return scored.filter((s) => s.score > THRESHOLD).sort((a, b) => b.score - a.score);
}

export function rankCandidateCouplings(root: string, changeDescription: string): RankedCandidate[] {
  const corpus = loadTrace(root);
  const docs = corpus.map((n) => ({ id: n.id, terms: tokenize(n.hay ?? `${n.id} ${n.statement}`) }));
  return bm25(tokenize(changeDescription), docs);
}

export type DispositionStatus = "pending" | "accepted" | "rejected";

export interface DispositionRow {
  candidate: string;
  status: DispositionStatus;
}
