# M3 — Design (i0011_geronticide, lean L3)

## Approach chosen, reasons recorded  → i11-m3-approach-chosen

One line per item — approach, and why not the obvious alternative:

1. **Parity standalone** — a generic `suite: never-cached` test-node marker, skipped by tests-pass and with its own board entry ([adr-standalone-suite](../../decisions/adr-standalone-suite.md)). Not a name filter (not generic), not node retirement (history churn).
2. **Pager scope** — a non-gate pager target reports its OWN readiness (upstreams + evidence). Defect fix. No architecture choice, no ADR.
3. **Suspect root** — StatusMap already knows raw-vs-effective state. Propagated = effective SUSPECT with raw DONE. The root = nearest upstream whose RAW state is not DONE. Exposure of existing computation, like why-delta. No ADR.
4. **Evidence hashing** — the milestone GATE folds its evidence doc's content hash ([adr-evidence-hash](../../decisions/adr-evidence-hash.md)). Not per-subtask (noise, no added protection).
5. **Cache cap** — keep the newest N verdict files per check, evict oldest at write. Small; no ADR.
6. **Stamp migration** — one-shot audited `migrate-actors` + read-compat forever + metric spanning eras ([adr-actor-user-migration](../../decisions/adr-actor-user-migration.md)). The riskiest unknown (migration correctness) gets the L3 spike as a fixture selftest BEFORE the real ledger is touched.
7. **tests-red marker** — explicit `tests_red: exempt - …` frontmatter citing the grandfathers ADR; the date constant dies ([adr-grandfathers-historical](../../decisions/adr-grandfathers-historical.md)).
8. **Legacy lanes** — resolver: `tools/vendor` → dogfood. Stub launcher: global binary → `QUACK_ENGINE`. i5 requirements restated in place ([adr-retire-legacy-lanes](../../decisions/adr-retire-legacy-lanes.md)).
9. **EARS/pre-i4 grandfathers** — historical-exempt with ADR citation. Retrofit rejected (wording avalanche over history, zero behavior value) — same ADR as 7.

## ADRs traced  → i11-m3-adr-traced

Five ADRs minted, each addressing a named requirement. `coverage:adr-traced` computes live.

## Milestone review  → i11-m3-gate

**Verify:** every scope item carries an approach with a recorded reason. The three consequential decisions carry ADRs. The spike-worthy unknown is named and assigned (migration fixture). **Validate:** decisions honor the standing rulings — churn acceptable but truth never silently rewritten. Exemptions become citations, not fabrications. **Red-team:** the read-compat-forever choice means `human` tokens remain readable indefinitely — argued as an un-killed grandfather. Answered: read-compat is a compatibility CONTRACT recorded in the ADR, not an undecided leftover — exactly the difference this iteration exists to enforce. **Verdict: PASS.**
