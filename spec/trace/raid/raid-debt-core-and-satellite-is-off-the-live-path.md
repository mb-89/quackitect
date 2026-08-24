---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-debt-core-and-satellite-is-off-the-live-path
type: "[[raid]]"
kind: debt
statement: The core and satellite cluster is built and tested, and nothing the running server imports reaches it.
owner: the driving agent
trigger: when the run mode is first flipped away from inline, or at the code-review iteration
status: open
looked: 2026-08-20
impact: A whole subsystem drifts from the engine it is meant to carry, and its green tests read as proof it works.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-fe9e091bfa4c
  - 570cdc66 — the levelling commit that brought all twelve files into this tree
last_looked: 2026-08-23
look_verdict: rescheduled
---

Eight files carry the core and satellite design. Six test files
exercise them. No file on the running path imports any of them.

The sweep found it, which is what the sweep is for. It surfaced as
twelve engine files no design spec claimed, at trace-design in i28.

WHY IT WAS NOT CUT. The guidance says an unclaimed file is usually cut.
This one is not dead work. It is a designed subsystem with tests, and
the run mode that switches it on is written. Cutting it throws away
work that is nearly wired.

WHAT IT COSTS WHILE IT STANDS. Green tests over unreachable code read
as proof the product works. They prove only that the cluster works
against itself. Every change to the live engine can move away from it
without any check noticing.

The spec is dsp-core-and-satellite, minted in the same pass so the
sweep has something true to point at. Its Standing section says plainly
that the cluster is off the live path.

## Repayment

ONE OF TWO ACTS, and both are the owner's call.

- WIRE IT. The live path goes through the crossing, so the tests that
  exercise the cluster start testing the running engine.
- CUT IT. The eight files and their six test files go, with the owner's
  word.

EITHER ONE ENDS THE DEBT. What may not stand is the third state it is
in now: green tests over code nothing reaches.

BEFORE EITHER, RECOVER i27's TRACE. The section below names the two
commits. Wiring or cutting against the hand-written spec would throw
away the measured design that already exists.

## i27 already wrote this trace, and the landing lost it

The spec in this tree was written by hand at i28's trace-design, to
give the sweep something true to point at. A far better one exists in
history and must be recovered before this one is trusted.

What to recover, and from where:

- Four design specs, at commit be703899. They are
  dsp-core-and-satellite, dsp-engine-delta, dsp-resolution-seam and
  dsp-satellite-lifecycle. Each carries measured numbers, the probes
  behind them and a rationale section.
- Five elements, at commit 6396c282. They are el-core, el-satellite,
  el-resolution-seam, el-engine-delta and el-satellite-supervisor.
- The interfaces those specs name in their realizes lists. About
  twenty-five of them, in the same two commits.

HOW IT WAS LOST. Commit 570cdc66 levelled this tree's method with
trunk and brought seventy-five files. The engine code came. The trace
nodes did not.

THIS IS note-f9d6dd98f126 HAPPENING AGAIN, and the note said it would:
a record ships its code and leaves its trace behind, because nothing
checks the trace after the landing. The note names the fix. A landing
runs the three trace-design laws against trunk.

RECOVERING IT IS NOT i28's WORK. i28 built the unattended entrypoint.
The hand-written spec here is a floor that keeps the sweep honest, and
it says so in its own Standing section.

## The trigger cannot fire as worded — 2026-08-17

THE TRIGGER SAYS: when the run mode is first flipped away from inline.

IT WILL NEVER SAY THAT. The owner ruled on 2026-08-14, recorded at the top of
engine/mode.ts, to make it multiprocess BY DEFAULT and flip from there. Inline
is the measurement baseline, not the starting point.

MEASURED TODAY: the aim result carries run mode `process`, stored `process`,
and `chosen: false`. So the live mode is already process, nobody chose it, and
no flip away from inline is pending or possible.

A TRIGGER THAT CANNOT FIRE IS A DEBT NOBODY RE-READS, which is the exact thing
the owner's 2026-08-12 ruling on the debt sweep exists to prevent. It survived
two sweeps because the wording reads plausible.

RE-AFFIRMED AS: the code-review iteration, or the first time a satellite is
actually launched.

AND THE SWEEP RAISED A SHARPER QUESTION THAN THE ROW ASKS. If the live run
mode reads `process` while no file on the running path imports the cluster,
then the mode setting may be inert — a control that reads back a value and
changes nothing. That is worse than this row states and it is not yet checked.
It is a lead for the code-review iteration, not a claim.

## Swept 2026-08-18, at i16's onboard-retro: RE-ACCEPTED, trigger unfired

THE RE-AFFIRMED TRIGGER IS "the code-review iteration, or the first time a
satellite is actually launched". Neither happened. The code-review iteration is
still only a parked note (note-fe9e091bfa4c) with no record seeded for it, so
half this trigger depends on work nobody has scheduled.

THE SHARPER QUESTION FROM THE LAST SWEEP IS STILL UNASKED: whether the run-mode
setting is inert. It was recorded as a lead rather than a claim and remains one.

The trigger stands unchanged.

## Sweep 2026-08-19, at i5's retro

RE-ACCEPTED. Neither trigger fired — the run mode is unchanged and the code-review iteration has not run. i5's own trace-design sweep touched the same seam from the other side: it found an interface node naming an element of a subsystem that had been cut wholesale ([[raid-iss-a-cut-subsystem-left-its-interface-node-behind]]). A subsystem off the live path leaves debris in the corpus as well as in the code.

## Swept 2026-08-19, at i9's onboard-retro: REPAID BY CUTTING, WITH TWO GAPS

THE SUBJECT IS GONE. At ref 570cdc66 the cluster was eight engine files and
six test files. At HEAD a glob for any of them returns zero, and one search for
the cluster's name across every TypeScript file hits only `bin/se-mcp.ts`. They
were already absent at ref 13cb0538, so the cut predates i16's ship.

SO THE STATE THIS ENTRY FORBIDS CANNOT EXIST ANY MORE. Green tests over
unreachable code need both, and neither survives.

TWO THINGS IT ASKED FOR DID NOT HAPPEN, and they are recorded rather than
quietly dropped.

- THE TRACE RECOVERY IT DEMANDED BEFORE EITHER OUTCOME was never done. The two
  design-spec nodes went with the code.
- NO EVIDENCE FILE RECORDS THE OWNER'S WORD ON THE CUT. The cut looks right and
  its authorisation is not written down anywhere this sweep could find.

THAT SECOND GAP IS THE ONE WORTH A DECISION. A cut nobody can point to an
authorisation for is indistinguishable from a cut nobody authorised.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.

