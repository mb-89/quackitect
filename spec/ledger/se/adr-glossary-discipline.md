---
id: se.adr-glossary-discipline
kind: decision
statement: One note per glossary term lives in the method layer, with frontmatter carrying the per-vehicle domain-or-meta classification. Usage is a marked LINK to the term note. The glossary chapter is generated used-terms-only, with back-references and first-use long-form expansion. A link to a missing term errors. An unlinked scanned usage advises.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0012_spec_book
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
The LaTeX glossaries discipline adopted whole after research (definition separate from marked usage is what makes autogeneration and consistency mechanical); per-term notes repeat the owner's one-note-per-thing pattern from the stakeholder classes.
