---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the clone never moves
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

util/git/land.sh pushes into a worktree of the branch tip and never moves this clone. So the working tree always reads dirty, whatever has been pushed, and the clone's HEAD stays where the box woke.

WHAT THAT COST TODAY, three times over.

One, the stop hook's git check said there are uncommitted changes on every single stop of a long session. It is structurally always red on a box that lands through the push door, so it teaches an agent to wave it through. On the last stop it was right, and one file a reviewer had written was genuinely unpushed.

Two, every count taken against HEAD is wrong. This box reported closing thirty-nine tokens when it had closed twenty-three, because HEAD was sixteen commits behind the tip the session started from.

Three, the queue's pass-over notice blames a lag that is partly this. See wk-c5bc8a31b0.

MEASURED, September 2026: origin/v4 at cc7d66b, this clone still at 95b9423, with nothing of value unpushed.

## proposed action

After a push lands, land.sh brings the clone up to what it pushed, so the tree matches the branch. A fast-forward where the working tree is otherwise clean of it, and a plain fetch where it is not.

Then git status means something again, HEAD is the right baseline for a count, and a dirty tree is news.

## done when

- after a successful land, git rev-parse HEAD equals the commit land.sh reported pushing
- a land whose paths were the only changes leaves git status clean
- a land leaves any file it was not given exactly as it found it, and a test drives that

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

