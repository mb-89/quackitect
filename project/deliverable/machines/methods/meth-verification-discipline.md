---
kind: method
statement: Verify with fresh eyes against the specs. The verifier is never the builder.
---

## Situation

Guidance for M7 verification, and for every fix-findings round behind
it. Test DESIGN is [[meth-test-design]]; this card is how the
verification is EXECUTED.

## The discipline

- READ THE SPECS FIRST. The spec's pass line is the oracle.
  - A verdict from taste is not a verdict.
- RUN, DO NOT REASON. Where a check is mechanical, execute it.
  - A plausible argument that it would pass is worth nothing.
- COLLECT EVERYTHING BEFORE FIXING ANYTHING. Verification produces
  FINDINGS, whole. Fixing mid-verification blinds the rest of the run.
- CLAIMS ARE OBSERVATIONS. A demonstration was watched, an inspection
  was performed, an analysis was recomputed — each green claim names
  who observed what. Never "should hold".
- THE BUILDER DOES NOT VERIFY THEIR OWN BUILD. Familiarity is exactly
  what hides the fault.

## Fresh eyes (owner ruling 2026-08-11)

- A PERSON verifying adheres to this card directly.
- An AGENT verifying SPAWNS A TESTER SUBAGENT: fresh context, another
  set of eyes. The tester reads this card and the specs, then verifies.
  It does not inherit the builder's context, and that is the point —
  what the builder knows is what the tester must not assume.

## The gatekeeper persists

The tester is a GATEKEEPER for verification and its fix-findings loop,
not a per-round hire:

- one tester stands across the rounds — it is not respawned after each
  fix pass and does not reread from zero
- after fix-findings, show it the DELTAS: what was found, what changed,
  which runs confirm
- it re-verifies against the same specs and its own standing findings

## Sources

- SyA Testing: independence of the tester rises with criticality; the
  test levels split builder from verifier —
  @ai/sya_kb/digest/sya/10_Testing.md.
- The collect-then-fix law is the fix-findings row's own
  ([[meth-test-first]]).
