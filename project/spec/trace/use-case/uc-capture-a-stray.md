---
id: uc-capture-a-stray
type: "[[use-case]]"
statement: Record a finding that is not the current job, without leaving the current job.
actor: stk-engineer-driving-agents
trigger: something wrong, missing or better is noticed while doing something else
precondition: none
guarantee: the finding is in the inbox, counted and visible, and the work in hand did not move
refines:
  - sty-capture-a-stray
killer: false
---

## Main scenario

1. The finder writes the finding in their own words, in one call or one box.
2. The system stores it and raises the inbox count.
3. The finder returns to what they were doing. No state was left and no plan changed.
4. The note stays visible in the count and the feed until it is dispositioned.

## Extensions

- 1a. The finder is an agent mid-walk. Same call, same result — chasing the finding instead would abandon the state in hand, which is what this exists to prevent.
- 1b. The point settles over a live discussion rather than in one moment. One consolidated note is written when it settles, not one per exchange.
- 2a. The finding is already covered by a standing note. It is still captured; the retro is where duplicates are judged, not the moment of writing.
- 4a. The note is disproved before the retro. Whoever disproves it drains it there and then, so later surveys do not lie.
