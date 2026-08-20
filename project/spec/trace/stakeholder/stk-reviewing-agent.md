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
at gates, a researcher where research is asked for.

OF THOSE FOUR, EXACTLY ONE HAD A NODE — `stk-agent`, the walker. This node
first claimed three of the four were covered, and that was unsupported: the
guide has no node, and the RESEARCHER has none either and is neither minted
nor struck anywhere in this milestone.

SO THIS MINT LEAVES A SIBLING GAP AND SAYS SO. The same ruling that justifies
minting the assessor names a researcher nothing carries. It is registered
rather than quietly minted, because a role invented to tidy a sentence is worse
than a gap that is written down.

IT IS NOT `stk-agent`. That role WALKS — it reads guidance, holds a position,
recovers from refusals, and its concerns are all about surviving the machine.
This one holds no position, walks nothing, and its whole value is that it
arrives ignorant.

THE DISTINCTION EARNED ITS KEEP ON THIS ITERATION, and the figure below is the
corrected one.

TWO REVIEWING AGENTS RAN ACROSS M0 AND M1, not three. Between them they found
the demand-ledger cascade, an unswept register, an invalid measurement and an
inflated figure. A THIRD PASS RAN AT M2 and overturned this milestone's central
claim about who is listening.

THE SCHEDULER LITERATURE WAS NOT THEIRS. It came from a RESEARCHER, which the
roster ruling names as a separate role, and crediting it here counted another
role's work toward this one. The iteration's own M1 gate separates them in as
many words, so the evidence to get it right was already on the record.

WHAT SURVIVES THE CORRECTION: the walker found none of what the separate
readers found, which is the claim the mint actually rests on.

## Notes (not load-bearing)

INFLUENCE IS HIGH AND INTEREST IS LOW, like `stk-agent` and for the same
reason: nothing about the outcome matters to it, so the product may never rest
on its goodwill. Unlike `stk-agent`, its influence is exercised in one shot on
one artifact, which is why it sits below the walker rather than beside it.
