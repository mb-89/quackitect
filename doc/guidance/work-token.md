---
kind: [[guidance]]
scope: ["every work token, whatever its process"]
out_of_scope: []
depends_on: ["[[voice]]"]
---

# Motivation

A work token (wt) is the fundamental unit of work we work on.
The work can be done in different ways, we call those processes.
Processes sit under [[src/processes]], and every worktokens structure is informed by the process that is use for it.
The token is the only information the reader has, so it needs to be understandable

Rules about writing wts that are mechanical are under [[src/schemas/work-token.schema.yaml]].
Rules about writing wts that are judgement are here.

# Actionables

## Writing one

1. Write the problem in detail, and the answer in proposed action. *
2. Reduce to the smallest case that still shows the problem. Cut what a reader does not need.
3. Write acceptance criteria first. A criterion is decidable, and somebody answers it yes or no. *
4. Where a command decides a criterion, write the command. Otherwise name who looks at what.
5. A criterion is not a plan, and not the problem restated.
6. Ask whether a criterion is about this change or about the project. Pin a one-time one. *
7. One token, one piece of work. A done-when needing "and" is usually two tokens.
8. Before a feature, name the basics it stands on. Mint the missing one first. *

## Using one

9. Do what the token asks and nothing next to it. If the ask is ambiguous, ask one question and wait.
10. Write the check before the work. Watch it go red for the reason you expect.
11. A check that will not go red is the finding. Write it down and stop.
12. Put both halves of a mechanism in the evidence. "Nothing yet, owed by X" is an answer.
13. Report work as done only with the evidence that it is. The change itself is `git diff began..ended`, never a list of files. *
14. A checklist carries institutional knowledge. Answer each line rather than ticking it. *

# Discussion

## 1. The problem, not the answer

The sections are separate so that a reader can disagree with the answer while
still believing the problem.
Keep the argument out of it: no history, no measurement of the record, and no account of who said what.

## 3. A criterion that cannot fail

A check built after the work, from the work, cannot go red.
It asserts what the fix happens to produce.
Shapes seen here: a check for a class name nothing writes, a rule enforced in
one language and checked in another, a word list built from the cases already
found, a scope drawn around what was touched rather than around the claim.

Write the check first and watch it fail (for the expected reason, no randomly).
A check that will not go red is the finding.

## 6. About the change, or about the project
Ask whether the sentence is asserted once or forever.
A one-time assertion is pinned to what existed when the work started.
A standing one is a rule the project keeps, and it belongs in a check rather
than on a token that closes.

## 14. A checklist is not a formality

The lines come from the process, and the process carries what earlier work
learned the hard way.
A line ticked without being read is the institutional knowledge thrown away and
the tick kept.

Where a line asks for evidence, the sentence is the answer and the tick only
counts it. Where it asks for none, the tick is honest, because there is no
artifact and the only thing anybody can say is that they thought about it.

## 8. Basics first

The basics look self-evident, so nobody writes them down, and the gap is found
after the feature. If basics arent built first, the feature based on them will not be solid.
Before a feature token is worked, its detail names what it stands on, and each
missing basic is minted first.

## 13. The change is two hashes

The engine snapshots the tree when a token is taken up and when it closes,
and writes the two hashes on the token as began and ended.
The snapshots are commits under a ref no push carries, so the person's
history holds only the commits they made.
A list of files on a token is a list somebody typed, and it is wrong the day
after; the diff between two hashes is right for as long as the repository is.
A reviewer of a whole stage reads the same way: the tree at its start against
the tree at its end.
