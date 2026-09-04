---
kind: [[guidance]]
scope: ["every agent or person making a change to source code in this tree, in any language"]
out_of_scope:
  - "a beginner's introduction"
  - "program structure, which is [[shape-of-a-program]]"
  - "what to build, which the token says"
  - "language rules, which are [[writing-go]]"
  - "checks and tests, which are [[testing]]"
depends_on:
  - "[[voice]]"
  - "[[work-token]]"
  - "[[shape-of-a-program]]"
---

# Motivation

The reader is an expert: a senior engineer or a strong model, who knows how to write code and gains nothing from being told.
What changes the outcome is not skill but what the reader does with it under pressure to close the token.
Measured across 623 million changes, agent-era code duplicates more, reuses less, masks more errors and is refactored less.
Each of those is a choice made in the moment, and this file names the other choice, with the reason.
A rule a program can check is a check in [[util/checks]], and it is not repeated here.
This is craft guidance, read when changing code, and it is not part of the standing layer.

# Actionables

1. Find the function that exists before writing one. Search by what it does, and read its callers. Then call it, or deepen it. *
2. Split a function where the piece has a name and a smaller interface than what it left. Never by line count. *
3. Define the error out of existence first. Otherwise return it with what the caller lacks. Never mask one with a default. *
4. A comment says the why, the invariant and the trap. The doc comment is the contract. The incident goes in the commit. *
5. Least mechanism: the language, then the standard library, then what the tree imports, then a dependency, with the choice written where made. *
6. Fix the defect where it is, never in the caller that meets it. *
7. Delete dead code and the helper that outlived its test, in the same change that found them. *
8. Write the interface first and put it in the token. An interface is a decision, an implementation is work.
9. Cut a change as a vertical slice through every layer, so the integration risk is met first and once.
10. Keep every change small enough to review whole, and leave the tree green at each commit, cleanup included.
11. One name per thing, the glossary's, in code and prose. A numbered or suffixed name is a name not yet found.
12. Do the cleanup the change reveals in the same change. Refactoring is not a separate token unless it is large. *

# Discussion

## 1. The function that exists

GitClear measured code from 2023 to 2026: duplicated blocks up 81 percent, calls into other files down 35 percent.
The mechanism is local sight: an agent sees the file in front of it and writes what that file needs.
So the search comes first, by behaviour and not by name, because the existing one is named for a different caller.
Deepen the one found rather than fork it, and where two programs share a rule, one package or one call serves both.

## 2. Where to split

Ousterhout against Martin, settled in their 2025 exchange: below a few dozen lines, further splitting stops paying and starts costing.
Each extra function is an interface to learn, and the complexity is spread rather than removed.
The test is the interface: a piece that can be named and called with less than its parent takes is a module.
A piece that needs everything its parent had is the parent, and stays in it.

## 3. Errors

Ousterhout: the best error is one the design makes impossible, like a delete of a missing file that succeeds.
Of the rest, GitClear counted masking constructs up 47 percent.
That is a catch that swallows, a default that hides, and a check that answers clean when it could not read.
Level 0 rules that a guard which cannot tell must refuse, and the rule holds one level down.
A caller that cannot act adds what it knows, the file or the name, and hands the error up unchanged in kind.

## 4. Comments

Both sides of the 2025 exchange agreed that an interface needs its contract written down where it is declared.
Beyond that, a comment carries what the reader cannot recover from the lines: the reason, the invariant, the trap.
The incident that taught the reason belongs in the commit, because voice rule 14 keeps history off the surface.
A measurement is not an incident: with its machine, its sizes and its method beside the numbers, it stays, because a reader can rerun it.
A comment that restates the signature costs on every visit and pays on none.

## 5. Least mechanism

The Google Go style guide: where an idea can be written several ways, prefer the one that uses the most standard tools.
A hand-written reader of a format somebody else owns covers the cases seen so far and fails on the next file a person edits.
A dependency is a thing to vet and to carry, so the choice is a design decision and is written where it is made.
Hickey's test applies to both sides: does this braid two things together that were separate.

## 6. Fix in the caller

A consumer misreads a shape, and the producer is changed to stop emitting it.
The symptom goes and the defect stays, reachable by every other producer, including a person with an editor.
The fix goes where the misreading is, and the case that exposed it goes into the test first, so the test goes red once.

## 7. Dead code

GitClear: refactoring fell from 21 percent of changed lines to under 4, and maintenance of old code fell 74 percent.
Code with no caller is read by every reviewer and compiled by every build, and it guards nothing.
A test helper with no test is the same, and it survives longer because nothing counts it.
Version control remembers both, so deletion costs nothing and is done on sight.

## 12. Cleanup in the change

The Google guide's rule for deviations: a change may not worsen an existing problem, and the cleanup goes in the same change.
Deferred cleanup is the debt TigerBeetle refuses: a problem solved in design costs one unit, in production exponentially more.
A change that reveals a duplicate, a dead branch or a missing type fixes it there.
A cleanup too large for the change becomes a token, minted before the change closes.
