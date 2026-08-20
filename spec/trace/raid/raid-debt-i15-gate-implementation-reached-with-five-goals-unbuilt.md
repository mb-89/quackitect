---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-debt-i15-gate-implementation-reached-with-five-goals-unbuilt
type: "[[raid]]"
kind: debt
statement: gate-implementation was reached and filled honestly while five of the kickoff's seven goals (lane-tool registration for both verbs, the v1 harvest, the subset extension, conformance fixtures, and the delta-default resolver fix) were never seeded as build-chunk work, and lint/complexity were not run against the two files that were built.
owner: the driving agent
trigger: specify-build is reopened to seed the five missing chunks, or the owner rules the scope out of this iteration
status: closed
impact: The iteration cannot honestly bless past gate-implementation in this state. The two chunks that were seeded and built (the query-answering function, the BM25 ranking and disposition function) are real and tested, but the goal record.md names — a served, callable lane verb — is not met by a function nobody can call.
breaks_how_badly: crippling
how_likely: expected
---

## Repayment

Reopen specify-build and seed five chunks: (1) register both verbs on the lane's tool surface, wired to the existing engine/query.ts and engine/disposition.ts functions; (2) harvest the 25 .base files and the ADR from ref main into spec/queries/; (3) extend the pinned subset test-first where a harvested query needs it; (4) add conformance fixtures; (5) rewrite the $-item resolvers per raid-debt-delta-default-views. Run se_test against engine/query.ts and engine/disposition.ts for lint and complexity once real build tooling is legal at that state. Then re-walk build-steps, trace-design, verification and gate-implementation again with the gap closed.

## Closed 2026-08-19

All five chunks landed: se_query and se_couplings are both registered lane tools (engine/tools-query.ts), tested green. The 25 .base files and the ADR are harvested at spec/queries/ and spec/decisions/adr-query-in-engine.md. The pinned subset was extended test-first (file.inFolder, and readVault's file.hasTag wiring to real notes). Conformance fixtures pin five filter/sort shapes mirroring the harvested files. raid-debt-delta-default-views's $-item resolvers now default to the bound record (partial repayment, tracked separately — that debt stays open on its own terms). Both interface entries are minted. Lint (biome check) and the whole battery ran clean: 1492/1492 green.
