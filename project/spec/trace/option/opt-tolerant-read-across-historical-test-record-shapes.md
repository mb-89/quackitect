---
minted_in: i36
id: opt-tolerant-read-across-historical-test-record-shapes
type: "[[option]]"
statement: Read the latest test record defensively across every historical shape it might carry, filling in missing fields with safe defaults, instead of refusing or asking for a fresh run.
cluster: cluster-the-record-life
found_by: prior-art
source: "This project's own required behaviour: req-boot-needs-no-manual-test-metadata-repair, which the finders' dry well and probing found no external precedent for."
---

## Mechanism

Boot reads whatever the latest test record actually contains. A field a
newer engine version added but an older record never wrote is treated as
absent rather than as a parse failure, and boot proceeds on what the
record does carry.

WHAT SURVIVES THE TRANSFER. Nothing external transferred; the finders
found no shipped or written precedent for this exact shape, per the dry
well recorded at find_prior_art.

WHAT IT COSTS. Every reader has to keep knowing every historical shape it
might meet, forever, unless paired with opt-migrate-test-records-at-write-time.
