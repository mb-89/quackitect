---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-bound-tables-header-reads-as-a-reference
type: "[[raid]]"
kind: issue
statement: "A bound table's header row is read as a list of node references, so a table whose row type carries a dash reports its own header as a reference resolving to nothing."
owner: the maintainer
trigger: any evidence field bound to a node type whose name carries a dash
status: open
impact: "The state cannot close. The refusal names the type as a dangling id, so the reader looks for a missing node instead of at the header the engine wrote itself."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## What was found

MEASURED ON THIS CLONE, 2026-08-19, when i5's author-tests refused with
`checks: no artifact for — test-spec`.

The engine builds a bound table itself. Its header's first cell is the row
TYPE, and the reference extractor reads the first cells of every row that
starts with a pipe.

WHY IT BIT HERE AND NOT ON THE FIELD BESIDE IT. The id test wants a word, a
dash and more. `raid` has no dash and passes through; `test-spec` has one and
reads as an id.

SO THE FIELD THAT WORKS AND THE FIELD THAT REFUSES DIFFER BY A HYPHEN, which
is why it stood undetected: the probes field is bound the same way and has
never failed.

## What was done

THE EXTRACTOR NOW SKIPS A HEADER, told from a data row by the rule row beneath
it. That is the only thing a markdown table offers to tell them apart, and it
is the same signal a reader uses.

## Why it was fixed here rather than noted

IT BLOCKS. The state refuses while the header dangles, and no content the
agent can write changes what the engine generates. Every author-tests from now
on would stop at the same line.

THE FIX IS OUTSIDE THIS RECORD'S BLESSED SCOPE, and that is said out loud at
gate-implementation rather than folded in quietly.
