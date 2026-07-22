---
id: se.adr-book-two-stage
kind: decision
statement: "Truth lives only in the spec sources: nodes, manifests, and prose units with their marks. All judgment happens there. Everything downstream is deterministic. The emitter renders truth to one self-contained HTML with transclusion at emit time. It MAY materialize assembled chapter markdown as an EPHEMERAL review surface in the data home. That surface is regenerated every emit, never committed, and never a source of truth. View-time assembly stays excluded (req-book-dom-static)."
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
p3_note: truth in sources, downstream deterministic
---

## Rationale (not load-bearing)
Owner-refined at M4: the intermediate markdown is useful only as a review surface - the reader corrects the SPEC sources, never the projection, and the next emit proves the correction took. This is the substrate thesis applied to the emitter itself (judgment upstream, deterministic downstream). Whether the intermediate stage materializes files is an M6 implementation call, not architecture; the recorded tripwire (collapse to one-pass if assembly eats schedule) is trivially cheap because nothing depends on the intermediates existing.
