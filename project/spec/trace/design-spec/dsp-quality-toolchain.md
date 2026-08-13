---
id: dsp-quality-toolchain
type: "[[design-spec]]"
statement: the mechanical quality floor, carried by the battery scripts, the voice lint and the write-path fixer
realizes:
  - "el-test-runner"
  - "if-record-store-to-test-runner"
  - "if-test-runner-to-record-store"
files:
  - "project/deliverable/engine/lint.ts"
  - "project/deliverable/engine/bin/grades-complete.ts"
  - "project/deliverable/engine/bin/backfill-minted.ts"
  - "project/deliverable/engine/lintfix.ts"
  - "project/deliverable/engine/bin/selftest.ts"
  - "project/deliverable/engine/bin/smoketest.ts"
  - "project/deliverable/engine/bin/preflight.ts"
  - "project/deliverable/engine/bin/test-timings.mjs"
---

## Responsibility

What a machine can check, a machine checks. Scoped runs by file with
structured counts; the battery as the earned exception; the unchanged
tree keeping its verdict; timings recorded per case. The voice lint
sweeps prose for walls and chains. The fixer returns formatted,
safe-fixed content with the changes named, and leaves uncovered files
exactly as written.
