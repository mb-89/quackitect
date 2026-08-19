---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-the-typecheck-is-unreachable-from-the-gates-that-ask-for-it
type: "[[raid]]"
kind: issue
statement: "Two gates ask round zero for the typecheck, and neither grants a tool that can run one, so the number is always carried rather than taken."
owner: the maintainer
trigger: every gate-validation and gate-release, in every record
status: open
impact: "A gate that asks for a measurement it cannot take teaches the honest answer to look like the dishonest one. Restating a stale number reads identically to re-taking it, and only the writer knows which happened."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---
## What was observed

READ 2026-08-19 off the two gates' own tool lists in i5.

`gate-validation` grants `se_test` and not `se_run`. `gate-release`
grants neither. Both ask `round_0_verify` for an item named types.

`se_test`'s battery runs biome, preflight, selftest and the corpus sweep. It
does NOT run `tsc`, so even the gate that has `se_test` cannot answer the
question it is asked.

## What i5 did instead

BOTH GATES CARRIED THE NUMBER FORWARD from the implementation gate, and both
said so in the field, naming every write since and showing that none of them was
executable.

THAT IS THE BEST AVAILABLE ANSWER AND IT IS NOT A GOOD ONE. Nothing in the form
distinguishes it from a gate that simply restated the old number.

## What repair consists of

- Put `tsc` in the battery, which is the smallest change and makes
  `se_test` a true answer to the question.
- Or grant the gate the tool that runs it.
- What must not happen is dropping the item. The question is right; only its
  reachability is broken.
