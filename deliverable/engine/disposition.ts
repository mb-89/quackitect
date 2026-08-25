// el-coupling-disposer (fn-run-a-governed-walk.rank-candidate-couplings,
// fn-run-a-governed-walk.record-a-coupling-disposition). dsp-coupling-disposer.

import { bm25, tokenize } from "./bm25.ts";
import { loadTrace } from "./trace.ts";

export interface RankedCandidate {
  id: string;
  score: number;
}

// Below this, a candidate is not proposed at all — req-bm25-below-threshold-returns-empty.
const THRESHOLD = 0.01;
export function rankCandidateCouplings(root: string, changeDescription: string): RankedCandidate[] {
  const corpus = loadTrace(root);
  const docs = corpus.map((n) => ({ id: n.id, terms: tokenize(n.hay ?? `${n.id} ${n.statement}`) }));
  return bm25(tokenize(changeDescription), docs, THRESHOLD);
}

export type DispositionStatus = "pending" | "accepted" | "rejected";

export interface DispositionRow {
  candidate: string;
  status: DispositionStatus;
}

// req-bm25-candidates-need-disposition, tsp-coupling-disposition. The root
// parameter is unused on purpose \u2014 nothing here may read a threshold, a
// filter or any other side channel that could drop a candidate before the
// write loop. Every candidate handed in gets exactly one row, stamped
// pending; only a person's later act may change that status
// (raid-dec-i15-disposition-prepopulates-pending-rows).
export function recordCouplingDisposition(_root: string, candidates: RankedCandidate[]): DispositionRow[] {
  return candidates.map((c) => ({ candidate: c.id, status: "pending" }));
}
