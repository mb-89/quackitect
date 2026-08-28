---
form: author-tests
by: agent
signed_off: 2026-08-19T11:52:46.584Z
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

Five test specs are new and five test files stand beside them. Nothing else in the suite is touched.

FOURTEEN CASES IN ALL. Nine are RED on purpose and five are GREEN, and every green one guards something a fix could break rather than padding a count.

The specs and the files were written together, so no spec names a file that does not exist.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-a-breached-bound-reaches-a-reviewer]] | test | req-a-breached-bound-is-put-in-front-of-a-reviewer |
| [[tsp-a-configuration-path-lives-in-one-place]] | inspection | req-a-preflight-check-asks-the-reader-where-it-looked |
| [[tsp-a-control-is-legible]] | test | req-a-refused-act-says-why-and-what-next · req-a-surface-shows-the-state-an-act-produced · req-a-control-that-undoes-on-a-second-press-says-so-first |
| [[tsp-a-copy-is-owned-and-still-takes-what-we-learn]] | demonstration | none — demonstrates: carries the edge; the producing half is verify_method: test and is carried by tsp-a-vehicle-is-made-and-then-drives-something-else |
| [[tsp-a-decline-is-legible-to-the-person]] | demonstration | none — demonstrates: carries the edge; the three requirements behind this story are verify_method: test and are carried by tsp-a-control-is-legible |
| [[tsp-a-long-wait-is-never-a-guess]] | demonstration | none — demonstrates: carries the edge; req-work-past-its-bound-says-it-is-working is verify_method: test and is carried by tsp-work-past-its-bound-signals |
| [[tsp-a-parked-finding-reaches-another-clone]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-a-produced-tree-is-bounded-and-named]] | test | req-an-act-writes-only-the-tree-it-produced · req-the-product-name-is-one-fact · req-where-each-artifact-lands-when-driving |
| [[tsp-a-recorded-act-carries-its-actor]] | test | req-the-actor-is-recorded-where-the-call-is-served · req-acts-carry-role-and-channel |
| [[tsp-a-repeatable-answer-earns-its-trust]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-a-slow-signal-keeps-the-wait]] | demonstration | req-a-slowness-signal-never-shortens-the-wait |
| [[tsp-a-structured-query-answers-what-a-decision-touches]] | demonstration | none — demonstrates: carries the edge; the evaluator's own mechanics are test-verified by tsp-query-answers over tests/query.test.ts |
| [[tsp-a-vehicle-cannot-reach-what-it-came-from]] | demonstration | none — demonstrates: carries the edge; the containment rules are verify_method: test and are carried by tsp-a-produced-tree-is-bounded-and-named |
| [[tsp-a-vehicle-is-made-and-then-drives-something-else]] | demonstration | req-one-command-produces-a-complete-copy · req-the-system-runs-in-a-tree-that-is-not-its-own |
| [[tsp-an-amend-leaves-the-tree-standing]] | test | req-an-amend-leaves-the-tree-standing |
| [[tsp-an-empty-offer-says-so]] | test | req-an-empty-live-source-names-itself |
| [[tsp-an-install-answers-what-it-is]] | test | req-the-entrypoint-answers-its-version-without-starting |
| [[tsp-answer-bound]] | test | req-the-answer-never-exceeds-its-bound |
| [[tsp-archive]] | test | req-archive-lists-every-closed-record · req-archive-opens-to-a-person-only · req-archive-read-only · req-archive-shows-it-as-it-closed · req-a-closed-records-folder-stays-on-trunk |
| [[tsp-assertion-red]] | test | req-a-red-is-an-assertion-not-a-crash |
| [[tsp-autonomy-surface]] | test | req-emergency-sits-above-full · req-drumroll-arms-deliberately · req-controls-draw-from-their-spec · req-shutdown-fires-only-idle-or-end |
| [[tsp-autonomy-tiers]] | inspection | req-autonomy-is-categorical |
| [[tsp-boot-bench]] | test | req-boot-ends-at-front-desk |
| [[tsp-bound-engine-and-method]] | test | req-an-engine-change-applies-in-its-own-record · req-a-method-change-reaches-every-tree |
| [[tsp-bound-resolution]] | test | req-a-read-comes-from-where-it-is-meant · req-a-write-lands-where-it-is-meant · req-a-wrong-act-never-passes-silently · req-version-control-resolves-like-every-call |
| [[tsp-bound-rules]] | test | req-a-check-binds-without-engine-code · req-an-unbound-rule-is-reported |
| [[tsp-bound-surface]] | demonstration | req-a-surface-resolves-to-what-it-shows |
| [[tsp-call-log]] | test | req-every-call-logged · req-refusal-carries-remedy · req-acts-carry-role-and-channel · req-answer-recorded-with-question · req-audit-answers-from-log · req-outbound-query-logged · req-missing-provider-named |
| [[tsp-candidate-couplings-are-disposed-one-by-one]] | demonstration | none — demonstrates: carries the edge; the ranker's own mechanics are test-verified over tests/coupling-rank.test.ts |
| [[tsp-carry-a-finding]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-claims-and-drift]] | test | req-form-is-built-and-checked · req-gate-evidence-must-be-sound · req-moved-evidence-invalidates-the-bless · req-rejection-carries-its-reason · req-fallen-condition-named |
| [[tsp-close-and-land]] | test | req-close-refuses-loose-ends · req-close-serves-its-findings · req-close-leaves-trunk-clean · req-land-demands-fresh-green · req-reject-names-the-redo · req-trees-never-mix |
| [[tsp-conformance-at-the-write]] | demonstration | none — demonstrates: carries the edge; both requirements are verify_method: test and are carried by tsp-bound-rules and tsp-write-guard |
| [[tsp-coupling-disposition]] | inspection | req-bm25-candidates-need-disposition |
| [[tsp-coupling-rank]] | test | req-bm25-returns-ranked-candidates · req-bm25-below-threshold-returns-empty |
| [[tsp-coverage-computes-both-sides]] | test | req-a-coverage-check-computes-both-sides |
| [[tsp-decision-machinery]] | test | req-two-options-beyond-the-obvious · req-option-carries-cost-and-shed · req-choice-records-case-against-losers · req-choosing-none-is-legal · req-single-option-recorded-as-finding · req-problem-recorded-before-options · req-ideation-opens-no-record |
| [[tsp-derivation-analysis]] | analysis | req-trace-view-derived-from-files · req-reachable-capability-is-traced |
| [[tsp-design-checks]] | test | req-structure-verdicts-are-mechanical · req-bound-field-rebuilds-from-nodes · req-drawn-state-equals-a-row |
| [[tsp-desk-and-gates]] | demonstration | req-desk-greets-walkable · req-desk-takes-plain-words · req-desk-states-the-folder-rule · req-small-fix-joins-open-record · req-retro-asks-real-use · req-gate-rounds-stay-readable · req-gate-shows-the-evidence-form · req-overhaul-opens-without-deliverable |
| [[tsp-engine-lifecycle]] | test | req-surface-answers-in-one-second · req-crash-lands-safe · req-reload-restarts-clean · req-call-answers-in-one-second · req-mirror-stays-on-the-machine · req-engine-port-fallback · req-the-lane-runs-without-a-console |
| [[tsp-fallback-outcome]] | test | req-a-fallback-fires-when-its-condition-fails |
| [[tsp-first-run]] | demonstration | req-newcomer-one-command · req-newcomer-orients-unaided · req-newcomer-leaves-able-to-ask · req-one-script-installs · req-second-product-reuses-install · req-setup-serves-shipped-method · req-begin-says-own-window · req-fresh-machine-runs · req-boot-stands-agentless |
| [[tsp-hand-walk]] | demonstration | none — demonstrates: sty-walk-it-by-hand carries the edge; the mechanics are test-verified by tsp-walk-discipline |
| [[tsp-help-search]] | test | req-help-searches-tools-and-guidance · req-help-miss-is-logged · req-help-demand-ranked · req-help-query-logged-with-result |
| [[tsp-lane-cost]] | test | req-the-full-battery-runs-where-the-method-says · req-a-deletion-names-what-points-at-the-node |
| [[tsp-lane-file-safety]] | test | req-no-agent-act-destroys-work · req-every-artifact-is-readable-text · req-repo-search-carries-intent · req-lane-fixes-what-machines-fix |
| [[tsp-lane-help-run]] | demonstration | none — demonstrates: sty-ask-the-lane-what-it-can-do carries the edge; the mechanics are test-verified by tsp-help-search |
| [[tsp-live-table]] | test | req-table-rows-derive-from-notes · req-cell-edit-lands-in-the-note · req-table-refuses-what-it-cannot-draw · req-view-writes-round-trip · req-query-is-the-file · req-grouping-and-sorting-hold · req-expressions-evaluate-per-reference |
| [[tsp-node-scoping]] | test | req-nodes-scoped-to-iteration |
| [[tsp-notes-inbox]] | test | req-stray-captured-in-one-call · req-capture-moves-nothing · req-idea-lands-as-note · req-duplicate-stray-still-captured · req-open-notes-stay-visible · req-drained-note-leaves-count · req-drain-one-home-with-payload · req-parked-note-re-drains · req-unknown-drain-ref-refused · req-retro-window-drains-whole · req-kickoff-refuses-pending-notes |
| [[tsp-one-door-into-the-pool]] | inspection | req-the-crossing-is-the-same-act-for-a-person-and-an-agent |
| [[tsp-one-operation-reads-its-input-once]] | test | req-one-operation-reads-its-input-once |
| [[tsp-overhaul-sweep]] | test | req-overhaul-closes-green · req-overhaul-takes-only-unowned-drift · req-sweep-covers-every-drift-class · req-clean-sweep-is-dated |
| [[tsp-overlay-seam]] | test | req-overlay-resolution · req-overlay-survives-update · req-overlay-drift-reported · req-guidance-edit-lands-where-it-compiles |
| [[tsp-panel-walkthrough]] | demonstration | req-panel-shows-the-machine · req-selected-node-shows-its-claim · req-resume-needs-no-person · req-walk-survives-host-swap |
| [[tsp-placeholder-refuses-entry]] | test | req-a-placeholder-drawing-refuses-entry |
| [[tsp-product-scaffold]] | test | req-begin-touches-nothing-existing · req-fresh-product-starts-empty · req-scaffold-from-template · req-method-reuse-is-vendoring · req-product-is-a-folder · req-nothing-a-copy-does-reaches-its-source · req-setup-floor-editor-shell · req-setup-stops-before-partial · req-extension-replaced-reported |
| [[tsp-prose-inspection]] | inspection | req-entry-speaks-plainly · req-tour-speaks-plainly · req-roles-never-usernames · req-no-claim-without-evidence · req-vendor-page-claim-only · req-comparison-carries-both-sides · req-one-note-per-settled-point · req-desk-offers-a-tour |
| [[tsp-query-answers]] | test | req-query-returns-named-fields · req-query-refuses-unknown-field · req-query-empty-result-explicit · req-query-is-deterministic |
| [[tsp-read-back-inspection]] | inspection | req-a-resolution-is-proven-by-read-back · req-every-record-path-resolves-in-one-tree |
| [[tsp-reading-loop]] | test | req-reading-proof · req-owed-reading-is-served · req-compaction-reowes-the-reading · req-missing-document-stops-the-walk |
| [[tsp-reading-proof-run]] | demonstration | none — demonstrates: sty-the-agent-proves-it-read carries the edge; the mechanics are test-verified by tsp-reading-loop |
| [[tsp-record-inspection]] | inspection | req-purpose-recorded-at-begin · req-record-arrives-prefilled · req-recommendation-is-derived · req-routing-reasoning-recorded · req-losers-stay-on-record · req-divergence-order-on-record · req-finding-keeps-its-sources · req-finding-lands-as-reference · req-finding-names-its-home · req-story-links-its-proving-run · req-upward-links-live-in-the-file · req-test-run-carries-its-question |
| [[tsp-record-lifecycle]] | test | req-container-offers-its-records · req-survey-counts-only-open-records · req-record-opens-on-word · req-record-status-comes-from-the-record · req-walk-opens-at-retro · req-unshipped-dependency-refused · req-landing-needs-no-close · req-size-choice-is-the-bless · req-size-escalation-readjudicated · req-size-proposal-names-strikes · req-bless-outputs-ride-the-bless · req-blessed-column-compiles-pinned · req-a-shipped-record-is-never-reclaimed · req-a-records-dependency-is-declared · req-a-records-own-status-decides-whether-it-is-open · req-entering-repairs-itself-or-names-the-remedy · req-work-starts-without-a-reachable-remote |
| [[tsp-ripple-root]] | test | req-a-ripple-names-its-root |
| [[tsp-seed-dependency]] | test | req-a-seed-states-its-dependency |
| [[tsp-seeded-scaffolds]] | test | req-pin-writes-seeded-scaffolds |
| [[tsp-size-compiles-mechanically]] | test | req-the-size-is-read-by-one-extractor · req-a-size-may-drop-a-question |
| [[tsp-supply-gap]] | test | req-no-state-demands-what-it-cannot-supply |
| [[tsp-test-discipline]] | test | req-scoped-run-records-its-timings · req-test-scope-discipline · req-test-result-is-structured · req-first-green-needs-a-red · req-red-is-never-carried |
| [[tsp-the-arrival]] | test | req-the-arrival-never-costs-the-session · req-the-declared-runtime-floor-is-read-never-edited |
| [[tsp-the-arrival-in-one-act]] | demonstration | req-one-command-takes-a-fresh-clone-to-a-live-lane · req-arriving-twice-changes-nothing |
| [[tsp-the-bucket]] | test | req-a-harmless-finding-is-carried-not-stopped-on · req-a-harmless-finding-names-an-open-entry · req-close-refuses-loose-ends |
| [[tsp-the-cited-refs-resolve]] | demonstration | req-every-ref-the-corpus-cites-resolves-on-arrival |
| [[tsp-the-driving-calls-come-back-inside-a-second]] | demonstration | none — demonstrates: carries the edge; the one-second demand is verify_method: test and is carried by the bound checks on the modelled interfaces |
| [[tsp-the-engine-keeps-no-record-of-what-it-produced]] | inspection | req-the-source-keeps-no-record-of-a-copy |
| [[tsp-the-graph-answers-what-a-change-touches]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-the-mint-crosses-the-boundary]] | test | req-draining-to-the-pool-mints-an-option-on-trunk · req-a-minted-option-is-authored-never-the-note-s-own-text · req-a-minted-option-says-what-it-is-and-when-it-comes-back · req-the-raw-note-stays-local-and-is-marked-drained |
| [[tsp-the-paint-tells-three-greens-apart]] | test | req-the-panel-s-paint-says-which-kind-of-green-it-is |
| [[tsp-the-pool-is-what-is-offered]] | test | req-open-work-is-answered-from-the-repository-not-a-local-store · req-a-windowed-pool-answer-says-that-it-was-windowed · req-the-pool-answers-a-person-and-an-agent-from-one-source |
| [[tsp-tour-resilience]] | test | req-tour-admits-absence · req-tour-outlives-a-missing-highlight |
| [[tsp-tour-run]] | demonstration | req-tour-ends-at-the-desk · req-tour-highlights-the-named-part · req-tour-reads-what-stands · req-tour-shows-live-instances |
| [[tsp-trace-graph-view]] | test | req-filter-draws-only-what-serves |
| [[tsp-trace-integrity]] | test | req-broken-trace-is-a-defect · req-coverage-checked-both-ways · req-trace-source-never-mixes |
| [[tsp-two-machines]] | demonstration | req-one-command-starts-an-unattended-machine |
| [[tsp-unattended-start]] | demonstration | req-one-command-starts-an-unattended-machine |
| [[tsp-walk-branch-return]] | test | req-walk-branches-at-waypoint |
| [[tsp-walk-discipline]] | test | req-a-clear-jump-is-one-call · req-answer-pages-never-overflows · req-autonomy-gates-every-hop · req-autonomy-change-applies-forward · req-controls-never-advance-walk · req-gate-needs-a-persons-verdict · req-pull-answers-from-record · req-walk-resumes-from-repo · req-state-opens-only-when-earned · req-state-needs-all-its-inputs · req-a-reopen-stands-where-it-can-work · req-land-target-routes-to-gate · req-instruction-names-its-source · req-a-pull-carrying-no-choice-enters-no-iteration |
| [[tsp-walk-feedback-loop]] | test | req-reading-credit-survives-a-reload · req-red-objective-serves-its-fill · req-one-verb-says-why-a-state-is-grey |
| [[tsp-walk-window]] | test | req-reader-keeps-their-place · req-every-update-reaches-the-render · req-colors-are-configuration · req-narration-toll-is-collected · req-decision-graph-reads-as-branches |
| [[tsp-work-past-its-bound-signals]] | test | req-work-past-its-bound-says-it-is-working |
| [[tsp-write-guard]] | test | req-a-write-that-breaks-the-corpus-refuses · req-a-value-outside-its-vocabulary-refuses · req-a-standing-break-reports-and-lands · req-a-check-names-its-way-forward · req-a-check-too-slow-for-the-write-moves-to-the-sweep |

