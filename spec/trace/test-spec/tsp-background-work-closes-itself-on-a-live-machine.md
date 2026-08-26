---
minted_in: i62-background-work-reports-its-own-end-the-
id: tsp-background-work-closes-itself-on-a-live-machine
type: "[[test-spec]]"
statement: An agent drives a real registry on a real machine, watches an entry close itself when its process dies, watches a wait reach its bound, and reads what the account says at each moment.
method: demonstration
demonstrates:
  - sty-the-run-that-died-while-nobody-was-holding-it
  - sty-the-wait-that-says-how-long-it-will-wait
verifies: none — demonstrates carries the edge; the requirements behind these two stories are verify method test and are carried by tsp-background-work-reports-its-own-end
files:
  - none — the procedure below is the definition, because the pass is what an agent reads back from a live registry rather than what an assertion reads
priority: must
source_refs:
  - uc-close-the-record-of-work-that-has-ended
  - uc-bound-every-wait-and-act-on-expiry
---

## Why demonstration and not test

THE TEST HALF IS ALREADY BUILT AND GREEN. Fifteen cases in
`deliverable/tests/work-lifecycle.test.ts` assert the behaviour piece by piece.

WHAT NO ASSERTION READS is what an agent driving the machine actually sees at
each moment of the story. A case knows which entry it opened and asserts on it
by name.

THE STORY'S SUBJECT IS THE OTHER THING: an agent that did not know the entry was
dead, reading an answer and finding it already closed.

## Approach

DRIVEN, WITHOUT INSTRUMENTED CAPTURE. One agent, one script against the real
registry, a few seconds.

THE SCRIPT IS THE DRIVER RATHER THAN A HARNESS. It calls the same exported
functions the lane calls, in the order a walk calls them, and prints what comes
back. Nothing is stubbed.

## Procedure

1. LAUNCH A REAL PROCESS THAT OUTLIVES THE STEP, and register it with only its
   process number.
   - OBSERVE: the account reports it running.
2. LAUNCH A REAL PROCESS THAT EXITS AT ONCE, and register it with its handle.
   Wait until it is gone.
   - PASS: a forced sweep reports nothing left to close. The entry closed itself
     on exit, and the sweep was not the closer.
   - OBSERVE: the entry carries the exit code the process ended with.
3. READ THE ACCOUNT with the long-running process still alive.
   - PASS: that entry still reports running. Silence is not read as death.
4. REGISTER AN ENTRY WITH NO HANDLE AND NO NUMBER, and give it a bound of one
   millisecond. Wait twenty.
   - PASS: the account names the bound and says whether the figure was measured
     or defaulted, before the bound passes.
   - PASS: after the sweep the entry stops running and the outcome names the
     bound it hit.
   - PASS: the process is not touched, because nothing was launched to touch.
5. READ THE ACCOUNT TWICE.
   - PASS: the expired entry rides the first answer and is absent from the
     second. A finished entry rides exactly one answer.
6. SETTLE THE ENTRY as though its work had finally reported.
   - PASS: the outcome is the work's own, not the bound's string.
   - PASS: the entry rides an answer again, so a reader told the wait expired is
     still told how the work went.

## What was observed, 2026-08-24

RUN ON LINUX, node v22, against the working tree.

STEP TWO PASSED. The forced sweep returned an empty list, so the exit listener
had already closed the entry.

STEP FOUR PASSED. The account carried the bound and its provenance, and the
outcome afterwards read `bound reached after 1 ms, measured`.

STEP FIVE PASSED. The second read returned nothing for that entry.

STEP SIX PASSED. The outcome became `passed` and the entry was back in the
answer.

## What this cannot show

WHETHER THE BOUND IS THE RIGHT LENGTH. The procedure sets its own bound to make
expiry observable in seconds. Everything in the product carries a blanket
thirty-minute default, and that is registered as
`raid-risk-one-blanket-bound-is-given-to-work-nobody-measured`.

WHETHER A HUNG PROCESS IS CAUGHT. Existence is asked, never responsiveness. A
process that exists and is hung is the bound's job, and the two answer different
questions on purpose.

WINDOWS. This ran on linux, and nothing in this record ran anywhere else.
