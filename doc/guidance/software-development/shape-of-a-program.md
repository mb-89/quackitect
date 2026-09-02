---
kind: [[guidance]]
scope: ["every agent or person designing or changing the structure of a program in this tree"]
out_of_scope: ["a beginner's introduction to any of these patterns", "how a single change is made, which is [[writing-software]]", "language rules, which are [[writing-go]]"]
depends_on: ["[[voice]]", "[[work-token]]"]
---

# Motivation

The reader is an expert: a senior engineer or a strong model, who knows the basics and gains nothing from being told them.
What an expert lacks in the moment is the shape: which proven pattern this program follows, so a change lands in the right place.
This file names the patterns with a track record, when each applies, and what it costs.
Each is a choice already made for this tree, and a change that departs from one says so in its token.
The engine is the worked example: many short-lived processes over one folder of files, driven by hooks and a person.
This is craft guidance, read when designing, and it is not part of the standing layer.

# Actionables

1. Functional core, imperative shell. A decision is a pure function over values. The shell reads the world, calls the core, applies what comes back. *
2. Parse, do not validate. Input crosses the boundary once and becomes a typed value that cannot be wrong. Nothing past it re-checks. *
3. Make illegal states unrepresentable. A state is one of a closed set, and a transition is a function from one state to the next. *
4. Essential state is what was input. The rest is derived, cached by the hash of its inputs where it pays, never a second truth. *
5. One writer per file. Every other process reads it, or asks the writer. A resident process holding the model can be that writer. *
6. Append-only record, derived views. The record is written once and read many times, and a view is rebuilt from it. *
7. Crash-only. Nothing lives only in memory, and every write is atomic or idempotent, so a restart at any line is the recovery. *
8. Deep modules. A small interface over a large implementation. Pull complexity down into the module, not up to every caller. *
9. Dependencies point inward. The core imports nothing that touches the world, and reaches the world through a port it defines.
10. Put a limit on everything: queue length, loop count, file size, retries, waits. An unbounded thing is a defect waiting for load. *
11. Assert the invariant where it holds, in production code, and fail loudly. A test proves a case, an assertion proves a state.
12. A lease, not a lock. A hold on a shared thing expires, and the holder renews it while it works.
13. Batch at the boundary. The shell amortises disk and network, and the core sees one value at a time.
14. One shape per concept: one error, one reply, one id. A second shape is a second parser somebody has to write.
15. Command or query. A function changes the world or answers a question, and a function that does both hides the change. *

# Discussion

## 1. Core and shell

Bernhardt's pattern, and the one the rest rest on.
The core takes values and returns values, including a value that says what to do: write this file, refuse with this reason.
The shell is thin, does the reading and the writing, and holds no decision.
A core function is tested with a value and a `want`, and needs no tree, no clock and no process.
The cost is a shell that grows when a decision needs the world midway.
The answer is to read more up front and hand it in.

## 2. Parse at the edge

King's rule: validation checks and forgets, parsing checks and keeps the result in the type.
Shotgun parsing, checks scattered through the program, is how half-processed bad input reaches disk.
So bytes become a struct at one place, with every field the program relies on already proven.
A function that takes the struct trusts it, and a function that takes a string is still at the edge.

## 3. Closed states

Minsky's line, and the typestate pattern that follows from it.
Eleven states as a string type are eleven spellings, and the transition table is whatever the code happens to compare.
A closed set with a function per transition gives the compiler the table, and an exhaustive switch refuses a state nobody handled.
Where the language cannot forbid the transition, the constructor refuses it and nothing else builds the value.

## 4. Derived, cached, never stored as truth

Moseley and Marks: state that can be recomputed is accidental, and the ideal system stores none of it.
A count kept beside the list it counts is two truths, and the day they differ nobody knows which is right.
The record is the input, and a count, a view, a burndown and a queue are functions over it.
Re-deriving is cheap from memory and ruinous from disk inside a loop.
So the shell reads once into a snapshot and the core derives from that.
A cache is a derived value kept for speed.
It is keyed by the hash of what it was computed from, validated against it, and deleted at will.
It may be stale, and it is never read as the truth.

## 5. One writer

Thompson's principle from the ring-buffer work: contention is the cost, and a single writer has none.
A file written by two processes needs a lock, and a lock needs a timeout, and a timeout needs a stale check.
A file with one owner needs an append.
Where several processes must write, they append to their own file, and one reader merges.
A resident process that holds the model and takes every write is the single writer by construction.
It stays a cache over the record, rebuilt from disk on start, and a client reads cold when it is absent.
Every answer then carries a revision, and a write names the revision it was based on, so a stale write is refused.

## 6. The record and its views

Kreps: the log is the truth, and every table is a materialised view over it.
A line appended is never edited, so a reader never meets a half-changed record, and history is free.
A view is rebuilt from the log, so a bug in the view is fixed by fixing the view and rerunning it.
Compaction is a derived view too, and the retro is one.

## 7. Crash-only

Candea and Fox: a program with one way to stop, crashing, and one way to start, recovery, has recovery that is tested on every start.
A write is a temporary file and a rename, or an append the reader tolerates truncated, or an operation safe to repeat.
State in memory is a cache of state on disk, and a process that lost it reads it again.
A guard that runs as a process per event is already crash-only, and the design keeps it so.

## 8. Deep modules

Ousterhout: the value of a module is the ratio of what it hides to what it exposes.
A function split by line count into six shallow ones has six interfaces to learn and the same complexity spread thinner.
Split where the piece has a name and an interface smaller than what it left.
Define errors out of existence first: an operation that cannot fail on the common path needs no error branch in every caller.

## 10. Limits

TigerBeetle's rule: every loop, queue, buffer and retry has a bound written where it is.
A limit is a design number, and a limit hit is a signal, so it is asserted and logged rather than grown.
Unbounded means somebody sizes it later, under load, in production.
The parameter tree is where the limits live, and a new one joins it with its floor.

## 15. Command or query

Meyer's separation.
A function named for saving that also logs and cascades has two callers who wanted one of the three.
A query has no side effect, so it is safe to call twice and safe to call in a test.
A command returns what changed, or an error, and the log write is a second command the shell orders after it.
