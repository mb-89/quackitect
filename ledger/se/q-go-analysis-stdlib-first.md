---
id: se.q-go-analysis-stdlib-first
kind: question
statement: "Re-derive under v2 ground: tsc/eslint gate — a new decision, not a port"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-go-analysis-stdlib-first
v1_statement: quack build always runs gofmt and go vet (the toolchain is already required) and fails on findings; staticcheck runs grab-if-present from the tools lane, never as a required dependency.
status: open
---

## The ported question

tsc/eslint gate — a new decision, not a port

## v1 ruling (NOT ported — context only)

quack build always runs gofmt and go vet (the toolchain is already required) and fails on findings; staticcheck runs grab-if-present from the tools lane, never as a required dependency.
