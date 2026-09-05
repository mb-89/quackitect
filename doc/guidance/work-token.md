---
kind: [[guidance]]
scope: ["every work token, whatever its process"]
out_of_scope: []
depends_on:
  - "[[voice]]"
  - "[[behaviour]]"
---

# Motivation

A work token (wt) is the fundamental unit of work we work on.
The work can be done in different ways, we call those processes, and they sit under [[src/processes]].
The token is the only information the reader has, so it needs to be understandable.
The engine snapshots the tree at every take-up and put-down, and writes the hashes on the token as began and ended.
So the change is on the token before anybody writes about it, and a remark on it is welcome where a file list is not.

Rules about writing wts that are mechanical are under [[src/schemas/work-token.schema.yaml]], and rules that are judgement are here.
How a test is built is [[testing]].

# Actionables

## Writing one

1. Write the problem in detail and the answer in proposed action, reduced to the smallest case that still shows it. The detail answers what is gained by doing it, and what breaks if it is never done. *
2. Write acceptance criteria first. A criterion is decidable, names the input, the answer and what survives, and is not a plan. *
3. Where a command decides a criterion, write the command and run it from the root before submitting. Otherwise name who looks at what. *
4. Match on what the check holds at run time: a whole identifier written once into both halves, or a length as a number. *
5. Number what the detail says the change does and put a criterion against each. Work that moves off takes its criteria with it. *
6. A detail names the constraint, never the assignment. A criterion answering with a verb states the effect as field and value.
7. Ask whether a criterion is about this change or about the project. Pin a one-time one. A standing one belongs in a check.
8. One token, one piece of work. One command decides one sentence. A done-when needing "and" is usually two tokens.
9. Before a feature, name the basics it stands on. Mint the missing one first. *
10. A small fix is a trivial token. A note needs a decision first. Everything else is tracked or local, and tracked names no local. *

## Using one

11. Do what the token asks and nothing next to it. If the ask is ambiguous, ask one question and wait. *
12. Write each criterion's check before the work and watch that one go red. A check that will not go red is the finding. *
13. Put both halves of a mechanism in the evidence. Where the system mirrors halves, table them and drive the rule through each. *
14. Report work as done only with the evidence that it is. An observation names the check and what it said. *
15. A checklist carries institutional knowledge. Answer each line rather than ticking it. *

# Discussion

## 1. The problem, not the answer

The sections are separate so a reader can disagree with the answer while still believing the problem.
Keep the argument out of it: no history, no measurement of the record, no account of who said what.
Write the smallest case that still shows the problem.

A detail says what has to become true and names the constraint.
Where the write goes is the worker's decision.
Before a detail names a file and a line, run the tree's checks against it on a copy.

A tracked token spends real work, so the ask answers why the work is worth it.
What is gained by doing it, and what breaks if it is never done.
Both fail the same way, by restating the ask, so each carries evidence beside it.
The note process has asked this from the beginning, and the tracked ask asks it now.

## 2. A criterion that cannot fail

A criterion written after the work asserts what the fix happens to produce.
Shapes seen here:

- a class name nothing writes
- a rule enforced in one language and checked in another
- a word list built from cases already found

So criteria are written first, each naming the input, the answer, and what has to survive.

A criterion answering with a system verb states the effect as field and value, because a branch can perform it inline and stay green.
A detail borrowing another component's syntax borrows its rulings on wrong input too.
Where the answer touches another token, name its status and holder.

## 3. The command decides the sentence above it

Two criteria once carried identical commands, so whatever made the first green made the second green.
Pull the commands and their run patterns out of a draft and compare them for repeats.
So every command runs from the root before submitting, exit zero or a stated reason, pointing at the instrument held until its owner replaces it.
A draft obeys the class it commits, and names a walk the tree already has rather than retyping it.

## 4. What a check may match on

A two-part guard pairing a search for a definition with a run of the test, naming different symbols, fails shut.
So the identifier is written once into both halves, and the guard is run against the artefact before submitting.
A boundary in what the check cannot hold falls to a prefix that never fails, so a length is a number.
Rendered text is no handle: a template holds no text to match, so the durable handle is the producer's name.

## 5. Every item the detail names

Number what the change does and put a criterion against each.
On a rewrite, add a delete criterion for every sentence the detail calls the problem.
A scope decision once moved work away in prose while three criteria still asked for it.
Move the criteria first, then write the sentence saying where they went.
A spike closes on its own numbered questions, including those it declines, and a mechanism it turns up is its own token.

## 9. Basics first

The basics look self-evident, so nobody writes them down, and the gap is found after the feature.
Before a feature is worked, its detail names what it stands on, and each missing basic is minted first.

## 10. Tracked is claimable

A note is private, because nobody has decided what it is yet.
Everything else is tracked or local, and the minter says which: there is no default.
Tracked is doc/work, which git carries, so another box can claim it.
Local is .se/work, which nothing else reaches.
The question is who can pick it up, not how big it is.

The reference runs one way.
A cloud box reads the tree out of git, where .se/work is not, so a local id there is a broken link.
A local token naming a tracked one is fine.

## 11. Next to the ask

The token is the only thing a reader can judge a change by.
A change beside it is one nobody asked for and nobody can find afterwards.
A question costs a turn, and a guess at an ambiguous ask costs the work and the turn that undoes it.

## 12. Red first

A check that arrives green has proved nothing about the defect.
Watched going red for the reason expected, it proves the defect was there and the check can see it.
One that cannot be made red is a finding about the criterion, and it goes on the token first.
So the red is recorded per criterion.
Each names the test its criterion runs, its message matches an assertion in the tree, and a split-out criterion earns a fresh red.

## 13. Half a mechanism ships

A detail names two parts and says neither is enough alone.
The producing half is built and evidenced, the checking half is not, and nothing looks wrong until it is.
Ask which half has no output: that is the one that will be missing.
A rule taught to one half of a mirrored pair is the same defect.
So the halves are written down where the system declares them, and the rule is driven through each.
A field the second half ignores is refused rather than accepted.

## 14. Evidence

An observation names the check and what it said, never a line number, because a line moves and a check can be run again.
Work reported done without its evidence is a claim the record cannot check.
A number carries the command that produced it, written beside it as it is taken.
Both halves of a ratio come from the one instrument the code reads, and a half that cannot says so beside the number.
A reading pins to a commit, never to the word today.
Before submitting, every command runs again with its fresh answer beside what was written.

## 15. A checklist is not a formality

The lines come from the process, which carries what earlier work learned the hard way.
A line ticked without being read throws that knowledge away and keeps the tick.
Where a line asks for evidence, the sentence is the answer and the tick counts it.
Where it asks none, the tick is honest, because there is no artifact to name.
