---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: req-one-rule-is-expressed-once-and-read-by-two-callers
type: "[[requirement]]"
statement: The one-door mechanism shall express each rule in one place and serve it to both the write-time refusal and the whole-tree sweep from that place.
kind: constraint
verify_method: inspection
breaks_if_removed: The refusal and the sweep drift apart, and only their disagreement is visible, which is exactly how a second surface accreted here once before over months.
breaks_how_badly: corrosive
refines:
  - uc-declare-an-exception-to-a-rule
  - uc-answer-every-export-with-a-door-or-a-deletion
source_refs:
  - raid-asm-the-widget-guards-shape-generalises-to-a-second-rule
priority: must
---

## Detail

TWO CALLERS ARE NEEDED AND NEITHER IS OPTIONAL, because they catch different
breaks.

| caller | catches | misses |
| --- | --- | --- |
| the write-time refusal | a break arriving with a write, while the author is present | anything the lane never saw |
| the whole-tree sweep | a break nobody wrote — a rename, a merge, a registry line deleted under a module | nothing, but it reports late |

NO SECOND COPY. Each caller asks the one expression of the rule. Neither holds
its own version of what the rule says.

THE PRECEDENT IS ALREADY BUILT HERE. The widget guard runs exactly this shape
and its refusal section states the arrangement in one sentence: one rule, two
callers, no second copy.

THE FAILURE THIS PREVENTS IS RECORDED RATHER THAN IMAGINED. The same refusal
section records that a second surface accreted over months and nothing
objected, because nothing could, and that only the disagreement between the two
halves was ever visible.
