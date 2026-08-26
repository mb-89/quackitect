---
form: reverse-sensitivity
reopened: 2026-08-19T17:38:43.020Z — same claims-registration gap, cascading fix through M5
by: agent
signed_off: 2026-08-19T17:38:43.419Z
authors: agent
files: null
---

# Evidence form / reverse-sensitivity

## current_situation

converge-pugh closed. cand-explicit-and-safe wins, three rivals sit one point behind, one sits five behind.

## sensitivity

- cand-continue-v1s-shape | req-trace-source-never-mixes: stands — both candidates share the identical query engine, so this score moves them together, never opening a gap
- cand-continue-v1s-shape | req-trace-view-derived-from-files: stands — same shared query engine, locked together
- cand-continue-v1s-shape | req-unshipped-dependency-refused: stands — same shared query engine, locked together
- cand-continue-v1s-shape | req-call-answers-in-one-second: stands — same shared query engine, locked together
- cand-continue-v1s-shape | req-broken-trace-is-a-defect: stands — the winner's pending-row mechanism is structurally better positioned to close this gap than the rival's threshold, if either closes it first
- cand-continue-v1s-shape | req-query-is-deterministic: stands — same shared query engine, locked together
- cand-fast-path-plus-blocking | req-a-wrong-act-never-passes-silently: rival wins — credible — the rival's own costs section names a concrete, buildable remedy (an escape hatch to re-surface a wrongly-blocked candidate) that would close this by construction
- cand-fast-path-plus-blocking | req-unshipped-dependency-refused: stands — both avoid a new external dependency for structurally similar reasons (the rival reuses the engine's own existing cache; the winner reuses an existing internal review shape)
- cand-fast-path-plus-blocking | req-broken-trace-is-a-defect: rival wins — credible — no structural reason favours either mechanism closing this unaddressed gap first; a real, plausible world where M5 elaboration adds it unevenly
- cand-fast-path-plus-blocking | req-query-is-deterministic: rival wins — credible — the rival's own leans-on section names the exact unclosed gap (the write-outside-the-lane guarantee, unverified system-wide); closing it is a concrete, describable action
- cand-narrow-grammar-plus-explicit | req-trace-source-never-mixes: stands — both are fresh-per-call reads with no source-scoping described, locked together by that shared absence
- cand-narrow-grammar-plus-explicit | req-trace-view-derived-from-files: stands — both are direct-file-read query engines with no separate storage, locked together
- cand-narrow-grammar-plus-explicit | req-unshipped-dependency-refused: stands — both introduce no new external dependency, locked together
- cand-narrow-grammar-plus-explicit | req-broken-trace-is-a-defect: stands — the winner's pending-row mechanism is at least as well positioned to close this gap as the rival's more general explicit-review shape
- cand-relational-plus-ensemble | req-a-wrong-act-never-passes-silently: stands — five-point deficit, outside the three-swing reach named in the method
- cand-relational-plus-ensemble | req-trace-source-never-mixes: stands — same, outside reach
- cand-relational-plus-ensemble | req-unshipped-dependency-refused: stands — same, outside reach
- cand-relational-plus-ensemble | req-call-answers-in-one-second: stands — same, outside reach
- cand-relational-plus-ensemble | req-broken-trace-is-a-defect: stands — same, outside reach

## follow_up

Three credible flips found, all against cand-fast-path-plus-blocking, the winner's genuine rival on the front. RAID tripwires: two new (the escape-hatch remedy for req-a-wrong-act-never-passes-silently; the write-outside-the-lane guarantee for req-query-is-deterministic), one already carried by raid-risk-i15-broken-trace-defect-unaddressed-by-any-candidate. Next: record-adrs writes the deciding ADR.

## anything_else

