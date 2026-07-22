---
id: se.q-connections-reified
kind: question
statement: "Re-derive under v2 ground: kind vocabulary survives into P4; storage superseded by node-local edges"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-connections-reified
v1_statement: Semantic relations reify as first-class connections in one home, spec/connections/<kind>/, with a SysML2-aligned kind vocabulary declared in the type layer. The loader reconstructs node adjacency hash-neutrally (blessed history never mass-suspects), connection content joins the identity root, and connections stay off the report graph's node whitelist.
status: open
---

## The ported question

kind vocabulary survives into P4; storage superseded by node-local edges

## v1 ruling (NOT ported — context only)

Semantic relations reify as first-class connections in one home, spec/connections/<kind>/, with a SysML2-aligned kind vocabulary declared in the type layer. The loader reconstructs node adjacency hash-neutrally (blessed history never mass-suspects), connection content joins the identity root, and connections stay off the report graph's node whitelist.
