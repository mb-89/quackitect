---
form: write-requirements
reopened: "2026-08-19T17:23:40.939Z — same claims-registration gap, cascading fix through M3"
by: agent
signed_off: 2026-08-19T17:26:30.854Z
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

gate-inputs is signed and blessed pass with overrides. Seven new requirement rows derive from the three use cases this m2 pass minted: four for the query verb (returns named fields, refuses an unknown field, explicit empty result, deterministic on an unchanged corpus), three for the BM25 sibling (ranked candidates, explicit empty below threshold, forced disposition on every candidate).

## register

- project/spec/trace/requirement/req-a-clear-jump-is-one-call.md
- project/spec/trace/requirement/req-a-closed-records-folder-stays-on-trunk.md
- project/spec/trace/requirement/req-a-deletion-names-what-points-at-the-node.md
- project/spec/trace/requirement/req-a-harmless-finding-is-carried-not-stopped-on.md
- project/spec/trace/requirement/req-a-harmless-finding-names-an-open-entry.md
- project/spec/trace/requirement/req-a-method-change-reaches-every-tree.md
- project/spec/trace/requirement/req-a-placeholder-drawing-refuses-entry.md
- project/spec/trace/requirement/req-a-pull-carrying-no-choice-enters-no-iteration.md
- project/spec/trace/requirement/req-a-read-comes-from-where-it-is-meant.md
- project/spec/trace/requirement/req-a-records-dependency-is-declared.md
- project/spec/trace/requirement/req-a-records-own-status-decides-whether-it-is-open.md
- project/spec/trace/requirement/req-a-reopen-stands-where-it-can-work.md
- project/spec/trace/requirement/req-a-resolution-is-proven-by-read-back.md
- project/spec/trace/requirement/req-a-shipped-record-is-never-reclaimed.md
- project/spec/trace/requirement/req-a-size-may-drop-a-question.md
- project/spec/trace/requirement/req-a-surface-resolves-to-what-it-shows.md
- project/spec/trace/requirement/req-a-write-lands-where-it-is-meant.md
- project/spec/trace/requirement/req-a-wrong-act-never-passes-silently.md
- project/spec/trace/requirement/req-acts-carry-role-and-channel.md
- project/spec/trace/requirement/req-an-engine-change-applies-in-its-own-record.md
- project/spec/trace/requirement/req-answer-pages-never-overflows.md
- project/spec/trace/requirement/req-answer-recorded-with-question.md
- project/spec/trace/requirement/req-archive-lists-every-closed-record.md
- project/spec/trace/requirement/req-archive-opens-to-a-person-only.md
- project/spec/trace/requirement/req-archive-read-only.md
- project/spec/trace/requirement/req-archive-shows-it-as-it-closed.md
- project/spec/trace/requirement/req-audit-answers-from-log.md
- project/spec/trace/requirement/req-autonomy-change-applies-forward.md
- project/spec/trace/requirement/req-autonomy-gates-every-hop.md
- project/spec/trace/requirement/req-autonomy-is-categorical.md
- project/spec/trace/requirement/req-begin-says-own-window.md
- project/spec/trace/requirement/req-begin-touches-nothing-existing.md
- project/spec/trace/requirement/req-bless-outputs-ride-the-bless.md
- project/spec/trace/requirement/req-blessed-column-compiles-pinned.md
- project/spec/trace/requirement/req-bm25-below-threshold-returns-empty.md
- project/spec/trace/requirement/req-bm25-candidates-need-disposition.md
- project/spec/trace/requirement/req-bm25-returns-ranked-candidates.md
- project/spec/trace/requirement/req-boot-ends-at-front-desk.md
- project/spec/trace/requirement/req-boot-stands-agentless.md
- project/spec/trace/requirement/req-bound-field-rebuilds-from-nodes.md
- project/spec/trace/requirement/req-broken-trace-is-a-defect.md
- project/spec/trace/requirement/req-call-answers-in-one-second.md
- project/spec/trace/requirement/req-capture-moves-nothing.md
- project/spec/trace/requirement/req-cell-edit-lands-in-the-note.md
- project/spec/trace/requirement/req-choice-records-case-against-losers.md
- project/spec/trace/requirement/req-choosing-none-is-legal.md
- project/spec/trace/requirement/req-clean-sweep-is-dated.md
- project/spec/trace/requirement/req-close-leaves-trunk-clean.md
- project/spec/trace/requirement/req-close-refuses-loose-ends.md
- project/spec/trace/requirement/req-close-serves-its-findings.md
- project/spec/trace/requirement/req-colors-are-configuration.md
- project/spec/trace/requirement/req-compaction-reowes-the-reading.md
- project/spec/trace/requirement/req-comparison-carries-both-sides.md
- project/spec/trace/requirement/req-container-offers-its-records.md
- project/spec/trace/requirement/req-controls-draw-from-their-spec.md
- project/spec/trace/requirement/req-controls-never-advance-walk.md
- project/spec/trace/requirement/req-coverage-checked-both-ways.md
- project/spec/trace/requirement/req-crash-lands-safe.md
- project/spec/trace/requirement/req-decision-graph-reads-as-branches.md
- project/spec/trace/requirement/req-desk-greets-walkable.md
- project/spec/trace/requirement/req-desk-offers-a-tour.md
- project/spec/trace/requirement/req-desk-states-the-folder-rule.md
- project/spec/trace/requirement/req-desk-takes-plain-words.md
- project/spec/trace/requirement/req-divergence-order-on-record.md
- project/spec/trace/requirement/req-drain-one-home-with-payload.md
- project/spec/trace/requirement/req-drained-note-leaves-count.md
- project/spec/trace/requirement/req-drawn-state-equals-a-row.md
- project/spec/trace/requirement/req-drumroll-arms-deliberately.md
- project/spec/trace/requirement/req-duplicate-stray-still-captured.md
- project/spec/trace/requirement/req-emergency-sits-above-full.md
- project/spec/trace/requirement/req-engine-port-fallback.md
- project/spec/trace/requirement/req-entering-repairs-itself-or-names-the-remedy.md
- project/spec/trace/requirement/req-entry-speaks-plainly.md
- project/spec/trace/requirement/req-every-artifact-is-readable-text.md
- project/spec/trace/requirement/req-every-call-logged.md
- project/spec/trace/requirement/req-every-record-path-resolves-in-one-tree.md
- project/spec/trace/requirement/req-every-update-reaches-the-render.md
- project/spec/trace/requirement/req-expressions-evaluate-per-reference.md
- project/spec/trace/requirement/req-extension-replaced-reported.md
- project/spec/trace/requirement/req-fallen-condition-named.md
- project/spec/trace/requirement/req-filter-draws-only-what-serves.md
- project/spec/trace/requirement/req-finding-keeps-its-sources.md
- project/spec/trace/requirement/req-finding-lands-as-reference.md
- project/spec/trace/requirement/req-finding-names-its-home.md
- project/spec/trace/requirement/req-first-green-needs-a-red.md
- project/spec/trace/requirement/req-form-is-built-and-checked.md
- project/spec/trace/requirement/req-fresh-machine-runs.md
- project/spec/trace/requirement/req-fresh-product-starts-empty.md
- project/spec/trace/requirement/req-gate-evidence-must-be-sound.md
- project/spec/trace/requirement/req-gate-needs-a-persons-verdict.md
- project/spec/trace/requirement/req-gate-rounds-stay-readable.md
- project/spec/trace/requirement/req-gate-shows-the-evidence-form.md
- project/spec/trace/requirement/req-grouping-and-sorting-hold.md
- project/spec/trace/requirement/req-guidance-edit-lands-where-it-compiles.md
- project/spec/trace/requirement/req-help-demand-ranked.md
- project/spec/trace/requirement/req-help-miss-is-logged.md
- project/spec/trace/requirement/req-help-query-logged-with-result.md
- project/spec/trace/requirement/req-help-searches-tools-and-guidance.md
- project/spec/trace/requirement/req-idea-lands-as-note.md
- project/spec/trace/requirement/req-ideation-opens-no-record.md
- project/spec/trace/requirement/req-instruction-names-its-source.md
- project/spec/trace/requirement/req-kickoff-refuses-pending-notes.md
- project/spec/trace/requirement/req-land-demands-fresh-green.md
- project/spec/trace/requirement/req-land-target-routes-to-gate.md
- project/spec/trace/requirement/req-landing-needs-no-close.md
- project/spec/trace/requirement/req-lane-fixes-what-machines-fix.md
- project/spec/trace/requirement/req-losers-stay-on-record.md
- project/spec/trace/requirement/req-method-reuse-is-vendoring.md
- project/spec/trace/requirement/req-mirror-stays-on-the-machine.md
- project/spec/trace/requirement/req-missing-document-stops-the-walk.md
- project/spec/trace/requirement/req-missing-provider-named.md
- project/spec/trace/requirement/req-moved-evidence-invalidates-the-bless.md
- project/spec/trace/requirement/req-narration-toll-is-collected.md
- project/spec/trace/requirement/req-newcomer-leaves-able-to-ask.md
- project/spec/trace/requirement/req-newcomer-one-command.md
- project/spec/trace/requirement/req-newcomer-orients-unaided.md
- project/spec/trace/requirement/req-no-agent-act-destroys-work.md
- project/spec/trace/requirement/req-no-claim-without-evidence.md
- project/spec/trace/requirement/req-nodes-scoped-to-iteration.md
- project/spec/trace/requirement/req-one-command-starts-an-unattended-machine.md
- project/spec/trace/requirement/req-one-note-per-settled-point.md
- project/spec/trace/requirement/req-one-script-installs.md
- project/spec/trace/requirement/req-one-verb-says-why-a-state-is-grey.md
- project/spec/trace/requirement/req-open-notes-stay-visible.md
- project/spec/trace/requirement/req-option-carries-cost-and-shed.md
- project/spec/trace/requirement/req-outbound-query-logged.md
- project/spec/trace/requirement/req-overhaul-closes-green.md
- project/spec/trace/requirement/req-overhaul-opens-without-deliverable.md
- project/spec/trace/requirement/req-overhaul-takes-only-unowned-drift.md
- project/spec/trace/requirement/req-overlay-drift-reported.md
- project/spec/trace/requirement/req-overlay-resolution.md
- project/spec/trace/requirement/req-overlay-survives-update.md
- project/spec/trace/requirement/req-owed-reading-is-served.md
- project/spec/trace/requirement/req-panel-shows-the-machine.md
- project/spec/trace/requirement/req-parked-note-re-drains.md
- project/spec/trace/requirement/req-pin-writes-seeded-scaffolds.md
- project/spec/trace/requirement/req-problem-recorded-before-options.md
- project/spec/trace/requirement/req-product-is-a-folder.md
- project/spec/trace/requirement/req-pull-answers-from-record.md
- project/spec/trace/requirement/req-purpose-recorded-at-begin.md
- project/spec/trace/requirement/req-query-empty-result-explicit.md
- project/spec/trace/requirement/req-query-is-deterministic.md
- project/spec/trace/requirement/req-query-is-the-file.md
- project/spec/trace/requirement/req-query-refuses-unknown-field.md
- project/spec/trace/requirement/req-query-returns-named-fields.md
- project/spec/trace/requirement/req-reachable-capability-is-traced.md
- project/spec/trace/requirement/req-reader-keeps-their-place.md
- project/spec/trace/requirement/req-reading-credit-survives-a-reload.md
- project/spec/trace/requirement/req-reading-proof.md
- project/spec/trace/requirement/req-recommendation-is-derived.md
- project/spec/trace/requirement/req-record-arrives-prefilled.md
- project/spec/trace/requirement/req-record-opens-on-word.md
- project/spec/trace/requirement/req-record-status-comes-from-the-record.md
- project/spec/trace/requirement/req-red-is-never-carried.md
- project/spec/trace/requirement/req-red-objective-serves-its-fill.md
- project/spec/trace/requirement/req-refusal-carries-remedy.md
- project/spec/trace/requirement/req-reject-names-the-redo.md
- project/spec/trace/requirement/req-rejection-carries-its-reason.md
- project/spec/trace/requirement/req-reload-restarts-clean.md
- project/spec/trace/requirement/req-repo-search-carries-intent.md
- project/spec/trace/requirement/req-resume-needs-no-person.md
- project/spec/trace/requirement/req-retro-asks-real-use.md
- project/spec/trace/requirement/req-retro-window-drains-whole.md
- project/spec/trace/requirement/req-roles-never-usernames.md
- project/spec/trace/requirement/req-routing-reasoning-recorded.md
- project/spec/trace/requirement/req-scaffold-from-template.md
- project/spec/trace/requirement/req-scoped-run-records-its-timings.md
- project/spec/trace/requirement/req-second-product-reuses-install.md
- project/spec/trace/requirement/req-selected-node-shows-its-claim.md
- project/spec/trace/requirement/req-setup-floor-editor-shell.md
- project/spec/trace/requirement/req-setup-serves-shipped-method.md
- project/spec/trace/requirement/req-setup-stops-before-partial.md
- project/spec/trace/requirement/req-shutdown-fires-only-idle-or-end.md
- project/spec/trace/requirement/req-single-option-recorded-as-finding.md
- project/spec/trace/requirement/req-size-choice-is-the-bless.md
- project/spec/trace/requirement/req-size-escalation-readjudicated.md
- project/spec/trace/requirement/req-size-proposal-names-strikes.md
- project/spec/trace/requirement/req-small-fix-joins-open-record.md
- project/spec/trace/requirement/req-state-needs-all-its-inputs.md
- project/spec/trace/requirement/req-state-opens-only-when-earned.md
- project/spec/trace/requirement/req-story-links-its-proving-run.md
- project/spec/trace/requirement/req-stray-captured-in-one-call.md
- project/spec/trace/requirement/req-structure-verdicts-are-mechanical.md
- project/spec/trace/requirement/req-surface-answers-in-one-second.md
- project/spec/trace/requirement/req-survey-counts-only-open-records.md
- project/spec/trace/requirement/req-sweep-covers-every-drift-class.md
- project/spec/trace/requirement/req-table-refuses-what-it-cannot-draw.md
- project/spec/trace/requirement/req-table-rows-derive-from-notes.md
- project/spec/trace/requirement/req-test-result-is-structured.md
- project/spec/trace/requirement/req-test-run-carries-its-question.md
- project/spec/trace/requirement/req-test-scope-discipline.md
- project/spec/trace/requirement/req-the-answer-never-exceeds-its-bound.md
- project/spec/trace/requirement/req-the-full-battery-runs-where-the-method-says.md
- project/spec/trace/requirement/req-the-lane-runs-without-a-console.md
- project/spec/trace/requirement/req-the-size-is-read-by-one-extractor.md
- project/spec/trace/requirement/req-tour-admits-absence.md
- project/spec/trace/requirement/req-tour-ends-at-the-desk.md
- project/spec/trace/requirement/req-tour-highlights-the-named-part.md
- project/spec/trace/requirement/req-tour-outlives-a-missing-highlight.md
- project/spec/trace/requirement/req-tour-reads-what-stands.md
- project/spec/trace/requirement/req-tour-shows-live-instances.md
- project/spec/trace/requirement/req-tour-speaks-plainly.md
- project/spec/trace/requirement/req-trace-source-never-mixes.md
- project/spec/trace/requirement/req-trace-view-derived-from-files.md
- project/spec/trace/requirement/req-trees-never-mix.md
- project/spec/trace/requirement/req-two-options-beyond-the-obvious.md
- project/spec/trace/requirement/req-unknown-drain-ref-refused.md
- project/spec/trace/requirement/req-unshipped-dependency-refused.md
- project/spec/trace/requirement/req-upward-links-live-in-the-file.md
- project/spec/trace/requirement/req-vendor-page-claim-only.md
- project/spec/trace/requirement/req-version-control-resolves-like-every-call.md
- project/spec/trace/requirement/req-view-writes-round-trip.md
- project/spec/trace/requirement/req-walk-branches-at-waypoint.md
- project/spec/trace/requirement/req-walk-opens-at-retro.md
- project/spec/trace/requirement/req-walk-resumes-from-repo.md
- project/spec/trace/requirement/req-walk-survives-host-swap.md
- project/spec/trace/requirement/req-work-starts-without-a-reachable-remote.md

