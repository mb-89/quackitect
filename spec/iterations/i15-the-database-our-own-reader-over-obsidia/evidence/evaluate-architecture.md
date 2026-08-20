---
form: evaluate-architecture
by: agent
signed_off: 2026-08-19T17:39:23.414Z
reopened: "2026-08-19T17:39:23.000Z — same claims-registration gap, cascading fix through M5"
authors: agent
files: null
---

# Evidence form / evaluate-architecture

## current_situation

decompose-structure closed with zero interface debt, zero idle elements, zero unimplemented functions. Walking all 25 quality scenarios worst-grade-first, folding in what i15's own work already found.

## walk

- [[req-a-wrong-act-never-passes-silently]]: addressed — prevented/refused/named by construction at el-resolution-seam and el-walk-engine, unchanged by i15
- [[req-every-artifact-is-readable-text]]: addressed — el-account, unchanged by i15
- [[req-every-call-logged]]: addressed — el-account, unchanged by i15
- [[req-mirror-stays-on-the-machine]]: addressed — el-mirror, unchanged by i15
- [[req-trees-never-mix]]: addressed — [[raid-dec-thin-tree]] — el-resolution-seam, unchanged by i15
- [[req-walk-resumes-from-repo]]: addressed — [[raid-dec-git-is-the-list-of-iterations]] — el-record-store/el-satellite-supervisor, unchanged by i15
- [[req-a-resolution-is-proven-by-read-back]]: addressed — el-resolution-seam, unchanged by i15
- [[req-acts-carry-role-and-channel]]: addressed — el-account, unchanged by i15
- [[req-crash-lands-safe]]: addressed — el-satellite-supervisor/el-satellite/el-walk-engine, unchanged by i15
- [[req-fresh-machine-runs]]: addressed — [[raid-dec-idempotent-scaffold]] — el-bootstrap/el-entrypoint, unchanged by i15
- [[req-no-agent-act-destroys-work]]: addressed — el-account/el-record-store, unchanged by i15
- [[req-overlay-survives-update]]: addressed — el-engine-delta/el-method-compiler, unchanged by i15
- [[req-reachable-capability-is-traced]]: addressed — el-engine-delta/el-method-compiler, unchanged by i15
- [[req-resume-needs-no-person]]: addressed — el-record-store/el-satellite-supervisor, unchanged by i15
- [[req-the-answer-never-exceeds-its-bound]]: addressed — el-satellite/el-walk-engine, unchanged by i15
- [[req-walk-survives-host-swap]]: addressed — el-record-store/el-satellite-supervisor, unchanged by i15
- [[req-a-clear-jump-is-one-call]]: addressed — el-satellite/el-walk-engine, unchanged by i15
- [[req-call-answers-in-one-second]]: at risk — hinge: the winner's own query mechanism (el-query-evaluator) scored 2/5 at evaluate-set, "works for the demo path only," its sole timing evidence a 4-node probe self-flagged as unmeasured against the real ~328-file corpus; tradeoff: cheapest build now against an unverified real-scale bound
- [[req-entry-speaks-plainly]]: addressed — el-mirror, unchanged by i15
- [[req-query-is-deterministic]]: addressed — [[raid-dec-i15-query-answers-via-declarative-view-spec]] — el-query-evaluator's no-cache, fresh-per-call read is deterministic by construction between writes
- [[req-surface-answers-in-one-second]]: addressed — el-mirror, unchanged by i15
- [[req-audit-answers-from-log]]: addressed — el-account, unchanged by i15
- [[req-newcomer-leaves-able-to-ask]]: addressed — el-mirror, unchanged by i15
- [[req-newcomer-one-command]]: addressed — el-bootstrap/el-entrypoint, unchanged by i15
- [[req-newcomer-orients-unaided]]: addressed — el-mirror, unchanged by i15

- [[req-a-preflight-check-asks-the-reader-where-it-looked]]: addressed — verified this session via se_file_search: project/deliverable/engine/bin/preflight.ts exists as its own binary; el-bootstrap/el-entrypoint, unchanged by i15
- [[req-a-slowness-signal-never-shortens-the-wait]]: addressed — verified this session via se_file_search: project/deliverable/tests/slow-work-signals.test.ts covers the panel's running-past-bound signal; el-satellite/el-walk-engine, unchanged by i15
- [[req-a-windowed-pool-answer-says-that-it-was-windowed]]: addressed — verified this session via se_file_search: project/deliverable/tests/pool-offer.test.ts asserts backlog_window is set on a windowed answer and absent on a complete one; el-account, unchanged by i15
- [[req-one-operation-reads-its-input-once]]: addressed — verified this session by reading engine/session.ts route(): "ONE PASS OVER DISK FOR THE WHOLE ROUTE", explicitly against this exact requirement's shape; el-walk-engine, unchanged by i15
- [[req-the-actor-is-recorded-where-the-call-is-served]]: addressed — verified this session via se_file_search: project/guidance/method/lane.md states "THE RECORD CARRIES WHO ACTED", and the sibling req-acts-carry-role-and-channel above already traces to el-account; el-account, unchanged by i15
- [[req-the-panel-s-paint-says-which-kind-of-green-it-is]]: addressed — verified this session via se_file_search: engine/render.ts carries a law_proven flag and paints "state done proven" apart from plain "state done"; el-mirror, unchanged by i15
- [[req-work-past-its-bound-says-it-is-working]]: addressed — verified this session via se_file_search: project/deliverable/tests/slow-work-signals.test.ts, "a running operation past its bound is named on the panel"; el-satellite/el-walk-engine, unchanged by i15

## fitness_candidates

- req-every-call-logged
- req-walk-resumes-from-repo
- req-a-resolution-is-proven-by-read-back
- req-crash-lands-safe
- req-the-answer-never-exceeds-its-bound
- req-call-answers-in-one-second
- req-newcomer-one-command
- req-query-is-deterministic

## follow_up

One at-risk finding this session's own work surfaced: req-call-answers-in-one-second against el-query-evaluator's unmeasured real-scale timing. The register risk mints on this submit. req-query-is-deterministic is newly flagged fitness_candidate: true — its response measure (same query twice, compare rows) is directly automatable. Structure numbers are clean: zero interface debt, zero idle elements, zero unimplemented functions.

## anything_else

