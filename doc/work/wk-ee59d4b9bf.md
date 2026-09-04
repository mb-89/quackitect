---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: short username guards nothing
# where the token stands. The process owns these values.
status: open
---

## detail

Found reviewing wk-120d7c9685.

identityMaterial in src/engine/identity.go matches a username only where the name runs to three characters or more. The floor is sound on its own: a two-letter name matches a size in megabytes, and a guard that refuses that is one somebody turns off.

The consequence is that this box has no username guard at all. Its own name is two characters, so the branch never runs, and the class the ruling names is unguarded on the machine the guard runs on. The table proves the rule against a name the box does not have.

The token that added it says so and calls it a departure. The gap stands.

## proposed action

Give a short name a handle that ordinary prose does not carry: match it where a path or a home folder holds it, rather than as a bare word. The tree's actor names are the other witness the detail of wk-120d7c9685 already names.

## done when

- prose carrying a home path built from a two-character username is refused as a username
- the row for a size in megabytes beside that name is still taken
- go test ./src/engine answers ok

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

