---
form: evaluate-architecture
by: agent
signed_off: 2026-08-19T20:10:47.288Z
reopened: "2026-08-19T20:10:46.712Z — decompose-structure re-signed above it, and three of its at-risk rulings hinged on a guard that no longer runs a test"
authors: agent
files:
---

# Evidence form / evaluate-architecture

## current_situation

evaluate-architecture, reopened 2026-08-19 because decompose-structure re-signed above it and three of its rulings hinged on a mechanism that changed.

Thirty-seven scenarios, dealt again. THREE MOVE FROM AT RISK TO ADDRESSED, and all three for the same reason.

## walk

- [[req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point]] — addressed by [[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]
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
- [[req-call-answers-in-one-second]] — addressed by [[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]
- [[req-entry-speaks-plainly]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-one-operation-reads-its-input-once]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-query-is-deterministic]] — addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]
- [[req-surface-answers-in-one-second]] — addressed by [[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]
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

- gate-architecture follows and needs the same re-sign, then M6's chain.
- THREE RISKS ARE DISCHARGED BY THE STRUCTURAL CEILING and their register entries should be closed at the next review: raid-ar-a-bound-run-resolves-no-commit-newer-than-its-rewind-point, raid-ar-call-answers-in-one-second and raid-ar-surface-answers-in-one-second.
- ONE RISK STANDS AND IS NOW IN SCOPE. raid-ar-the-benchmark-history-is-unreadable-while-a-run-is-bound hinges on the visibility drift, which the owner has ruled this iteration builds.
- THE NEW UNKNOWN CREATED BY M6 — resolutions per lane call — dissolves with the checked ceiling. There is no per-resolution cost left to bound.

## anything_else

THREE AT-RISK RULINGS BECAME ADDRESSED WITHOUT ANYONE ARGUING THEM AWAY.

All three hinged on el-benchmark-guard running a test under every resolution. The structural ceiling removes the test: the object a run must not reach is not in the tree.

- THE CEILING RISK is gone because there is no check to fail open. An absent object cannot be fetched.
- BOTH ONE-SECOND RISKS are gone because there is no per-call cost. 4229 microseconds became zero.

THAT IS WHAT A PROTOTYPE MILESTONE IS FOR, and it is worth naming plainly: three crippling-or-worse risks were discharged by evidence rather than by a re-reading of the same evidence.

ONE RISK SURVIVES AND CHANGED STATUS RATHER THAN GRADE. The concealment still hinges on four disagreeing exclusion lists. It was a dependency on somebody else's work an hour ago; the owner has ruled it into this iteration's scope, so it becomes build work with a measured cost of four call sites across three files.
