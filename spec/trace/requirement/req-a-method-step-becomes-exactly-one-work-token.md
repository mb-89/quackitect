---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-method-step-becomes-exactly-one-work-token
type: "[[requirement]]"
statement: The system shall make exactly one piece of work from each marked step of a method card, carrying that step's guidance in its body and that step's evidence beneath it.
kind: functional
verify_method: inspection
breaks_if_removed: Method steps stay prose, prose does not refuse, and the fix for a measured skipped-step failure loses its proof.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - raid-asm-a-heading-per-token-survives-the-retro-card
  - uc-work-a-states-work-tokens-to-completion step 3
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

EXACTLY ONE IS THE DEMAND, IN BOTH DIRECTIONS. A step that needs two pieces
of work falsifies it, and so do two steps that fold into one.

NOTHING ABOUT A STEP LIVES OUTSIDE ITS OWN SECTION. Its guidance sits in the
body under the heading and its evidence in subheadings under that.

TWO THINGS ARE NOT SETTLED AND THIS ROW WAITS ON THEM. How a heading
declares itself a step, since a card holds headings that are not steps. And
what the subheadings under a step are called.

THE RETRO CARD IS THE PROBE. It carries twelve numbered steps and two
standing questions, and more provenance prose than any other card here.
Anything that survives it survives the rest, so the split runs before the
format is built against rather than after.
