---
kind: [[guidance]]
scope: ["changing code that already works, so it costs less"]
out_of_scope:
  - "the cleanup a change reveals, which is [[writing-software]]"
  - "how a test is built, which is [[testing]]"
  - "when a period's numbers are read, which is [[retro]]"
depends_on:
  - "[[voice]]"
  - "[[writing-software]]"
  - "[[testing]]"
---

# Motivation

Code that works can still cost too much.
A suite that takes a minute, a loop that runs a thousand times, a build that happens per call.
Refactoring is changing what something costs without changing what it does.

It goes wrong in two ways, and a green suite catches neither.
A change made on a guess moves nothing, or moves the wrong thing, and the guess is kept because it sounds right.
A change that alters behaviour at the same time cannot be told apart from a defect afterwards.

The whole of this file is one habit: put a number on it, change one thing, put the number on it again.

# Actionables

1. Measure before you change. A hotspot is measured, never guessed. *
2. Profile the whole before the part. Rank by cost times how often, not by what looks slow. *
3. Write the number on the token before and after, each with the command that produced it. *
4. Change one thing, measure again, and keep it only if the number moved. *
5. Delete before you optimise. The cheapest work is the work nobody does. *
6. Build once and reuse it. A thing rebuilt per call is the commonest hotspot there is. *
7. Refactor or change behaviour, never both in one commit. A green suite says nothing about which one broke.
8. The suite is code. Profile it the same way, and read [[testing]] for the boundary it usually is. *
9. Leave the shape better than the speed. A faster function nobody can read is a defect with a benchmark.
10. Say what good enough is before you start, and stop when the number reaches it. *

# Discussion

## 1. A guess that sounds right is kept

A battery lane was measured at half a second on its own and thirty-six seconds inside the run.
The explanation offered was that a dozen lanes started together and all missed the build cache, so the cache was warmed once before them.

The battery got slower: the warming joined the critical path and nothing else moved.
The half-second reading had been taken on an idle machine, and said nothing about the same command on a loaded one.
The lanes were competing for cores, which the first measurement could not have shown.

So the measurement has to be taken where the cost is paid.

The same run then started every check at once, thirty-nine processes on eight cores, and each `go test` is already parallel inside itself.
Handing out no more work than there are cores made every lane two or three times quicker.
It also stopped a test with a budget in it going red under the load.
Oversubscription is not free parallelism: past the core count it buys nothing and costs correctness.

## 2. Rank by cost times how often

The slowest four tests in one suite cost forty-nine seconds between them.
Each was compiling a module to decide which tests the engine picks from a delta.
Nothing about them looked slow: each was a page of ordinary code.

What made them the hotspot was not the code but what the code reached, once per test, every run.
Look for what is called rather than for what is long.

## 3. A number with no command is a story

A number written without the command that produced it cannot be checked, and cannot be taken again after the change.
So both go on the token, before and after, and the reader can run either.

That is what makes a refactor reviewable at all: the diff says what changed and the two numbers say whether it was worth it.

## 4. One thing, then measure again

Two changes and one measurement is one number about two decisions, and neither can be undone on the evidence.
Where both are wanted, they are two commits with a measurement between them.

A change that moved no number is reverted, whatever it looked like it should have done.
Keeping it is keeping a guess with a diff attached.

## 5. Deleting is the fastest change there is

A check nobody reads, a cache nothing hits, a fixture rebuilt for a test that was retired: each costs every run and answers nothing.
Ask what would break if it were gone before asking how to make it quicker.

## 6. Built once, or built per call

The engine's test binary was linked once and run in two halves, and linking a cgo binary is the slow part of that suite.
The same shape recurs everywhere: a compile per test, a probe per call, a file read per loop.

Where a thing is the same every time, build it once and hand it out.
Where it is not, say what it depends on and key it by that.

And a suite that is parallel inside itself is not sharded.
Two shards were right when each linked its own cgo binary.
Once the build made that binary once, five shards cost a hundred and sixty seconds of lane time.
The suite takes thirty on its own.

## 8. The suite is code, and it is usually a boundary

A suite gets slow one test at a time, and no single test looks like the problem on its own.
That is how the whole of it gets slow with nothing saying so.

So the numbers are kept rather than watched: the engine times every test when it maps it, and `util/checks/tests-are-not-hotspots.mjs` ranks them and refuses when too many run long.
What it finds is nearly always an external tool being driven where a fed one would do, which is testing rule 13.

## 10. Good enough is decided first

Optimising has no natural end, so the end is written down before the start.
It says what the number has to reach, and why that is the number.
Without it a refactor runs until somebody is tired of it, and the last changes are the ones with the least evidence behind them.