## follow_up

observe-red is next and it runs these five files. Nine cases must fail, and each must fail for the reason its spec names.

WHAT WOULD BE A PROBLEM THERE, and it is worth saying before the run: a case that fails on an import error rather than on its assertion. Two files reach for things that do not exist yet — an `actor` key on a record and a `statePaint` export — and a failure that says "undefined is not a function" proves nothing about the demand. Both were written to assert the absence explicitly instead.

build-steps then owns five changes, one per spec.

## anything_else

HOW THE METHOD PICKED EACH DESIGN, since the card says the method decides the cases and not taste.

- THE VERSION FLAG is a PROCESS with one output. The cases are a scenario walk: ask, read the line, ask with a broken root, ask for help instead.
- THE ACTOR STAMP has a small enumeration — recorded, recorded differently, not recorded — so it is equivalence partitioning over the three roles plus the absent case.
- THE CONFIGURATION PATH is a static attribute, so the method is INSPECTION rather than test. It is the cheapest method that catches the failure, which is what the card asks for.
- THE EMPTY SOURCE is BOUNDARY ANALYSIS on a partition small enough to walk whole: no source, a source with items, a source with none.
- THE PAINT is a DECISION TABLE over three flags, and the case that matters is the pair that must not collide.

EVERY CASE SITS AT THE LOWEST LEVEL THAT CAN CATCH ITS DEFECT. Three are component-level pure functions. One is inspection over source. Only the version flag needs a process, and it needs one because the demand is about a process.

