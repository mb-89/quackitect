---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: guidance lost landed incidents
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: cage
---

## detail

Four incidents that wk-526ac833fb and wk-c93aac62be landed in the guidance are gone from the working tree. Each was present at that token's ended commit, and a later compression removed it.

testing.md chapter 4 lost the sentence naming a dispatcher that says which token it hands back and never what the record holds for the rest. That is the lesson of wk-4243c04e79.

work-token.md lost three. Chapter 3 lost the criterion naming a check no file declared. Chapter 5 lost the detail enumerating a question, three rules and two old sentences while the criteria pinned only two. Chapter 12 lost the blanket sentence claiming every check was watched failing.

Every rule still states its practice, so what was lost is the incident that earns it. The second criterion of both tokens asks that each consumed note's lesson be findable in the guidance. Re-run at HEAD it returns fewer hits than at the ended commit.

## proposed action

Restore the four sentences from the ended commits, or say per sentence why the practice stands without its incident. The ended commits are 3dcc0969a4252f5aa6ff27005f147363374d4204 for testing.md and adb8b8457afd5b3fa76620f643a8c1dc89b752cb for work-token.md. Where a file sits at its word cap, say what pays for the restoration.

## done when

- the dispatcher incident is under one chapter of testing.md, or this token says why the rule stands without it: se find --words dispatcher --path doc/guidance/software-development/testing.md
- the check no file declared, the unpinned payload and the blanket red are each under one chapter of work-token.md, or this token says why each rule stands without its incident: se find --regex "no file declared|enumerated a question|blanket sentence" --path doc/guidance/work-token.md
- both files still lint clean, testing.md and work-token.md at fifteen rules or fewer: .bin/se.exe lint

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

