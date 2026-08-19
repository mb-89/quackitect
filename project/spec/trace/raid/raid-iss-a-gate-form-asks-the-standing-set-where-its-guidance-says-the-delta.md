---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-gate-form-asks-the-standing-set-where-its-guidance-says-the-delta
type: "[[raid]]"
kind: issue
statement: "A scoped gate's guidance says to argue the delta, and its fields serve every standing item, so most of the answers are the words not exercised."
owner: the maintainer
trigger: every gate whose fields draw from a live source, in every minor record
status: open
impact: "i5's validation gate served 24 must stories and 9 value props for a delta of 5 requirements. Nineteen answers say the delta did not touch them. The signal a reader wants is buried in a form that is mostly filler, and filler is what teaches a reader to skim."
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---
## What was observed

READ 2026-08-19 off `gate-validation` in i5.

THE GUIDANCE IS EXPLICIT: "Scoped: the DELTA's props argued, its new must
stories demonstrated, resident reports cited as they stand. The full
all-stories walk belongs to product cadence, not to every minor."

THE FIELDS ARE NOT. `meets_need` served every value prop and
`musts_demonstrated` served every must story, and the submit refused until
every one of them was named.

## Why it is only tolerable

THE FILLER IS HONEST. Writing "not exercised by this delta" is true, cheap and
better than inventing a demonstration.

AND IT HAS A REAL COST. A form where nineteen of twenty-four lines say nothing
is a form a reviewer scans rather than reads, and the five that matter are in
the middle of it.

## What repair consists of

- The live source for a scoped gate should be the delta's own items, with the
  standing set available and not demanded.
- The product-cadence walk that DOES want every story keeps the wide source.
  The two are different questions and today they share one field.
