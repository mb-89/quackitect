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

Naming one folder for the past also makes the tense rule enforceable. Every other
folder refuses it, and a linter decides that.

## 7. A rule a program can check

A rule written in prose and also enforced by a program is read twice and obeyed
once.

The prose costs attention and changes nothing, because the program refuses the
breach either way. So the rule belongs to the program, and the prose keeps a
link to it.

## 9. Why the handover stays on the box

A handover names what one box holds right now:

- what stands half-built
- what the last session learned the hard way
- what to pick up first

Another box reads that and acts on something untrue there. It also goes stale
the moment somebody writes it. A file in the tree carrying last week's state is
the drift every other rule here works to prevent.

So it lives under `.se`, which git ignores and which stays on one box.

Level zero reads it at session start and deletes it. An instruction to delete a
file is a rule somebody forgets; a door that consumes the file leaves nothing to
forget.
