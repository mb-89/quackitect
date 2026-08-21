---
minted_in: i51-work-running-out-of-sight-reports-itself
id: el-work-registry
type: "[[element]]"
statement: Holds every piece of long work the session has started, and answers in one call what is still going, how much longer each piece needs, and what that figure rests on.
kind: new
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.account-for-work-out-of-sight
source_refs:
  - cand-the-account-that-follows-you
  - opt-one-operation-object-serves-every-kind-of-long-work
  - opt-the-figure-and-its-basis-are-two-fields
  - raid-dec-the-duration-and-its-basis-are-one-return-value
---

One place holds every operation. A shell job, a scoped test run and a step's
leaving judgment are three kinds of the same thing, and today they are held in
three places that cannot see each other.

## What it does

REGISTERS an operation when something starts long work. The entry carries its
kind, its identity, when it started, and where its own progress is written.

READS that progress back on demand. A kind that writes progress somewhere is
read there; a kind that writes nothing has no figure and says so.

COMPUTES a duration from what the entry knows, and returns the basis beside it.
A figure with no basis is never returned — the two are one value, per
[[raid-dec-the-duration-and-its-basis-are-one-return-value]].

KEEPS a finished operation with its outcome, so a caller that missed the moment
still learns what happened.

## States an entry moves through

- `running` — registered and not yet finished.
- `finished` — the outcome is in, and nobody has read it.
- `read` — the outcome has been handed to a caller.

An entry never leaves the registry inside one session. The account is the whole
list, not the tail of it.

## What crosses its boundary

- [[if-test-runner-to-work-registry]] — a scoped run registers itself and its
  progress file.
- [[if-walk-engine-to-work-registry]] — a step's leaving judgment registers
  itself.
- [[if-work-registry-to-walk-engine]] — the account goes back out through the
  door the caller already knocked on.

## Realization

The shell-job table this system already keeps is the seed. `jobList` in
`deliverable/engine/tools-run.ts` holds shell jobs today and holds nothing else;
this element is that table widened to every kind, plus the duration and its
basis.

The linear estimate over a run's own progress file is the first basis, measured
on this session's 175-file battery and recorded in
[[raid-asm-battery-timings-measure-work]]. It over-predicts throughout and
converges, which is the safe direction for somebody waiting.
