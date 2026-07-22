---
id: se.q-build-identity
kind: question
statement: "Re-derive under v2 ground: build identity with no binary — dist hash"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-build-identity
v1_statement: The cache build identity is the sha256 self-hash of the running binary, computed once per process. This was chosen over a version constant. A forgotten bump would serve stale verdicts. That is the same failure class as the mtime ratchet.
status: open
---

## The ported question

build identity with no binary — dist hash

## v1 ruling (NOT ported — context only)

The cache build identity is the sha256 self-hash of the running binary, computed once per process. This was chosen over a version constant. A forgotten bump would serve stale verdicts. That is the same failure class as the mtime ratchet.
