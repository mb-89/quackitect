---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-risk-the-git-ceiling-fails-open-and-a-run-reads-the-answers
type: "[[raid]]"
kind: risk
statement: "The ceiling that stops a benchmark run resolving commits newer than its rewind point fails open, so the run reads the answers the original iteration produced and every number taken under it is worthless."
owner: the maintainer of the machine
trigger: the first benchmark run, and every change to the git lane allowlist or to the ref-reading path afterwards
status: open
impact: "A run that can reach the future measures search-and-paste speed rather than the machine. The failure is silent — the report looks exactly like a valid one, and the number is wrong in the flattering direction."
breaks_how_badly: fatal
how_likely: plausible
source_refs:
  - training-iterations
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Why it is fatal rather than crippling

THE PRODUCT STOPS BEING THE THING IT CLAIMS TO BE. A benchmark whose numbers
cannot be trusted is worse than no benchmark, because decisions get made on
it.

A CRIPPLING GRADE WOULD SAY ONE USE CASE CANNOT COMPLETE. Here every use case
completes and lies.

## Why it is plausible rather than conceivable

ONE ORDINARY EVENT PRODUCES IT, with no coincidence in the story. Somebody
adds a verb to the git lane allowlist, or a new read path takes a ref, and
nobody remembers the ceiling.

THE ALLOWLIST ALREADY CARRIES SHOW, LOG AND DIFF. Nothing bounds which commit
they may reach today.

## What is being done about it

THE CEILING FAILS CLOSED OR NOT AT ALL. A commit that cannot be proven an
ancestor of the rewind point does not resolve.

THE CASE IS WRITTEN BEFORE THE MECHANISM. A test that a non-ancestor commit
refuses, at every door: se_git, and a ref read through the file lane.
