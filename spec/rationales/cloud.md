---
kind: [[rationale]]
explains: [[spec/guidance/cloud]]
---

# Why

A cloud box clones the tree cold, holds nothing anybody typed, and stops when
the session stops. Everything it learns dies with it unless git carries it.

## 1. Why a routine branches

A routine starts on `main` and takes no branch argument. Level zero reads its
context at `session.start`, before any checkout, so a hook sees nothing of a
branch the session moves to afterwards.

`work take` closes that gap by printing the brief to standard output. The agent
reads it from the command, and one routine prompt then serves every branch.

## 2. A pointed agent needs nothing

A cloud agent aimed at `work/<name>` starts on the branch, so `HANDOVER.md` sits
in the tree at `session.start` and level zero hands it over. That path needs no
command, which is why the two entries differ.

## 3. Trunk comes in by hand

A branch cut a week ago works against a tree that has moved. Its tests pass
against rules that moved, and the conflict surfaces at merge time, once the work
stands and the box holds nothing.

`work sync` takes `main` in before the first edit, so a conflict costs nothing
yet. `work take` runs it, so a routine pays nothing to remember it.

Trunk travels one way, and a cloud box opens no pull request. Merge the branch
from a box holding trunk, and close it there once the merge stands.

## 4. One branch, one job

A session that goes past its branch produces a change nobody asked for, sitting
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

## 6. A person blocks no branch

A cloud box runs while nobody sits beside it. So a step whose `by` reads `person`
waits the whole session, and the branch waits with it. Every step
behind that one waits too, though an agent could take them.

One group showed the cost: three children, one of them parked at a person step,
and the box released the branch having finished nothing. The next box took the
same branch, met the same step, and released it again.

The person's work is real, and dropping it is the other failure. So it moves to
a ticket of its own, outside the group, carrying the question and what stands
open. The group then closes, the branch merges, and the ticket is the reminder.

## 7. The route a successor takes

`branch unblock` reads the successor's first step and demands `by: person`. No
process under `spec/processes` opened one, so every successor a hand could mint
met a refusal. A box that followed the guidance to the letter got that refusal,
released the branch, and the loop closed again.

`spec/processes/question.yaml` is that route. A hand mints the successor off it,
and the first step reads `by: person` with nobody assigning it. The pull says so
too. Where a person's step is the only thing standing, the wait answer names the
mint, the open and the unblock in order.

## 8. What a leaving branch owes

A branch that merges half-done is honest only if what it left stands written
somewhere a person reads. The successor ticket is that record, and `reason:
became` with `successors` is the link back.

The alternative is a branch held open until a person answers. That blocks the
tickets depending on it, and a dependency reads a closed ticket, not a finished
one. So closing is what frees the chain.

## 9. The check greens first

A box read the check red, named the four lines a verb wrote, and left them. Three
of the four stood on the branch before that box took it. The reading went: a
fault another hand wrote belongs to that hand.

That reading costs the tree twice:

- `branch done` asks for a green check, so a red branch reaches no mergeable status
- the next box inherits the same lines, reads them the same way, and leaves them

A fault with no owner outlives every hand that meets it. So the hand that meets
it owns it. The box that stops there pays nothing, and every box after it pays.

The fix here reached the rule itself. The prose rules read the whole file, and a
verb writes the frontmatter. So a joined `why` line read as one sentence, past
the code span cap. Blanking that block in the three rules that miss it costs
four lines, and it greens every ticket the verbs write.

## 11. One session, one branch

A session reading this note from `take` to `done` finds no line saying it stops
there. So it offers a second branch, having just closed its own, which is the
reading the words allow.

Two rules come close and both read as scope advice inside one branch. Rule 4
draws the edge of the brief and says nothing about the session. Rule 7 says
`work done` is last of these steps, and says nothing about the session either.

A branch listing also goes stale inside a session. `work list` reads origin at
the moment of the call, and an hour of work later another session has moved
what it named. So run it again before naming a status out loud.

## 12. Saying the commit

A cloud box clones the branch tip as it stood when the session began. Somebody
pushing a minute later leaves the box behind while it reports itself current.

Two earlier sessions answered that they were up to date and were wrong. So the
box states the commit and the reader decides, which takes the judgement off the
agent.
