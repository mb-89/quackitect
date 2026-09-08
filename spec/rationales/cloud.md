---
kind: [[rationale]]
explains: [[spec/guidance/cloud]]
---

# Why

A cloud box clones the tree cold, holds nothing anybody typed, and stops when
the session stops. Everything it learns dies with it unless git carries it.

## 1. Why a routine takes its own branch

A routine starts on `main` and takes no branch argument. Level zero reads its
context at `session.start`, before any checkout, so a hook sees nothing of a
branch the session moves to afterwards.

`work take` closes that gap by printing the brief to standard output. The agent
reads it from the command, and one routine prompt then serves every branch.

## 2. Why a pointed agent needs no verb

A cloud agent aimed at `work/<name>` starts on the branch, so `HANDOVER.md` sits
in the tree at `session.start` and level zero hands it over. That path needs no
command, which is why the two entries differ.

## 3. Trunk comes in, and goes back out by hand

A branch cut a week ago works against a tree that has moved. Its tests pass
against rules that moved, and the conflict surfaces at merge time, once the work
stands and the box holds nothing.

`work sync` takes `main` in before the first edit, so a conflict costs nothing
yet. `work take` runs it, so a routine pays nothing to remember it.

Trunk travels one way. A cloud box opens no pull request, so the merge back is a
person's.

## 4. One branch, one job

A session that widens its branch produces a change nobody asked for, sitting
beside the one somebody did. The reviewer then reads both to find the one.

## 5. Onto your own branch

A box starts on trunk and moves off it in its first command. So the window for
a commit landing in the wrong place is the minute before that, which is when an
agent knows least.

Level zero refuses two things on a cloud box:

- a commit made while standing on `main`
- a push naming `main`

A word in the guidance asks, and the door decides.

The box holds the only copy of anything uncommitted, and nothing survives the
session to collect it later.

The box holds the only copy of anything uncommitted. There is no second chance
to collect it, because nothing survives the session.

## 9. Saying the commit

A cloud box clones the branch tip as it stood when the session began. Somebody
pushing a minute later leaves the box behind while it reports itself current.

Two earlier sessions answered that they were up to date and were wrong. So the
box states the commit and the reader decides, which takes the judgement off the
agent.
