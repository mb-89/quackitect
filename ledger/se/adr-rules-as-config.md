---
id: se.adr-rules-as-config
kind: decision
statement: "Configuration splits from code in three tiers. Pure data, such as vocabularies and grammars, loads from method/config files. Shapes and skeletons, such as mint bodies and card layouts, load from the template files that already exist as their registry. Logic variants become strategy registries in code, where adding a variant never touches shared dispatch. The compile boundary is stated honestly: config selects among compiled strategies or feeds data to a generic engine, and it never injects behavior."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0017_pruning
v1_type: adr
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: with rule-no-embedded-data and adr-m3zsxta
---

## Rationale (not load-bearing)
Owner discussion 2026-07-10 (the sebot grammar-in-JSON precedent generalized). Tier (a) - lists as config: retired vocabulary, weasel words, facets; a config edit changes behavior with no rebuild. Tier (b) - shapes as templates: the i16 model registry proved the pattern (modelStubFor reads the kind file's example); mint's per-kind body switch migrates the same way - skeletons come FROM the item templates, killing a code switch AND a DRY violation at once. Tier (c) - strategy maps replace switch-case dispatch (selftest dispatch, figure kinds) so a new variant registers instead of editing shared code - but this is code hygiene, not config: in a zero-dep compiled binary, new LOGIC always means writing Go; the pattern only guarantees you never rewrite the dispatcher. The strongest form remains data-driven generic engines (the grammar checker), applied wherever the domain is expressible as data.