WHAT IS NOT COVERED, said plainly. The heavy test file's split has no spec and no case, because the measurement that decides whether to split it does not exist until verification. If that measurement says another file sets the critical path, the item is struck and no test was ever owed.

TWO THINGS OUTSIDE THIS STATE'S OWN WORK HAD TO BE DONE BEFORE IT COULD CLOSE, and both are named rather than folded in.

SIX STANDING SPECS DID NOT ANSWER THEIR OWN TEMPLATE. Three carried an empty `verifies` list where the template wants an answer; one carried no `verifies` key at all; one carried no `files` key; one had no `## Steps` section. Each was answered out of what the spec already said — the demonstration specs verify no requirement and now say so in the house's own words, the inspection spec's checklist is its realization, and the arrival's steps are the six case names already in its file. No claim was changed.

ONE ENGINE DEFECT BLOCKED THE STATE OUTRIGHT. The bound table's header row was read as a node reference, so a table over `test-spec` reported its own header as an id resolving to nothing. The field beside it, bound the same way over `raid`, has never failed — the two differ by a hyphen. The extractor now skips a header, told from a data row by the rule row beneath it.

THAT FIX IS OUTSIDE THE BLESSED SCOPE and it is on the register as raid-iss-a-bound-tables-header-reads-as-a-reference. gate-implementation rules on it.

THE FIX COULD NOT TAKE EFFECT WITHOUT A RESTART, and that is worth recording because it is a fact about walking, not about the defect. The running engine holds the sources it started with. A blocking engine defect therefore needs three acts and not one: fix it, reach idle, reload. The walk was aimed at this state before the reload and came straight back to it, with every signed state and every credited reading intact.
