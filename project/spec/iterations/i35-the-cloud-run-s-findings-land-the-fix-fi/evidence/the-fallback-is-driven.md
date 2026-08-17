---
form: the-fallback-is-driven
by: agent
signed_off: 2026-08-17T12:09:34.893Z
authors: agent
files:
---

# Evidence form / the-fallback-is-driven

## current_situation

The seed named this the BLOCKER: i15's walk stopped at verification with SE-C-123, and it offered two causes, both in the compiler.

Neither was checked by driving the machine.

## built

No engine change, and that is the finding rather than a gap.

BOTH CANDIDATE CAUSES ARE REFUTED, on all four columns. fix-findings has exactly one inbound edge, verification:fallback — the compiler adds none. And edge_role: fallback IS honoured, laying the recovery edge back as fix-findings' only outbound.

DRIVEN RATHER THAN INSPECTED: two full red rounds on the shipped matrix — verification fails into fix-findings, recovers, twice — then a green verification walks forward to gate-implementation. Nothing wedges, at any column.

WHAT IS REAL IN THE SAME MACHINERY: the fallback carries guard: verification_attempts < 3 and the row promises an escape to a human when it exhausts. counters is initialised to {}, carried across a repin, read by evalGuard, and WRITTEN NOWHERE. The string verification_attempts does not occur in the engine at all.

Both findings are pinned in project/deliverable/tests/fallback-outcome.test.ts.

## follow_up

- The counter and an escape edge have to land TOGETHER. completeState has no escape path, so incrementing the counter alone makes the fourth red battery fire no edge and throw exactly the SE-C-123 the seed described. The test pins this so the half-fix fails loudly.
- i15's instance state lives in gitignored .se/ and never travelled, so the original fault cannot be reconstructed from this clone.

## anything_else

THE SEED WOULD HAVE SENT THE NEXT AGENT TO THE WRONG FILE. It named rigor-matrix.ts twice, with confidence, and the machinery there is correct.

WHAT MADE THE DIFFERENCE was driving the machine rather than reading it. The artifact that would have settled it in minutes — i15's instance state — is the one artifact the repository excludes.