## set_criteria

- complete: PASS, scoped to the change. Every new use case's core steps are covered: uc-query-the-corpus-by-structure by req-query-returns-named-fields, req-query-refuses-unknown-field, req-query-empty-result-explicit; uc-get-a-trustworthy-answer by the same plus req-query-is-deterministic; uc-dispose-of-a-candidate-coupling by req-bm25-returns-ranked-candidates, req-bm25-below-threshold-returns-empty, req-bm25-candidates-need-disposition. Steps with no dedicated row are the conversational steps (asking a question, describing a change in words) and the plain file-read that follows a returned id — existing lane infrastructure, not new system behavior.
- consistent: PASS. No two new rows conflict. Unknown-field and empty-result are distinct conditions (a bad request vs. a request with no matches) and stay separate rows rather than folding into one ambiguous refusal.
- affordable: PASS. Seven new rows across three new use cases stays under the fan-out heuristic's five-per-use-case smell threshold on each one individually, and both verbs expose prior art rather than invent it, per frame-delta's why_now.
- bounded: PASS. Every new row traces to a step or extension in one of the three new use cases; none reaches past scope-non-goals' seven-item scope.
- comprehensible: PASS. Each statement is a single EARS-shaped shall-claim naming no mechanism — not the pinned subset, not the ranking formula — matching map-stakeholders' own instruction that the mechanism stays architecture's question.
- no_tbd: PASS. Swept the seven new rows for the literal markers TBD, TBC, TBR and ??? — zero found.
- behaviour_modelled: NONE OF THE SEVEN WANTED ONE. Each states one condition and one response: a query call, a refusal, an empty result, a ranked return, a disposition requirement. None is a sequence, a state model or a lifecycle; a diagram of any one would restate its own statement in a second notation.

## follow_up

Two doors are offered next: derive-functions (the solution-neutral function structure) and identify-assumptions (sweep the requirements for what they lean on, as RAID assumptions). Both were blocked pending this state's own read; the walk should ask which is offered once this form signs, rather than assuming.

Carried forward unresolved: raid-risk-i15-ships-without-a-live-prior-art-scan (no search tool permitted this session).

## anything_else

