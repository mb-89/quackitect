---
id: se.guidance-engine-ts
kind: guidance
statement: "Working rules for engine-ts realization work: whole-file coherence, imports-first, chunk-scoped tests, re-run neighbours."
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
applies_to:
  - engine-ts
---

## Rules

- Never leave the live engine between a call-site patch and its import patch. The child crashes at link time. Whole-file writes or imports-first.
- Each chunk lands with its own test file; the file must load standalone (no imports of unbuilt modules).
- After touching a shared mechanism, re-run the neighbouring suites that exercise it, not only the chunk's own file.
- Clause numbers: search for the next free SE-C number before minting one.
- New TOOL NAMES need an owner reconnect; prefer extending an existing lane's inputs.
