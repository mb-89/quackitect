---
id: raid-module-import-drift
type: raid
kind: risk
probability: 0.5
impact: 0.8
mitigation: deterministic dry-run manifest with provenance
owner: maintainer
status: open
statement: Imported modules can drift from their source or overwrite local vehicle work.
---

The update command must show create, write, delete, and provenance changes before it writes.
