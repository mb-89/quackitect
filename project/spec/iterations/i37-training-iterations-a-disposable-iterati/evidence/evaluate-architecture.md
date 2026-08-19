---
form: evaluate-architecture
by: agent
signed_off: 2026-08-19T19:04:38.143Z
authors: agent
files:
---

# Evidence form / evaluate-architecture

## current_situation

i37 stands at evaluate-architecture, the last work state of M5. decompose-structure is signed with three elements and four interfaces.

Thirty-seven quality scenarios are dealt, worst grade first. Four are ruled at risk and the rest addressed.

Every at-risk ruling names a hinge that is a fact rather than an opinion.

## walk

- req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point: at risk — the hinge is one allowlist entry — the ceiling rests on git merge-base and se_git does not offer it, so the exact primitive is unreachable through the lane; the tradeoff is deriving ancestry from log or rev-parse, which is more code for a weaker answer
- req-a-ceiling-that-cannot-prove-ancestry-refuses: addressed — [[raid-dec-a-run-that-cannot-establish-its-guard-never-binds]]
- req-a-wrong-act-never-passes-silently: addressed — [[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]
- req-every-artifact-is-readable-text: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-every-call-logged: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-mirror-stays-on-the-machine: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-trees-never-mix: addressed — [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- req-walk-resumes-from-repo: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-a-benchmark-report-carries-the-conditions-of-its-run: addressed — [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]
- req-a-resolution-is-proven-by-read-back: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-a-run-that-stopped-early-says-where-it-stopped: addressed — [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]
- req-acts-carry-role-and-channel: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-crash-lands-safe: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-fresh-machine-runs: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-no-agent-act-destroys-work: addressed — [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- req-overlay-survives-update: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-reachable-capability-is-traced: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-resume-needs-no-person: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-the-answer-never-exceeds-its-bound: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-walk-survives-host-swap: addressed — [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]
- req-a-clear-jump-is-one-call: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-a-preflight-check-asks-the-reader-where-it-looked: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-a-windowed-pool-answer-says-that-it-was-windowed: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-call-answers-in-one-second: at risk — the hinge is that the guard sits under every resolved commit, ref and path for the length of a run; the tradeoff is a correctness check on the hot path of the walk it is measuring
- req-entry-speaks-plainly: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-one-operation-reads-its-input-once: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-query-is-deterministic: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-surface-answers-in-one-second: at risk — the hinge is the same guard reaching the mirror's own reads while a run is bound; the tradeoff is the same one, paid on a surface a person is watching
- req-the-actor-is-recorded-where-the-call-is-served: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-the-benchmark-history-is-unreadable-while-a-run-is-bound: at risk — the hinge is the visibility drift — three exclusion lists decide what a lane verb may see, they disagree, and se_file_read consults none of them; the tradeoff is fixing one rule for four verbs before this concealment can be trusted
- req-the-panel-s-paint-says-which-kind-of-green-it-is: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-work-past-its-bound-says-it-is-working: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-a-slowness-signal-never-shortens-the-wait: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-audit-answers-from-log: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-newcomer-leaves-able-to-ask: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-newcomer-one-command: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks
- req-newcomer-orients-unaided: addressed — the path stands unchanged; this iteration adds three elements inside one binding and touches nothing this scenario walks

## fitness_candidates

- [[req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point]]
- [[req-a-ceiling-that-cannot-prove-ancestry-refuses]]
- [[req-a-benchmark-report-carries-the-conditions-of-its-run]]
- [[req-a-run-that-stopped-early-says-where-it-stopped]]
- [[req-the-benchmark-history-is-unreadable-while-a-run-is-bound]]

## follow_up

- gate-architecture closes M5 next.
- FOUR RISKS ARE MINTED HERE and two of them are the same one wearing different clothes: the guard sits on the hot path, so both one-second scenarios hinge on it. M6 should price that before M7 builds it.
- FIVE FITNESS CANDIDATES ARE FLAGGED, all of them this iteration's own. Each is measurable at M7 without a person reading anything: a forbidden request that must refuse, a report that must carry its conditions, a stop point that must be recorded, a history that must be unreadable while bound, and a commit past the rewind point that must not resolve.
- THE CEILING'S RISK IS DISCHARGED BY ONE ALLOWLIST ENTRY. It is build work with a named shape rather than a design question.

## anything_else

TWO OF THE FOUR RISKS ARE THE SAME RISK, and saying so is more useful than listing them twice.

`req-call-answers-in-one-second` and `req-surface-answers-in-one-second` both hinge on the guard sitting under every resolved commit, ref and path for the length of a run.

THE MEASUREMENT PROBLEM THAT CREATES. A benchmark that slowed the walk it was measuring would measure itself. Every number taken under a slow guard is inflated by the instrument, and nothing in the report would say so.

THE BOUND IS ALREADY DECLARED at one millisecond on `if-benchmark-binding-to-guard`, which is the tightest bound in this iteration and was set for exactly this reason. What has not happened is anyone checking that an ancestry test can be answered inside it.

SO THE RISK IS REAL AND ITS DISCHARGE IS CHEAP: time the ancestry primitive at M6, beside the spike that is already ranked there.

THE FOURTH RISK IS THE ONE THIS ITERATION CANNOT CLOSE ALONE. The concealment rides three exclusion lists that disagree, and the reading verb consults none of them. That is a standing work token, and it is why the token is this iteration's dependency rather than its neighbour.
