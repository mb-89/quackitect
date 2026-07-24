---
id: se.q-p3delta-vale-autopull
kind: question
statement: "P3 verdict needed for v1 adr-vale-autopull: present at the P3 cut but never named by a P3 verdict; prose-lint tooling choice — proposed default: re-derive under the TS toolchain"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: owner
v1_statement: The register lane runs Vale, auto-pulled once per OS into the data home and run as a subprocess. It is never linked, never hand-rolled. When the pull fails or the binary is missing, the engine prints a loud warning that the prose linter is absent and prose quality is likely to suffer. The advisory lane stays empty.
status: resolved
verdict: re-derive — principle kept (vendored real linter, never hand-rolled, loud when absent); the tool gets re-decided under the TS toolchain when the prose lane arrives (owner, 2026-07-23)
---

## Why this is open

present at the P3 cut but never named by a P3 verdict; prose-lint tooling choice — proposed default: re-derive under the TS toolchain. Never silently imported — fill proposes, the owner adjudicates.

## v1 statement

The register lane runs Vale, auto-pulled once per OS into the data home and run as a subprocess. It is never linked, never hand-rolled. When the pull fails or the binary is missing, the engine prints a loud warning that the prose linter is absent and prose quality is likely to suffer. The advisory lane stays empty.
