---
id: se.note-engine-determinizers
kind: note
statement: "Engine-hygiene determinizers found during the i5+i8 delegated runs, to land in the next mechanical engine iteration (owner rule: engine work like this always goes in the next possible iteration)."
provenance:
  iteration: i8b-phone-connect
  ai_involvement: agent-drafted
breaks_if_removed: Two repeatedly-hit friction points stay unfixed and keep costing rejections and manual workarounds.
---

## Determinizers (for the next mechanical engine iteration)

- D1 create-op drops unknown fields silently: se_set_apply `create` with an `edges` field (or any unknown field) discards it - every ADR mint this session needed a follow-up `add_edge`. Fix: `create` accepts `edges` on the op, OR refuses an unknown field loudly (never silent-drop).
- D2 patch needs real newlines: se_file_patch old_string matched against a template literal must carry REAL newlines, not the two-character `\n` - two SE-C-064 rejections were burned learning this. Fix: a hint in the SE-C-064 remedy when old_string contains a literal backslash-n and no real newline, or a guidance line.

Both are pure mechanical fixes - a strong candidate for a delegated/mechanical refine iteration per [[se.decision-refine-mode]] and the mechanical-vs-judgment split.
