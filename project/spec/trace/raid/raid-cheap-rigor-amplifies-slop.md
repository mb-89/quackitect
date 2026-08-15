---
minted_in: i1
id: raid-cheap-rigor-amplifies-slop
type: "[[raid]]"
kind: risk
statement: Making rigor cheap removes the effort that used to stop people writing documents nobody needed.
owner: the machine
trigger: when any form's average filled length doubles against its own history
status: open
breaks_how_badly: crippling
how_likely: plausible
impact: The spec grows faster than anyone reads it, and the volume itself becomes the reason nobody checks the content.
source_refs:
  - the ratchet
  - the length budgets
---

Writing a milestone document by hand hurt, and the hurt was doing work: it
kept the document short and kept marginal documents unwritten.

That throttle is gone. What replaces it is the ratchet and the length
budgets, and neither has been tested against a determined generator.

WHY THE TRIGGER IS A RATIO rather than a threshold: forms differ by an order
of magnitude in honest length, so a fixed cap would fire on the wrong ones.
A form doubling against ITSELF is the signal.
