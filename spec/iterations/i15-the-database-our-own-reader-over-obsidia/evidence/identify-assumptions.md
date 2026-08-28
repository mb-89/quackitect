---
form: identify-assumptions
reopened: 2026-08-19T17:29:24.689Z — same claims-registration gap, cascading fix through M3
by: agent
signed_off: 2026-08-19T17:29:25.153Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

derive-functions is signed. Three new functions and five new flows carry the seven new requirements without any new hole. This state sweeps those seven requirements for what they lean on, per source, and records each real assumption as its own RAID entry.

## assumptions

- project/spec/trace/raid/raid-asm-i15-unindexed-scan-stays-inside-budget.md
- project/spec/trace/raid/raid-asm-i15-query-plus-rows-earns-trust.md
- project/spec/trace/raid/raid-asm-i15-one-threshold-separates-candidates.md

## sweep

- environment: two entries. raid-asm-i15-unindexed-scan-stays-inside-budget (the corpus stays small enough for an unindexed scan to answer inside the one-second budget) and raid-asm-i15-one-threshold-separates-candidates (a single fixed relevance threshold separates real candidates from noise across every kind of change description — filed here rather than under neighbours because it is a claim about the shape of the data, not about another system's guarantee).
- toolchain: none. No new install, version pin or dependency is asked for; both new verbs are lane capabilities inside the existing engine, per draw-context's own boundary.
- host: none. Neither verb relies on anything the harness or runtime does beyond what every other se_ tool already relies on.
- platform: none. Nothing here is filesystem- or OS-specific; the verbs read the same markdown corpus every other lane tool reads.
- neighbours: none new. The standing raid-asm-i15-corpus-suits-lexical-matching already covers the neighbour-shaped claim (BM25's fit for this corpus); nothing else here takes a guarantee from another system's datasheet rather than a run.
- people: one entry. raid-asm-i15-query-plus-rows-earns-trust (an engineer shown the query and its rows trusts the answer without independently re-deriving it against the corpus) — the assumption sty-trust-a-repeatable-answer and req-query-is-deterministic both rest their case on.

## follow_up

probe-assumptions is next, and it probes every standing assumption, not only these three. All three are freshly minted and carry probe: unprobed — none is claimed to hold yet.

Worth flagging for that state: raid-asm-i15-one-threshold-separates-candidates shares its probe mechanism with the already-standing raid-asm-i15-corpus-suits-lexical-matching (same sample of known couplings and non-couplings), so the two are natural to probe together once the BM25 sibling exists.

## anything_else

nothing
