---
id: se.q-ratchet-stamp
kind: question
statement: "Re-derive under v2 ground: ratchet stamp under RUNME/npm (with adr-global-ratchet)"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-ratchet-stamp
v1_statement: quack build writes a version stamp into the vendored source; the launcher ratchets only when the vendored stamp exceeds the installed binary version. Forward only. Mtime comparison is retired (fresh clones rebuilt the binary backward).
status: open
---

## The ported question

ratchet stamp under RUNME/npm (with adr-global-ratchet)

## v1 ruling (NOT ported — context only)

quack build writes a version stamp into the vendored source; the launcher ratchets only when the vendored stamp exceeds the installed binary version. Forward only. Mtime comparison is retired (fresh clones rebuilt the binary backward).
