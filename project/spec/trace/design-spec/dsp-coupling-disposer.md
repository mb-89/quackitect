---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: dsp-coupling-disposer
type: "[[design-spec]]"
statement: Ranking candidate couplings and forcing a disposition on every one, carried by a BM25 pass and a disposition-row writer with no filter between them.
realizes:
  - el-coupling-disposer
files:
  - project/deliverable/engine/disposition.ts
---

## Responsibility

Two acts, split because they answer different questions (see the
function nodes' own Rationale): rank candidate nodes against a plain-words
change description, then write a `pending` disposition row for every
one of them, before any person looks at the list. No threshold, no
auto-classified band — raid-dec-i15-disposition-prepopulates-pending-rows
is the decision this design carries.

## Interface

```ts
rankCandidateCouplings(root: string, changeDescription: string): RankedCandidate[]
recordCouplingDisposition(root: string, candidates: RankedCandidate[]): DispositionRow[]
```

- `RankedCandidate` — `id`, `score`. Sorted highest first.
- `DispositionRow` — `candidate`, `status` (`pending` at creation; a
  later person act may move it).
- Both are currently stubs: throw until build-steps replaces the body.

## Behavior and constraints

- `rankCandidateCouplings` scores every corpus node against the
  description with BM25 (the requirement register names it
  specifically), returning candidates highest score first
  (req-bm25-returns-ranked-candidates). Below the relevance threshold,
  it returns `[]` explicitly, never omitting the response
  (req-bm25-below-threshold-returns-empty).
- `recordCouplingDisposition` takes the FULL ranked list with no
  filter, slice or threshold between input and write — every candidate
  gets exactly one row, stamped `pending` (req-bm25-candidates-need-disposition,
  verified by inspection at tsp-coupling-disposition rather than by a
  behavioural case).
- The two acts are sequence-coupled through `flow-candidate-list`,
  which crosses no element boundary — cluster-the-disposition's own
  DSM coupling — so no interface is owed between them inside this one
  element.

## Rationale

opt-prepopulate-pending-disposition-rows, chosen at
raid-dec-i15-disposition-prepopulates-pending-rows over
opt-probabilistic-threshold-classification (cand-continue-v1s-shape's
choice, scored 1/5 on req-a-wrong-act-never-passes-silently — a
miscalibrated threshold silently misclassifies a real coupling with
nobody positioned to catch it) and over
opt-block-candidates-before-individual-review
(cand-fast-path-plus-blocking's choice, one credible fix away from
tying the winner per raid-tripwire-i15-blocked-candidate-escape-hatch,
not chosen because that fix is not yet built).
