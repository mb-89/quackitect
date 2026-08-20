---
minted_in: i36
id: fn-run-a-governed-walk.tolerate-old-test-records
type: "[[function]]"
cluster: the-record-life
statement: read the latest test record under any of its historical shapes without asking for a fresh run
satisfies:
  - req-boot-needs-no-manual-test-metadata-repair
inputs:
  - flow-battery-verdict
  - flow-repository
outputs:
  - flow-test-check-result
---

## Rationale

The battery's own recorded shape changes as the engine grows fields on it.
A repository that has been alive for many iterations carries verdicts in
several of those shapes, and boot has to read the oldest one it holds
exactly as readily as the newest.

WHY THIS IS ITS OWN FUNCTION. Serving a step already reads whatever the
walk needs; tolerating an old record shape is a different concern, with its
own failure mode — a boot that stalls asking a person to manually re-run a
battery just to satisfy a metadata field the record never needed to answer
this question in the first place.
