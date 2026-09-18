---
kind: [[handover]]
status: done
urgency: now
---

# Where it stands

A count of returns mints a question for a human. Two agent hands disagreeing is
what the count reads, and a human is what it writes.

This branch makes the count insert a step another agent takes, and gives every
cloud rule the failure it prevents.

| what changes | where |
|---|---|
| `withSettleStep` inserts `settle-<n>` under `by: anyone` | `src/scripts/pull-hand.js` |
| the fail count reaches the settle step | `src/scripts/pull-writes.js` |
| the refusal count reaches the settle step | `src/scripts/pull.js` |
| every cloud rule names the failure it prevents | `spec/guidance/cloud.md` |
| a rule carries its because, as rule twelve | `spec/guidance/guidance.md` |
| the argument for both | `spec/rationales/cloud.md`, `spec/rationales/guidance.md` |
| the chapter a settle step goes in | `spec/design_output/pull.md` |

`./RUNME.sh check` answers 0 on this commit, and the suite answers green.

# What waits

| what | who does it |
|---|---|
| merge this branch, and close it | a desk |

# How the counts read now

The agents settle among themselves first, and a person answers where they reach
no answer:

| what stands | what goes in |
|---|---|
| a count of returns, under the split cap | `settle-<n>`, `by: anyone` |
| settle steps at `work.stepsBeforeSplit` | `person-<n>`, `by: person` |
| a hand handing a question out | `person-<n>`, `by: person` |

One inserter writes all three, so the shape of a step stays in one place.

# The shape a rule takes

Version four writes a rule with its own failure beside it:

- Refactor or change behavior, one to a commit, because a green suite says nothing about which breaks.
- Leave the shape better than the speed, because a fast function nobody reads is a defect.

The instruction and the failure ride together. A reader holding half the rule
still holds what it guards.

The cloud chapter drops that shape, and a cloud box reads that chapter every
session. So every rule there names its failure now, and `spec/guidance/guidance`
carries the practice as a rule of its own.

# What surprises me

A list item caps its sentence at twenty words, tighter than prose. So a rule and
its reason stand as two sentences, which reads better than the one long line I
reach for first.

The write door refuses the past tense everywhere outside a rationale. Writing
about a fault the tree already carries wants the present tense, and that reads
oddly until the habit lands.

`spec/design_output/pull` describes a verb that stands in no script. The note
runs ahead of the code there, and this branch leaves it alone.
