---
minted_in: i3
id: raid-iss-scope-grew-past-a-signed-state
type: "[[raid]]"
kind: issue
statement: A signed upstream step does not reopen when scope grows below it. The rigor matrix moving reopens steps because the demand is measured; scope growing measures nothing, so a requirements state stays green while mechanisms are built past it.
owner: the owner
trigger: the next iteration whose scope grows after its requirements state signs
status: open
impact: Requirements get authored after their code. A row written afterwards describes what was built rather than what was needed, and the whole point of the milestone order is lost without anything going red.
breaks_how_badly: corrosive
how_likely: expected
probe: found by hand on 2026-08-13, by reading i3's register against what had actually been built. No mechanical check exists, and none was attempted.
probed: 2026-08-13
source_refs:
  - spec/iterations/i3-the-walk-s-feedback-loop-the-reading-cre/evidence/write-requirements.md — three rows at first signing, seven after the reopen
  - engine/session.ts driftReopen, which reopens on a MOVED DEMAND and nothing else
  - engine/iterations.ts movedDemands, which compares the matrix, not the scope
place: i65-deferred-revalidation-a-change-that-ripp
---

## What happened

i3's write-requirements signed at 08:32 with three rows.

Four mechanisms were built afterwards, each from a defect the owner met while
the iteration was running: the mechanical size read, the reopen frontier, the
placeholder entry guard, and the per-size field trim.

The walk carried straight through write-requirements on its standing claim,
because that claim was still true about the three rows it named.

Nothing was wrong with the claim. What was missing was any notion that the
delta had grown underneath it.

## Why the machine cannot see it

The reopen fires on a MOVED DEMAND. That is a comparison between the recorded
size ledger and the live rigor matrix, and it is exact.

Scope has no such ledger. There is no recorded statement of "this delta
contains six mechanisms" that a seventh could contradict.

So the machine is not failing a check here. It has no check to fail.

## Why it is likely rather than possible

Every iteration that runs long enough to meet a new defect will hit this. i3
hit it within one session, and the owner reported three separate defects
during the walk, each of which became work.

An iteration that never grows is one where nothing was learned while walking.

## What it is NOT

It is not an argument for freezing scope. The growth was correct every time:
the owner met a real defect and ruled it in.

It is an argument that the growth should REOPEN the requirements state, the
way a matrix move does.

## Candidate directions, none decided

- The scope field becomes a measured list, and adding to it reopens the
  register the way a moved demand does.
- The requirements state gains an exit condition that its register covers
  every design spec authored since it signed.
- Nothing mechanical, and the retro checks by hand each time.

The third is what happens today, except that nobody was checking.
