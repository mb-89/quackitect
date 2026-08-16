---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-check-too-slow-for-the-write-moves-to-the-sweep
type: "[[requirement]]"
statement: While a bound check cannot answer inside the write's time budget, the engine shall run it in the sweep and report, never in the write and never behind a flag the author can clear.
kind: constraint
verify_method: test
breaks_if_removed: A slow validator sits in the hot path. Somebody adds a flag to skip it, the flag is always set, and the checks become decoration. That is the failure every team that put a slow check in the write path has already had.
breaks_how_badly: fatal
refines:
  - uc-keep-the-corpus-sound-at-the-write
source_refs:
  - raid-asm-a-bound-check-runs-inside-the-write-budget
  - raid-iss-se-lint-has-no-whole-repo-sweep
  - req-call-answers-in-one-second
  - uc-keep-the-corpus-sound-at-the-write extension 3a
priority: must
---

## Detail

TWO STANDING DEMANDS PULL AGAINST EACH OTHER HERE, and the goal system
already ruled which wins.

`req-call-answers-in-one-second` covers every call, and a write is a
call. Conformance at the write costs time. THE SECOND WINS: a check that
makes a write slow is not a better check, it is a worse write verb.

## The three ways this can be got wrong, all ruled out

A FLAG THE AUTHOR CAN CLEAR. Rejected explicitly at
`raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus`. A
check that can be waved through is a report with extra steps, and under
deadline the flag is always off.

MAKING IT FASTER BY HOPING. A check whose cost is unmeasured is not
known to be fast. The number decides, and it is taken rather than
assumed.

DROPPING THE CHECK. The corpus-wide checks are half this iteration's
scope. Losing them because they do not fit one mechanism means losing
the goal to an implementation detail.

## Where the sweep actually runs, decided 2026-08-16

THREE MOMENTS, ALL THE ENGINE'S, AND NO VERB (owner ruling). A verb an
agent can call is a verb an agent will call, over and over — and the
whole reason this check left the write is that it costs too much to run
per write. So the engine decides when.

- EVERY BOOT, in `prepare_idle`'s exit beside preflight and the smoke
  test. Every session starts on a corpus somebody has read.
- LEAVING `sweep-consistency`, as that row's own exit script. The
  findings land in front of the state whose job is clearing them, and
  that row is `floor: true` — never struck at any size.
- A DOCUMENT-HEAVY TEST DECISION. `decideScope` already reads the diff to
  size a test run; a diff that is mostly prose and trace nodes is exactly
  what a battery says nothing about and the sweep says everything about.

IT BLOCKS AT THE FIRST TWO AND REPORTS AT THE THIRD. Riding a test run it
is news; leaving the state whose job was to clear it, it is a gate.

MEASURED: 1015 nodes in 388 ms, and six standing breaks on its first run
against the real corpus — every one of them predating the write guard,
which is exactly the class the sweep exists for.

## So the fallback is a place, not a compromise

THE SWEEP IS A REAL RUNNER AND IT IS IN SCOPE.
`raid-iss-se-lint-has-no-whole-repo-sweep` exists because `se_lint` takes
one file per call today while its own description already promises a
whole-repo pass.

A CHECK THAT MOVES THERE STILL RUNS. It reports rather than refusing,
which is what
`req-a-standing-break-reports-and-lands` demands of a corpus-wide subject
anyway.

## What the budget is

THE ONE-SECOND RULE ALREADY IN FORCE, not a new number. A write is a
call and the rule covers calls.

THE MEASUREMENT IS TAKEN AT THE FIRST BUILD CHUNK, on the cheapest
possible check — one that parses only the incoming bytes and reads no
corpus. If that one does not fit, no bound check does, and the
architecture moves before code is committed to it.

## Behaviour

NO MODEL WANTED. It is a placement rule with two outcomes and no
sequence between them.
