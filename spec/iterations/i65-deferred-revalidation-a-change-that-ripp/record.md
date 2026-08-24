---
id: i65-deferred-revalidation-a-change-that-ripp
status: seeded
opened: 2026-08-24T18:13:58.672Z
goal: "Deferred revalidation: a change that ripples upward stops greying everything downstream. Standing claims are assumed to hold, a separate check tests them while the walk continues, and the next gate decides what actually reopens."
vision: "TODAY. A reopen says the work is wrong. The claim goes grey, its form is owed again, and everything downstream falls with it. That is correct and it is expensive: one upward ripple stops the walk and re-owes work that may well still stand.\n\nTHE CHANGE. Do not invalidate on contact. Assume the standing claims still hold, let the walk continue, and run a SEPARATE CHECK asking whether the change actually broke any of them. The two meet at the NEXT GATE, and the gate decides what reopens.\n\nA CLAIM THEREFORE NEEDS A THIRD STANDING. Not green and not grey, but SUSPECT, PENDING CHECK. That is the bulk of the work and it is why this is its own iteration rather than a rider on i64: it touches the gate, the drift check, and every place a claim's standing is read.\n\nWHO RUNS THE CHECK. The orchestrator from i64, and it is the right home for three reasons.\n\n- It is IDLE BY CONSTRUCTION while its worker walks, so the check costs almost nothing extra.\n- It has CONTINUITY across segments, which a per-segment worker does not.\n- The job is BOUNDED AND CITABLE: read the change, read the standing claim, say whether it still holds.\n\nTHAT THIRD REASON MATTERS MORE THAN IT LOOKS. An orchestrator reviewing a worker's summary cannot satisfy contract rule 5, which says a verdict cites the sentence it rests on, in the thing it is about. Revalidation is not that job. It reads the claim and the change, both on disk, and never needs the worker's deliberation. So the objection that kills orchestrator-as-reviewer does not apply to orchestrator-as-revalidator.\n\nWHY IT DEPENDS ON i18. The check has to know WHICH standing claims a change could have broken, and that set is the downstream cone. i18 computes it. Building this first would mean computing a second, worse cone by hand.\n\nTHE RULE THIS DESIGN STILL OWES, and it should be settled before anything is built. WHAT DOES THE GATE DO WHEN THE TWO DISAGREE? The worker built on a claim; the check says that claim broke. Who wins, and what happens to the work that was already built on it? Answering that changes what the suspect standing has to STORE, so it is a motivation-stage question rather than an implementation detail.\n\nA SECOND QUESTION RIDES WITH IT. If a claim is suspect and the walk passed a gate while it was still suspect, is that gate's bless sound? The current model has a clean answer because nothing is ever suspect. This one has to state its own.\n\nWHAT ALREADY STANDS IN THE CORPUS, and none of it should be re-derived. req-a-reopen-stands-where-it-can-work, req-an-amend-leaves-the-tree-standing, and the seam between an amend and a reopen recorded in guidance/refusals.md under SE-C-112: an amend corrects a claim that still stands and keeps the signature, a reopen says the work is wrong and everything downstream falls.\n\nTWO KNOWN ISSUES ARE ABOUT EXACTLY THIS COST. raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back, and raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed.\n\nPROVENANCE. Owner's design, 2026-08-24, in their own framing: when a change ripples upward we do not automatically de-validate everything, the walker continues its walk, an agent checks whether everything is still valid, and both meet at the next gate where it is decided whether to reopen."
inputs:
  - "req-a-reopen-stands-where-it-can-work"
  - "req-an-amend-leaves-the-tree-standing"
  - "raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back"
  - "raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed"
  - "opt-a-row-s-difficulty-tracks-its-own-reopen-history"
  - "tsp-claims-and-drift"
  - "spec/trace/design-spec/dsp-walk-machine.md"
depends_on:
  - "i64-the-diamond-and-the-orchestrator-handove"
  - "i18-the-blast-radius-compute-the-downstream-"
---

# i65-deferred-revalidation-a-change-that-ripp

## Goal

Deferred revalidation: a change that ripples upward stops greying everything downstream. Standing claims are assumed to hold, a separate check tests them while the walk continues, and the next gate decides what actually reopens.

## Rough vision

TODAY. A reopen says the work is wrong. The claim goes grey, its form is owed again, and everything downstream falls with it. That is correct and it is expensive: one upward ripple stops the walk and re-owes work that may well still stand.

THE CHANGE. Do not invalidate on contact. Assume the standing claims still hold, let the walk continue, and run a SEPARATE CHECK asking whether the change actually broke any of them. The two meet at the NEXT GATE, and the gate decides what reopens.

A CLAIM THEREFORE NEEDS A THIRD STANDING. Not green and not grey, but SUSPECT, PENDING CHECK. That is the bulk of the work and it is why this is its own iteration rather than a rider on i64: it touches the gate, the drift check, and every place a claim's standing is read.

WHO RUNS THE CHECK. The orchestrator from i64, and it is the right home for three reasons.

- It is IDLE BY CONSTRUCTION while its worker walks, so the check costs almost nothing extra.
- It has CONTINUITY across segments, which a per-segment worker does not.
- The job is BOUNDED AND CITABLE: read the change, read the standing claim, say whether it still holds.

THAT THIRD REASON MATTERS MORE THAN IT LOOKS. An orchestrator reviewing a worker's summary cannot satisfy contract rule 5, which says a verdict cites the sentence it rests on, in the thing it is about. Revalidation is not that job. It reads the claim and the change, both on disk, and never needs the worker's deliberation. So the objection that kills orchestrator-as-reviewer does not apply to orchestrator-as-revalidator.

WHY IT DEPENDS ON i18. The check has to know WHICH standing claims a change could have broken, and that set is the downstream cone. i18 computes it. Building this first would mean computing a second, worse cone by hand.

THE RULE THIS DESIGN STILL OWES, and it should be settled before anything is built. WHAT DOES THE GATE DO WHEN THE TWO DISAGREE? The worker built on a claim; the check says that claim broke. Who wins, and what happens to the work that was already built on it? Answering that changes what the suspect standing has to STORE, so it is a motivation-stage question rather than an implementation detail.

A SECOND QUESTION RIDES WITH IT. If a claim is suspect and the walk passed a gate while it was still suspect, is that gate's bless sound? The current model has a clean answer because nothing is ever suspect. This one has to state its own.

WHAT ALREADY STANDS IN THE CORPUS, and none of it should be re-derived. req-a-reopen-stands-where-it-can-work, req-an-amend-leaves-the-tree-standing, and the seam between an amend and a reopen recorded in guidance/refusals.md under SE-C-112: an amend corrects a claim that still stands and keeps the signature, a reopen says the work is wrong and everything downstream falls.

TWO KNOWN ISSUES ARE ABOUT EXACTLY THIS COST. raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back, and raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed.

PROVENANCE. Owner's design, 2026-08-24, in their own framing: when a change ripples upward we do not automatically de-validate everything, the walker continues its walk, an agent checks whether everything is still valid, and both meet at the next gate where it is decided whether to reopen.

## Inputs

- req-a-reopen-stands-where-it-can-work
- req-an-amend-leaves-the-tree-standing
- raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back
- raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed
- opt-a-row-s-difficulty-tracks-its-own-reopen-history
- tsp-claims-and-drift
- spec/trace/design-spec/dsp-walk-machine.md
