---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-debt-core-and-satellite-is-off-the-live-path
type: "[[raid]]"
kind: debt
statement: The core and satellite cluster is built and tested, and nothing the running server imports reaches it.
owner: the driving agent
trigger: when the run mode is first flipped away from inline, or at the code-review iteration
status: open
impact: A whole subsystem drifts from the engine it is meant to carry, and its green tests read as proof it works.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-fe9e091bfa4c
  - "570cdc66 — the levelling commit that brought all twelve files into this tree"
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
