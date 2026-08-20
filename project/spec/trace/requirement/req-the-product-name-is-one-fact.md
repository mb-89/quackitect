---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-the-product-name-is-one-fact
type: "[[requirement]]"
statement: The system shall take its own name from one file, and no other file it ships shall spell that name out.
kind: constraint
verify_method: test
breaks_if_removed: A copy renaming itself scatters its identity through the tree, and every later update meets a conflict on every file that spells the old name.
breaks_how_badly: corrosive
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 1
  - sty-vendor-it-into-my-product
  - RUNME.ps1 lines 28-33
priority: should
weighs_against:
  - req-query-is-deterministic > — a name scattered across files causes a conflict on every update; a query that answers differently twice is caught the second time somebody runs it
---

## Detail

THIS IS A CONSTRAINT TO PRESERVE RATHER THAN TO BUILD. It is true today and
nothing checks it, which is exactly how a property this cheap gets lost.

THE SOURCE SAYS SO IN ITS OWN WORDS, at RUNME.ps1 lines 28-33: "THE PRODUCT
NAME IS ONE FACT (brand.json at the root). Nothing below spells it out, so an
export renames the whole system by writing that one file."

| facet | what binds |
| --- | --- |
| the fact | The product's name shall be resolved from the brand file at the root. |
| the count | The number of files below that root spelling the product's name shall be zero, excluding this requirement and the brand file itself. |

## Why it matters more under vendoring than it did before

A COPY THAT SPELLED ITS NAME THROUGH A HUNDRED FILES would meet a hundred
conflicts on every update it takes. One fact at the root means a rename costs
one line of conflict, once, and an update from the source never refers to a
name that moved.

SO IT IS LOAD-BEARING FOR RECEIVING, which is what turns it from housekeeping
into a requirement. Before this iteration a scattered name was cosmetic.

## Why the check is a count rather than a review

ONE HARDCODED NAME ANYWHERE UNDOES IT, and a hardcoded name is exactly the kind
of thing that arrives in an unrelated change nobody reviewed for this. A count
catches it on the run that introduces it.

## The neighbouring ruling, which this one does not restate

v1 REJECTED SUBSTITUTING BRAND NAMES AT RENDER TIME, because rewriting text the
ledger hashes hides content from the trust chain. One fact at the source and no
substitution at the surface are the same decision seen twice, and the second
half lives in the record rather than here.
