---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: worktrees never swept
# where the token stands. The process owns these values.
status: open
# true when this waits for a person rather than an agent
needs_human: true
---

## detail

Every hand on this box works in a detached worktree under /tmp, because the shared clone is behind and cannot be committed from. Nothing removes them afterwards. Measured on this box: git worktree list answered one hundred and seventy-one entries, and every one of them was still on disk, so none was merely a stale registration that git worktree prune would clear. du over /tmp answered eleven gigabytes. A checkout alone is about ten megabytes, and the rest is what the builds left beside them. The names show the age. They run from agents whose sessions ended days ago, and several boxes' worth of one-off names sit beside the few a live hand is using. A person reading git worktree list cannot tell which of the hundred and sixty-nine are in use, which is why no agent removes any of them.

## proposed action

Decide who sweeps and on what signal, then write it down where the worktree guidance lives. A worktree whose branch tip commit is already an ancestor of origin/v4, and whose directory has not been written to for some hours, is done with. Removing this box's own is two named paths and a prune, which is what a hand can do at the end of its work.

## done when

- the count of registered worktrees is lower than one hundred and sixty-nine, decided by: git worktree list answering fewer entries
- no worktree a live agent is working in was removed, decided by: read the session log for actors that wrote in the last few minutes, beside the names that went
- the rule for when a worktree may be swept is written down, decided by: read it beside this token

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

