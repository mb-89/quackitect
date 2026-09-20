---
kind: [[rationale]]
explains: [[spec/guidance/guidance]]
---

# Why

Guidance is what the agent reads before it does anything. Every rule costs
attention the other rules wanted, so a note holds few rules and each one is a
thing a reader does.

## 1. Everything is actionable

A reader opens a file to find out what to do.

A sentence about where a thing came from, or what somebody once tried, spends
that attention and hands back nothing to act on. The reader who meets enough of
those stops reading the file, and then the rules go unread too.

The test is one question: can the reader act on this? Where a rule came from
changes nothing they do.

## 2. Why the argument moves out

An argument earns its place when a reader disagrees with a rule. That is rare,
and it is one reader at a time.

So the argument sits one link away. A reader who accepts the rule pays nothing
for it, and a reader who wants to fight it knows where to go.

Naming one folder for the past also makes the tense rule enforceable. Every
other folder refuses it, and a linter decides that. The schema proposed a
`Motivation` chapter here as well, and three things in the tree sent it back:

| what said so | what it said |
|---|---|
| `VoiceJudged/Actionable` | it refused background prose under `spec/guidance` |
| guidance rule 2 | the argument belonged one link away |
| the seven rationales | each already opened with that motivation |

## 7. A rule a program checks

A rule written in prose and also enforced by a program is read twice and obeyed
once.

The prose costs attention and changes nothing, because the program refuses the
breach either way. So the rule belongs to the program, and the prose keeps a
link to it.

## 9. Why the handover stays put

A handover names what one box holds right now:

- what stands half-built
- what the last session learned the hard way
- what to pick up first

Another box reads that and acts on something untrue there. It also goes stale
the moment somebody writes it. A file in the tree carrying last week's state is
the drift every other rule here works to prevent.

So the local one lives under `.se`, which git ignores and which stays on one
box.

A work branch wants the other thing:

- a cloud box gets only what git carries, so a note under `.se` reaches nobody
- the group ticket sits under `spec/tickets` there, and git tracks it
- the branch scopes it, so two pieces of work stay apart

`main` refuses a handover. A handover on the trunk is a note about one moment
dressed as a rule, and everybody who clones reads it.

Level zero reads the session handover at session start and deletes it. An
instruction to delete a file is a rule somebody forgets, and a door that
consumes the file leaves nothing to forget.

The cost lands on the other end. Nothing carries a handover forward unless a
session writes a new one, under the same name:

| where you work | write | then |
|---|---|---|
| your own box | `.se/HANDOVER.md` | nothing, git ignores it |
| a work branch | the group's retro chapter | `./RUNME.sh branch done`, which pushes it |

A session that finishes without writing one leaves the next session with
nothing, and the branch says `held` for ever.

## 12. A rule carries its because

The cloud chapter stated what to do and left out what goes wrong. A box read
past it and reached for the engine's stamp instead, handing out two calls it
owned. [[spec/rationales/cloud]] carries that failure.

Version four wrote each rule with its failure beside it:

- Refactor or change behavior, one to a commit, because a green suite says nothing about which breaks.
- Leave the shape better than the speed, because a fast function nobody reads is a defect.

The instruction and the failure ride together. A reader holding half the rule
still holds what it guards, so they apply it where it bites.

Rule 2 sends the argument to a rationale, and this reads as its opposite. The
split is by size. The rationale carries the argument, the measurement and the
history, and the rule carries one clause naming what breaks.

Rules 9, 10 and 11 above already read that way, so the practice stands older
than the rule. A list item caps its sentence at twenty words, which is why the
rule and its reason stand as two sentences.
