---
form: scope-non-goals
by: agent
signed_off: 2026-08-16T16:25:22.079Z
authors: agent
files:
---

# Evidence form / scope-non-goals

## current_situation

frame-delta is signed. The gap stands as a claim — no existing mechanism turns a corpus search into a checkable, structured, refusing answer — and the why-now rests on a design already proven once (adr-query-in-engine) plus two measured failures dated 2026-08-13.

THIS STATE SCOPES THE DELTA rather than restating gate-kickoff's pulled_in list unread. No standalone product-scope document exists for this product, the same way no standalone vision.md exists; each major iteration's own scope-non-goals evidence is the resident record, and this one tests gate-kickoff's proposal against what frame-delta actually sharpened rather than rewriting it.

## scope

THIS EFFORT TAKES ON SEVEN PIECES, all named at gate-kickoff and unchanged by frame-delta's sharpening.

- LOCATE AND HARVEST v1's 26 .base query files and adr-query-in-engine.md, once raid-asm-v1-ref-for-spec-queries-is-reachable resolves at a state where se_run or se_git is legal.
- EXPOSE THE EXISTING READER (tables.ts, bases.ts, baseui.ts, basesclient.ts) as a read-only MCP lane verb, with the unknown-field refusal gap_claim identified as genuinely missing — the existing widget refuses an unmatched FILTER shape, not yet a requested-but-absent COLUMN.
- EXTEND THE PINNED SUBSET test-first, only where a harvested v1 query needs it, reopening adr-query-in-engine rather than smuggling in an extension.
- ADD CONFORMANCE FIXTURES pinning the subset against drift, beside the existing tests/fixtures/*.base.
- FIX raid-debt-delta-default-views: the $-item resolvers default to the bound record's own minted_in delta, an opt-in widens to the corpus, the coverage laws stay corpus-wide.
- BUILD THE BM25 RETRIEVAL SIBLING as its own lane verb, over the same corpus, skipping what the graph already encodes structurally, forcing a disposition on every candidate it proposes.
- MINT THE INTERFACE ENTRIES both new lane verbs owe.

## non_goals

EVERY LINE NAMES WHERE THE WORK GOES, or says why nothing receives it.

- THE DASHBOARD / LIVE VIEW over the query layer — no record yet; record.md leaves it explicitly as "the owner's UI sitting, not this iteration," and no iteration is chartered for it.
- EMBEDDINGS for the BM25 sibling — no record yet; record.md defers them until BM25 ships and its misses are measured, and that measurement has no iteration of its own.
- PORTING v1's BOOK TABLE-INTERACTIVITY SCRIPT — i20 (emit.book), named at gate-kickoff.
- ANY UI CHANGE TO THE EXISTING MIRROR BASES WIDGET beyond what the MCP verb and the subset extension require — no record; it already works, and gate-kickoff scoped it out by name.
- RESOLVING raid-asm-v1-ref-for-spec-queries-is-reachable AND raid-risk-i15-ships-without-a-live-prior-art-scan AT THIS STATE — this record's own harvesting sub-step and next gate own them, per log-risks' follow_up; not scope-non-goals' job to close.

## follow_up

pressure-test remains; log-risks already stands signed, so the gate joins as soon as pressure-test signs.

WHAT THE GATE INHERITS: a scope of seven items unchanged from gate-kickoff's proposal, and a non-goal list of five where every line names a receiving record or says plainly why none exists.

WHAT PRESSURE-TEST SHOULD WEIGH HARDEST: the two claims frame-delta's why_now flagged as not yet matured — the v1 ref's reachability and the missing live prior-art scan — are the same two this scope defers to later states. Pressure-test is where a working-backwards read should ask whether deferring both together is safe.

## anything_else


