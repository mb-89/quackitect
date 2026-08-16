// el-coupling-disposer (fn-run-a-governed-walk.rank-candidate-couplings,
// fn-run-a-governed-walk.record-a-coupling-disposition).
// Not yet built — i15 M7. tests/coupling-rank.test.ts asserts the real
// shape and is red until this lands. The disposition half is verified by
// inspection (tsp-coupling-disposition), not by a case here.

export interface RankedCandidate {
  id: string;
  score: number;
}

export function rankCandidateCouplings(_root: string, _changeDescription: string): RankedCandidate[] {
  throw new Error("rankCandidateCouplings: not yet built (i15 M7, tsp-coupling-rank)");
}

export type DispositionStatus = "pending" | "accepted" | "rejected";

export interface DispositionRow {
  candidate: string;
  status: DispositionStatus;
}

export function recordCouplingDisposition(_root: string, _candidates: RankedCandidate[]): DispositionRow[] {
  throw new Error("recordCouplingDisposition: not yet built (i15 M7, tsp-coupling-disposition)");
}
