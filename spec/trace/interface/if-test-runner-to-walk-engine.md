---
minted_in: i36
id: if-test-runner-to-walk-engine
type: "[[interface]]"
statement: The test runner sends the latest test record's verdict to the walk engine for tolerant boot-time interpretation.
source: el-test-runner
destination: el-walk-engine
carries:
  - flow-battery-verdict
form: file
source_refs:
  - fn-run-a-governed-walk.tolerate-old-test-records
  - req-boot-needs-no-manual-test-metadata-repair
---

The test runner owns the historical record shapes. The walk engine reads the
result through this interface without requiring a manual metadata repair.
