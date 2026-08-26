---
minted_in: i9
id: raid-risk-the-never-committed-wording-is-corrected-in-one-place-only
type: "[[raid]]"
kind: risk
statement: The rule that machine-local state is never committed is written in at least two places, and correcting one of them leaves the other telling newcomers something the repository contradicts.
owner: the driving agent
trigger: the first newcomer who reads the front door after the marker lands
status: open
impact: A stranger reads that nothing in that folder reaches version control, then sees a file from it in the repository. The front door is exactly where a contradiction costs most, because it is the one document read by somebody with no way to check it.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - the ignore file's first line, and the README's own tree listing, both stating the rule
  - this iteration's goal system, which rules that exactly one file is committed and carries no state
---

## What the risk is

THE RULE HAS AT LEAST TWO WRITTEN HOMES. The ignore file says it as a comment
above the pattern. The README says it inside the tree listing a newcomer reads
first.

THE RULING SHARPENS THE RULE RATHER THAN DROPPING IT. Machine-local CONTENT
never enters version control; the folder's existence is not content. Both
sentences need that distinction or both become wrong.

## Why it is expected

TWO PLACES IS ALREADY MORE THAN ONE, and neither points at the other. Whoever
edits the ignore file has no reason to think about the README, and the edit
that matters is the one in the file being changed.

A SEARCH FINDS OVER FIVE HUNDRED LINES carrying the phrase or its neighbours
across the tree, so the two known homes may not be all of them.

## Why the front door is the sharp end

AN ENTRY DOCUMENT IS READ BY SOMEBODY WITH NO CONTEXT. Every other reader can
check the code. A newcomer takes the sentence at its word, and a false sentence
there is the most expensive kind this project has.

## What closes it

ONE SWEEP RATHER THAN ONE EDIT. Find every place the rule is stated, and
correct them in the same act that lands the marker. The iteration already owes
a reason per hidden name, and this is the same discipline pointed at prose.
