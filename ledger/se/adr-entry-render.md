---
id: se.adr-entry-render
kind: decision
statement: Harness entry files, AGENTS.md and .github/copilot-instructions.md, are rendered by the engine from contract.md. A per-harness template wraps the verbatim contract body, run by the maintainer inside `quack build` and standalone. `quack lint` re-renders and byte-compares to flag drift. This was chosen over pointers, since thin harnesses are proven not to follow them. It was also chosen over git-hook auto-render as the guarantee, since hooks do not fire everywhere and are kept only as optional convenience.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0009_contract_attestation
v1_type: adr
v1_adjudicated_by: human
v1_depends_on: []
v1_class: review
v1_killer: "false"
v2_amendment: harness templates re-checked against 2026 harnesses
---

## Rationale (not load-bearing)
A generated file is an output, not a duplicate — DRY holds with one authored source. The render also gives the vocabulary-sweep note a natural home: templates can reword framing without touching the contract body.

## v2 amendment (applied at mint)

harness templates re-checked against 2026 harnesses
