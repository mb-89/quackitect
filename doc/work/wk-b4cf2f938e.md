---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: chapters lost their rules
# where the token stands. The process owns these values.
status: open
---

## detail

FOUND REVIEWING wk-8863048da6, which is not this token's parent because nothing here blocks it.

That change added two Actionables to doc/guidance/driving-the-engine.md and renumbered the rest. Old rule 3 became 5, old 10 and 11 became 12 and 13. The Discussion chapters were not renumbered with them.

The schema says one chapter per starred rule, titled with that rule's number, in src/schemas/guidance.schema.yaml. Measured on 95b9423 against 95b9423~1: starred rules went from 2-11 to 2-13, and the chapters stayed 2-11. So rules 12 and 13 are starred and have no chapter at all, and every starred rule from 4 up now points at a chapter two places off its subject. Rule 4 is "A standing claim is granted at once" and chapter 4 is "The tool it found, not the one you know".

The Discussion also went from 997 words to 1021, and the schema allows 1000.

WHAT IT COSTS. se lint answers three findings on this one file, and it answered none on it before. This file is projected whole into .claude/output-styles/quackitect.md and .github/copilot-instructions.md, so the standing rules every agent is handed carry the wrong cross-references. An agent reading rule 4 and going to chapter 4 for the reasoning finds a chapter about tools.

The check that catches the class already exists and is red: the guidance lint. It was not run over the change.

## done when

- se lint answers no finding naming driving-the-engine.md, decided by: .bin/se lint | jq '[.findings[] | select(.id=="driving-the-engine.md")] | length' answering 0
- every starred rule has a chapter under its own number, decided by the same lint run, which is the rule that reports it
- the Discussion is within the 1000 word cap the schema names, decided by the same lint run

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

