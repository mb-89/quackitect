---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: req-a-heading-appears-once-in-a-node
type: "[[requirement]]"
statement: When the conformance sweep runs, the engine shall report every node in which the same section heading appears more than once.
kind: functional
verify_method: test
breaks_if_removed: A doubled section splits one concern across two places, and a reader who stops at the first half reads half the demand.
breaks_how_badly: abrasive
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up
priority: should
---

## Detail

| what is compared | at what level |
| --- | --- |
| section headings inside one node | exact text, after trimming |
| headings at different levels | compared separately |
| headings in different nodes | never compared |

TWENTY-FOUR NODES CARRIED A DOUBLED HEADING when this row was written, counted
on 2026-08-28 and matching the overhaul's own count of eleven plus thirteen.

THE COUNT IS THE PASS LINE. The sweep reports zero, or it names every node
that still doubles.
