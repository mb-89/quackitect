---
form: evaluate-architecture
by: agent
signed_off: 2026-08-19T19:19:26.933Z
reopened: "2026-08-19T19:19:05.729Z — the walk verdicts were written in prose rather than in the deck grammar, so all 37 scenarios read as unruled"
authors: agent
files:
---

# Evidence form / evaluate-architecture

## current_situation

i37 stands at evaluate-architecture, the last work state of M5. decompose-structure is signed with three elements and four interfaces.

Thirty-seven quality scenarios are dealt, worst grade first. Four are ruled at risk and the rest addressed.

Every at-risk ruling names a hinge that is a fact rather than an opinion.

## walk

- [[raid-ar-a-bound-run-resolves-no-commit-newer-than-its-rewind-point]] — at risk: [[req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point]] hinges on [[el-benchmark-guard]] — the ceiling rests on git merge-base and se_git does not offer it, so the exact primitive is unreachable through the lane; the fallback is deriving ancestry from log or rev-parse, which is more code for a weaker answer
- [[req-a-ceiling-that-cannot-prove-ancestry-refuses]] — addressed by [[raid-dec-a-run-that-cannot-establish-its-guard-never-binds]]
- [[req-a-wrong-act-never-passes-silently]] — addressed by [[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]
- [[req-every-artifact-is-readable-text]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-every-call-logged]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-mirror-stays-on-the-machine]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-trees-never-mix]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-walk-resumes-from-repo]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-a-benchmark-report-carries-the-conditions-of-its-run]] — addressed by [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]
- [[req-a-resolution-is-proven-by-read-back]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-a-run-that-stopped-early-says-where-it-stopped]] — addressed by [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]
- [[req-acts-carry-role-and-channel]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-crash-lands-safe]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-fresh-machine-runs]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-no-agent-act-destroys-work]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-overlay-survives-update]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-reachable-capability-is-traced]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-resume-needs-no-person]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-the-answer-never-exceeds-its-bound]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-walk-survives-host-swap]] — addressed by [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]
- [[req-a-clear-jump-is-one-call]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-a-preflight-check-asks-the-reader-where-it-looked]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-a-windowed-pool-answer-says-that-it-was-windowed]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[raid-ar-call-answers-in-one-second]] — at risk: [[req-call-answers-in-one-second]] hinges on [[el-benchmark-guard]] — the guard sits under every resolved commit, ref and path for the length of a run, so a correctness check lands on the hot path of the walk it is measuring
- [[req-entry-speaks-plainly]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-one-operation-reads-its-input-once]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-query-is-deterministic]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[raid-ar-surface-answers-in-one-second]] — at risk: [[req-surface-answers-in-one-second]] hinges on [[el-benchmark-guard]] — the same guard reaches the mirror's own reads while a run is bound, and the cost is paid on a surface a person is watching
- [[req-the-actor-is-recorded-where-the-call-is-served]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[raid-ar-the-benchmark-history-is-unreadable-while-a-run-is-bound]] — at risk: [[req-the-benchmark-history-is-unreadable-while-a-run-is-bound]] hinges on [[el-benchmark-guard]] — three exclusion lists decide what a lane verb may see, they disagree, and se_file_read consults none of them; one rule has to bind four verbs before this concealment can be trusted
- [[req-the-panel-s-paint-says-which-kind-of-green-it-is]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-work-past-its-bound-says-it-is-working]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-a-slowness-signal-never-shortens-the-wait]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-audit-answers-from-log]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-newcomer-leaves-able-to-ask]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-newcomer-one-command]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-newcomer-orients-unaided]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]

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
