---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters
type: "[[raid]]"
kind: assumption
statement: "A verbatim-overlap check between the offered statement and the raw note catches the copies that actually happen, because the copy that happens is a paste rather than a paraphrase."
owner: the driving agent
trigger: "the first mint refused by the check, or the first leak found in the pool by the corpus sweep"
status: open
impact: "req-a-minted-option-is-authored-never-the-note-s-own-text is the only FATAL row in the delta and this is the only mechanical thing standing behind it. If the copies that happen are paraphrases, the check is theatre and the hard line has nothing enforcing it."
breaks_how_badly: fatal
how_likely: plausible
probe: "UNPROBED, because the thing it is about does not exist yet: the check is not built and the pool has no content, so there is no distribution to measure. The probe is on the body - the longest verbatim run shared between each minted option and its source note - and it is owed to the migration. Its FATAL grading is the argument for running it early rather than at fifty mints."
probed: 2026-08-18
source_refs:
  - req-a-minted-option-is-authored-never-the-note-s-own-text
  - raid-risk-the-rewrite-carries-the-private-sentence-across
weighs_with: none
weighs_against: none
---

## Probe

OWED, AND IT IS CHEAP. The check is written against a belief about human and
agent behaviour, not against a measurement, and the measurement exists as soon
as the pool has any content.

THE PROBE: after the first fifty mints, take every minted option and its source
note and measure the longest verbatim run they share. A distribution clustered
near zero says authors are writing; a fat tail near the note's own length says
they are pasting and the check is doing real work; a hump in the middle - long
shared runs that the check let through - is the falsification.

WHAT WOULD FALSIFY IT: leaks that got through as near-copies. One found by the
corpus sweep is enough, because the row it defends is fatal.

WHY plausible AND NOT conceivable. An author under time pressure who knows a
paste will be refused will reword the paste, and a reworded private sentence is
still a private sentence. The check makes the lazy path illegal; it does not
make the honest path easier.
