---
form: the-work-offer
by: agent
signed_off: 2026-08-26T15:37:58.406Z
authors: agent
files: null
---

# Evidence form / the-work-offer

## current_situation

The store could write work and read it back. Nothing could say what a hand may take, and nothing could count what a position still owes.

Two fields the offer needs were missing from the store. What a piece of work waits for, and how hard it is. Both are added here, because the element holding the predecessor edge is the store.

### The two reads, and why they are not on the write path

EVERY LOOK AT A POSITION COUNTS. Only entering one mints. Putting the count beside the mint would make every entry pay for a derivation that belongs to every look.

So the offer writes nothing at all. The store serves two reads itself, which is why the cut is on writes rather than on reads.

### A name was already taken, and the collision is the point

The test spec asked for `tests/work-account.test.ts`. That file already exists, and it is about the JOB account that rides every lane call — how far a background run has got and how much longer it needs.

TWO DIFFERENT THINGS WERE ABOUT TO SHARE ONE NAME. That is the corpus inspection's own pass line, met live rather than in a sweep.

## built

ONE MODULE AND TWO TEST FILES. 25 new cases, all passing.

### The module

`deliverable/engine/workoffer.ts`. It writes nothing at all, which is the cut the design names and the reason it is its own file.

Seven reads, and every one of them derives its answer from the work rather than from a stored copy.

- `offer` — what a hand may take now.
- `owed` — two figures per position, one per slot.
- `account` — what hands are on.
- `reconcile` — the derived value against a stored one.
- `judgedAt` — what a gate may judge.
- `openPointsAt` — what a checkpoint must rule on.
- `slotOf` — which slot a piece of work belongs to.

### The ordinary case costs no check

EVERYTHING IS READY UNLESS AN ORDER WAS WRITTEN DOWN. The wait list is empty for most work, so the loop does not run at all.

A design where the common case needs a declaration is the one this rule exists against, and the first case in the test file is the one that catches it.

### Two edge kinds, and the build settled their shape

The design named the two kinds and not how one is written. It is now in the design spec.

- `work:<id>:<outcome>` waits on another piece reaching a NAMED outcome.
- `position:<id>` waits on a whole position finishing, which is one fact rather than a list over that position's items.

A CASE PROVES THE OUTCOME IS LOAD-BEARING. The predecessor settling as `dropped` does NOT release a wait that named `done`. The edge names an outcome, not merely an ending.

AN EDGE NOBODY CAN READ WITHHOLDS THE WORK AND SAYS SO, rather than being treated as no edge at all.

### The count is a figure, never a derivation the surface makes

TWO NUMBERS PER POSITION: what must still be taken in, and what must still be produced. The slot is derived from where the work came from and is not stored beside it.

A COUNT THAT CANNOT BE PRODUCED IS ABSENT, NEVER ZERO. A case breaks one item's frontmatter deliberately and asserts the count comes back null with a reason that names the unreadable piece. A zero and an unknown look identical on a surface and mean opposite things.

EVERY DRAWN VALUE SAYS WHETHER IT IS A SNAPSHOT OR A LIVE READING. The type has no third state, so a value carrying neither cannot be built.

### The house rule about stored copies is enforced, not assumed

`reconcile` takes a stored count and returns the live one beside the disagreement. A case feeds it a stale 7 against a real 2 and asserts the derived value wins AND that the disagreement is reported rather than silently corrected.

### A fourth refusal clause

`SE-C-152` — a second hand taking work the first is already on. Its section stands in `guidance/refusals.md`.

The refusal names the hand holding it, so the second hand knows who to ask rather than only that it may not proceed.

### Two fields were added to the store

`after` and `difficulty`. The element holding the predecessor edge is the store, so that is where they live, and the offer only reads them.

### One duplication removed

The store had `owedAt` and the offer has `openPointsAt`, and they were the same query. Its own design spec says the store does not count what is owed, so `owedAt` is gone and its one caller reads the offer.

### The test files

- `tests/work-offered.test.ts` — 12 cases. Three edge classes, the difficulty filter, and the take.
- `tests/work-reads.test.ts` — 13 cases. The account, the count, the gate and the checkpoint.

THE SECOND FILE WAS RENAMED AT THE BUILD. Its spec asked for `tests/work-account.test.ts` and that name is taken by the JOB account that rides every lane call. Two different things were about to share one name, which is the corpus inspection's own pass line met live. The spec now names the file that exists and says why.

## follow_up

The engine strand is done after this. `merge-the-surfaces` runs next, then the bucket editor joins both strands.

### A fourth refusal clause

`SE-C-152` — a second hand taking work the first is already on. Its section stands in the refusals card.

IT REFUSES RATHER THAN IGNORING because two hands on one item is exactly what the mark exists to make visible. A quiet second take would make the account say one hand where two are working.

### What the surface strand inherits

A count per position that is a FIGURE, not a derivation. The surface draws a number rather than computing one, which is the crossing this chunk fills.

An absent count is null with a reason, never zero. The surface must render those differently, and that is a demonstration rather than a test.

### The word collision belongs to the corpus pass

`account` now joins `token` on the list of words naming two things. The corpus pass is the seventh chunk and it owns both renames.

### One red still stands at HEAD

The read-once guard, measured and recorded, waiting for `fix-findings`.

## anything_else

A TIMING TEST FAILED ONCE AND PASSED ON RE-RUN, and it is recorded rather than passed over.

`deliverable/tests/handback.test.ts` line 197 wants an answering call to return in under 1000 ms while a real 2000 ms script runs. It measured 1043 ms on one run and passed on the next, with nothing between the two runs touching that path.

WHY IT IS LOAD RATHER THAN A REGRESSION. The case waits on a named constant that is already under a second, then pays process-spawn overhead on top. Under a concurrent battery that overhead is what crosses the line. Nothing this build changed is anywhere near that code.

IT IS WORTH KNOWING ANYWAY. A case whose margin is 40 ms of spawn overhead will fail again on a slower machine, and the retro's slow-test mining is where that belongs.

I AM NOT CALLING IT A FLAKE TO BE DISMISSED. One pass does not prove a timing bound holds; it proves this run had room. The honest statement is that it did not reproduce and its margin is thin.

### Where the suite stands

1944 tests, 1943 pass, 1 fail. The one failure is the read-once guard, which is measured and recorded and belongs to `fix-findings`.
