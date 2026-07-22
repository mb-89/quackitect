---
id: se.q-table-interact
kind: question
statement: "Re-derive under v2 ground: per-surface: Obsidian plugin may use libs; exported HTML stays dependency-free single-file"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-table-interact
v1_statement: "Table interactivity extends the existing Bases-table substrate in vanilla inline JS. Rejected: a JS table library, since it breaks the CSP-safe, dependency-free single file."
status: open
---

## The ported question

per-surface: Obsidian plugin may use libs; exported HTML stays dependency-free single-file

## v1 ruling (NOT ported — context only)

Table interactivity extends the existing Bases-table substrate in vanilla inline JS. Rejected: a JS table library, since it breaks the CSP-safe, dependency-free single file.
