---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the delete guard resolves
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: cage
---

## detail

The delete guard refuses a removal under `.se/scratchpad`, which its own message names as an exception.

Reproduced in September 2026. A command ran `cd .se/scratchpad/spike` and then `rm -f styles/Spike/Shout.yml`, naming the file relatively. The guard read that path against the work root, found `<root>/styles/Spike/Shout.yml`, and refused it as inside the tree.

The file was written by the same session, one call earlier, inside the folder the guard says is free.

So a relative path is resolved against the wrong folder. A spike that writes and clears its own fixtures cannot clear them.

The search guard has the same fault. It refused a grep over a path outside the tree, because the path sat in a shell variable. Both guards read the literal command text and judge a path they never resolved.

## done when

- a removal of a relative path under `.se/scratchpad`, run from a folder inside it, is allowed, decided by a Go test driving the guard with that command
- a removal of a relative path naming a tracked file is still refused, decided by the same test
- the guard resolves a relative path against the folder the command runs in, decided by reading the source
- a search naming a path in a shell variable is not refused, decided by a Go test driving the search guard with that command

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

