---
minted_in: i1
id: tsp-derivation-analysis
type: "[[test-spec]]"
statement: Every trace view derives from the node files alone and every reachable capability is covered, verified by analysis over the derivation chain.
method: analysis
verifies:
  - req-trace-view-derived-from-files
  - req-reachable-capability-is-traced
files:
  - none — the model below is the definition; the recorded analysis is the evidence
---

## Scope

Two claims no single run can settle: that no view holds truth of its
own, and that no reachable capability escapes the trace. Both are
arguments over the whole system, refreshed when the surfaces or the
offer change.

## Approach

Analysis at the verification state, recorded as a dated argument with
its inputs named.

## Model

- View derivation: enumerate every served view (the machine, the trace
  graph, the registers, the tables). For each, name the files it derives
  from and show the derivation path in the code. Acceptance: zero views
  holding truth that is not in a file; the stored-copy law's ratchets
  and tests cited as standing guards.
- Capability coverage: enumerate the live offer (idle's doors and every
  legal tool per state). For each capability, walk the trace: a use case
  reachable from it, and at least one requirement covering that use
  case. Acceptance: zero uncovered capabilities; each hole named as a
  finding.
