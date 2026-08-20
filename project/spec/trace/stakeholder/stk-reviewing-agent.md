---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: stk-reviewing-agent
type: "[[stakeholder]]"
role_class: assessor
dicet: influencer
disposition: "0"
interest: 0.1
influence: 0.7
weight: 0.7
statement: An AI reading a finished artifact with no shared context, to judge whether it is sound — the fresh eyes a gate spends when the stakes are high, and never the agent that wrote the thing.
---

## Concerns

- IT MUST NOT HAVE WRITTEN WHAT IT JUDGES. The contract already forbids judging
  text you wrote in the same pass, and a reviewer that shares the walker's
  context breaks that rule without either of them noticing.
- IT READS ONE ARTIFACT AND NOT A WALK. That is what makes it cheap and what
  bounds it: it can check a claim against the tree and it cannot know what the
  walk was trying to do.
- IT IS SIZED BY DIFFICULTY, NOT BY STAKES, and this is the sharp one. The
  autonomy dial decides WHETHER a reviewer reads; nothing yet decides HOW
  STRONG that reviewer is. Two independent lookups were designed and only one
  of them has a subject.
- ITS FINDINGS ARE CLAIMS, NOT VERDICTS. Measured on this iteration: of nine
  claims one adversarial pass made, eight held and one did not. A reviewer that
  is believed without checking is a second author.
- IT COSTS A WHOLE CONTEXT PER READING. Cheaper than a walker because it
  carries no history, and not free, so a gate that spends one on everything
  spends more than the work is worth.

## Why it is a role and not an implementation detail

THE ROSTER RULING NAMES IT (owner, 2026-08-20): a guide, a walker, a reviewer
at gates, a researcher where research is asked for. That is a cast, and three
of the four already have nodes or are covered. This one did not.

IT IS NOT `stk-agent`. That role WALKS — it reads guidance, holds a position,
recovers from refusals, and its concerns are all about surviving the machine.
This one holds no position, walks nothing, and its whole value is that it
arrives ignorant.

THE DISTINCTION EARNED ITS KEEP ON THIS ITERATION. Three reviewing agents ran
across M0 and M1. Between them they found the demand-ledger cascade, the
scheduler literature that argues against the design, an unswept register, an
invalid measurement and an inflated figure. The walker found none of the five.

## Notes (not load-bearing)

INFLUENCE IS HIGH AND INTEREST IS LOW, like `stk-agent` and for the same
reason: nothing about the outcome matters to it, so the product may never rest
on its goodwill. Unlike `stk-agent`, its influence is exercised in one shot on
one artifact, which is why it sits below the walker rather than beside it.
