---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: req-a-work-token-nothing-references-is-reported
type: "[[requirement]]"
statement: When the coverage report runs over the work-token pool, the engine shall name every standing token that no corpus node references.
kind: functional
verify_method: test
breaks_if_removed: A token nothing points at is invisible to every reader who arrives through the trace, so it waits in the pool until somebody happens to list it.
breaks_how_badly: abrasive
refines:
  - uc-see-the-whole-pool-from-any-clone
source_refs:
  - uc-see-the-whole-pool-from-any-clone
priority: could
---

## Detail

| what is joined | against what |
| --- | --- |
| every standing work token | every reference key in the corpus |
| the result | the tokens with no inbound reference |

AN UNREFERENCED TOKEN IS NOT A DEFECT BY ITSELF. A token minted from a note
may legitimately stand alone until something picks it up.

SO THIS REPORTS AND DOES NOT REFUSE. The report is what makes the pile
visible; deciding what to do with it is the retro's.

FOURTEEN TOKENS WITH NO REFERENCE stood when the overhaul counted them, and
the plan routes them into three piles.
