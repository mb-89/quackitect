---
form: author-tests
by: agent
signed_off: 2026-08-20T09:28:09.198Z
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

author-tests opens M7. M6 closed at gate-prototype with the winner declared on probed ground.

SIX REQUIREMENTS WERE IN SCOPE AND NONE HAD A SPEC. Four were authored here, grouped by verification concern rather than one per requirement.

THREE PRE-EXISTING SPECS WERE BROKEN AND ARE FIXED. tsp-a-failed-call-becomes-work, tsp-a-finding-outlives-the-box and tsp-research-across-harnesses are all `method: demonstration` and each carried a `## Steps` section where the template demands `## Procedure`, with no `files` key at all. Both are mechanical faults from i36 and both are corrected. The demonstrations themselves were performed and their runs are written up on the nodes; nothing about their content changed.

THE FILES ARE PLANNED, NOT LANDED. tests/benchmark-run.test.ts does not exist yet. That is test-first working as intended — existence gets its teeth at verification, and observe-red is two states away.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-a-benchmark-report-carries-its-conditions]] | test | req-a-benchmark-report-carries-the-conditions-of-its-run · req-a-run-that-stopped-early-says-where-it-stopped |
| [[tsp-a-benchmark-run-leaves-the-archive-untouched]] | inspection | req-a-benchmark-run-modifies-no-record-and-appears-in-no-survey |
| [[tsp-a-bound-run-cannot-reach-past-its-rewind-point]] | test | req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point · req-a-ceiling-that-cannot-prove-ancestry-refuses |
| [[tsp-a-breached-bound-reaches-a-reviewer]] | test | req-a-breached-bound-is-put-in-front-of-a-reviewer |
| [[tsp-a-configuration-path-lives-in-one-place]] | test | req-a-preflight-check-asks-the-reader-where-it-looked |
| [[tsp-a-control-is-legible]] | test | req-a-refused-act-says-why-and-what-next · req-a-surface-shows-the-state-an-act-produced · req-a-control-that-undoes-on-a-second-press-says-so-first |
| [[tsp-a-copy-is-owned-and-still-takes-what-we-learn]] | demonstration | none — demonstrates carries the edge; the producing half is verify method test and is carried by tsp-a-vehicle-is-made-and-then-drives-something-else |
| [[tsp-a-decline-is-legible-to-the-person]] | demonstration | none — demonstrates carries the edge; the three requirements behind this story are verify method test and are carried by tsp-a-control-is-legible |
| [[tsp-a-failed-call-becomes-work]] | demonstration | none — demonstrates: carries the edge; req-repeated-failure-shape-becomes-durable-work is verify_method: test and is carried by tsp-repeated-failure-shape-becomes-durable-work |
| [[tsp-a-finding-outlives-the-box]] | demonstration | none — demonstrates: carries the edge; the pool and mint requirements behind this story are verify_method: test and are carried by tsp-the-mint-crosses-the-boundary and tsp-one-door-into-the-pool |
| [[tsp-a-long-wait-is-never-a-guess]] | demonstration | none — demonstrates carries the edge; req-work-past-its-bound-says-it-is-working is verify method test and is carried by tsp-work-past-its-bound-signals |
| [[tsp-a-parked-finding-reaches-another-clone]] | demonstration | none — this spec demonstrates a story end to end, so the demonstrates edge above carries its trace; the one requirement mentioning either story is req-open-work-is-answered-from-the-repository-not-a-local-store and its verify method is test; every requirement was checked for a mention of either story |
| [[tsp-a-produced-tree-is-bounded-and-named]] | test | req-an-act-writes-only-the-tree-it-produced · req-the-product-name-is-one-fact · req-where-each-artifact-lands-when-driving |
| [[tsp-a-recorded-act-carries-its-actor]] | test | req-the-actor-is-recorded-where-the-call-is-served · req-acts-carry-role-and-channel |
| [[tsp-a-repeatable-answer-earns-its-trust]] | demonstration | none — this spec demonstrates a story end to end, so the demonstrates edge above carries its trace; no requirement in the corpus mentions sty-trust-a-repeatable-answer; what this spec observes is whether a person TRUSTS an answer and no row states that as a behaviour |
| [[tsp-a-slow-signal-keeps-the-wait]] | demonstration | req-a-slowness-signal-never-shortens-the-wait |
| [[tsp-a-structured-query-answers-what-a-decision-touches]] | demonstration | none — demonstrates carries the edge; the evaluator's mechanics are test-verified by tsp-query-answers |
| [[tsp-a-vehicle-cannot-reach-what-it-came-from]] | demonstration | none — demonstrates carries the edge; the containment rules are verify method test and are carried by tsp-a-produced-tree-is-bounded-and-named |
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
| [[tsp-boot-needs-no-manual-test-metadata-repair]] | test | req-boot-needs-no-manual-test-metadata-repair |
| [[tsp-bound-engine-and-method]] | test | req-an-engine-change-applies-in-its-own-record · req-a-method-change-reaches-every-tree |
| [[tsp-bound-resolution]] | test | req-a-read-comes-from-where-it-is-meant · req-a-write-lands-where-it-is-meant · req-a-wrong-act-never-passes-silently · req-version-control-resolves-like-every-call |
| [[tsp-bound-rules]] | test | req-a-check-binds-without-engine-code · req-an-unbound-rule-is-reported |
| [[tsp-bound-surface]] | demonstration | req-a-surface-resolves-to-what-it-shows |
| [[tsp-call-log]] | test | req-every-call-logged · req-refusal-carries-remedy · req-acts-carry-role-and-channel · req-answer-recorded-with-question · req-audit-answers-from-log · req-outbound-query-logged · req-missing-provider-named |
| [[tsp-candidate-couplings-are-disposed-one-by-one]] | demonstration | none — demonstrates carries the edge; the ranker's mechanics are test-verified over the coupling-rank cases |
| [[tsp-carry-a-finding]] | demonstration | none — this spec demonstrates a story end to end, so the demonstrates edge above carries its trace; the two requirements stating the mechanics are req-a-harmless-finding-is-carried-not-stopped-on and req-a-harmless-finding-names-an-open-entry; both are verify method test so both belong on a test spec |
| [[tsp-claims-and-drift]] | test | req-form-is-built-and-checked · req-gate-evidence-must-be-sound · req-moved-evidence-invalidates-the-bless · req-rejection-carries-its-reason · req-fallen-condition-named |
| [[tsp-close-and-land]] | test | req-close-refuses-loose-ends · req-close-serves-its-findings · req-close-leaves-trunk-clean · req-land-demands-fresh-green · req-reject-names-the-redo · req-trees-never-mix |
| [[tsp-conformance-at-the-write]] | demonstration | none — demonstrates carries the edge; both requirements are verify method test and are carried by tsp-bound-rules and tsp-write-guard |
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
| [[tsp-hand-walk]] | demonstration | none — demonstrates sty-walk-it-by-hand carries the edge; the mechanics are test-verified by tsp-walk-discipline |
| [[tsp-help-search]] | test | req-help-searches-tools-and-guidance · req-help-miss-is-logged · req-help-demand-ranked · req-help-query-logged-with-result |
| [[tsp-interrupted-call-names-the-stopping-layer]] | test | req-interrupted-call-names-the-stopping-layer |
| [[tsp-lane-cost]] | test | req-the-full-battery-runs-where-the-method-says · req-a-deletion-names-what-points-at-the-node |
| [[tsp-lane-file-safety]] | test | req-no-agent-act-destroys-work · req-every-artifact-is-readable-text · req-repo-search-carries-intent · req-lane-fixes-what-machines-fix |
| [[tsp-lane-help-run]] | demonstration | none — demonstrates sty-ask-the-lane-what-it-can-do carries the edge; the mechanics are test-verified by tsp-help-search |
| [[tsp-live-table]] | test | req-table-rows-derive-from-notes · req-cell-edit-lands-in-the-note · req-table-refuses-what-it-cannot-draw · req-view-writes-round-trip · req-query-is-the-file · req-grouping-and-sorting-hold · req-expressions-evaluate-per-reference |
| [[tsp-native-project-tools-stay-outside-the-cage]] | test | req-native-project-tools-stay-outside-the-cage |
| [[tsp-node-scoping]] | test | req-nodes-scoped-to-iteration |
| [[tsp-notes-inbox]] | test | req-stray-captured-in-one-call · req-capture-moves-nothing · req-idea-lands-as-note · req-duplicate-stray-still-captured · req-open-notes-stay-visible · req-drained-note-leaves-count · req-drain-one-home-with-payload · req-parked-note-re-drains · req-unknown-drain-ref-refused · req-retro-window-drains-whole · req-kickoff-refuses-pending-notes |
| [[tsp-one-answer-about-the-corpus]] | test | req-what-the-corpus-is-has-one-answer |
| [[tsp-one-door-into-the-pool]] | inspection | req-the-crossing-is-the-same-act-for-a-person-and-an-agent |
| [[tsp-one-operation-reads-its-input-once]] | test | req-one-operation-reads-its-input-once |
| [[tsp-opening-the-folder-is-the-whole-interaction]] | demonstration | req-the-editor-is-the-only-entry-point |
| [[tsp-overhaul-sweep]] | test | req-overhaul-closes-green · req-overhaul-takes-only-unowned-drift · req-sweep-covers-every-drift-class · req-clean-sweep-is-dated |
| [[tsp-overlay-seam]] | test | req-overlay-resolution · req-overlay-survives-update · req-overlay-drift-reported · req-guidance-edit-lands-where-it-compiles |
| [[tsp-oversized-results-remain-recoverable-through-the-lane]] | test | req-oversized-results-remain-recoverable-through-the-lane |
| [[tsp-panel-walkthrough]] | demonstration | req-panel-shows-the-machine · req-selected-node-shows-its-claim · req-resume-needs-no-person · req-walk-survives-host-swap |
| [[tsp-placeholder-refuses-entry]] | test | req-a-placeholder-drawing-refuses-entry |
| [[tsp-product-scaffold]] | test | req-begin-touches-nothing-existing · req-fresh-product-starts-empty · req-scaffold-from-template · req-method-reuse-is-vendoring · req-product-is-a-folder · req-nothing-a-copy-does-reaches-its-source · req-setup-floor-editor-shell · req-setup-stops-before-partial · req-extension-replaced-reported |
| [[tsp-prose-inspection]] | inspection | req-entry-speaks-plainly · req-tour-speaks-plainly · req-roles-never-usernames · req-no-claim-without-evidence · req-vendor-page-claim-only · req-comparison-carries-both-sides · req-one-note-per-settled-point · req-desk-offers-a-tour |
| [[tsp-query-answers]] | test | req-query-returns-named-fields · req-query-refuses-unknown-field · req-query-empty-result-explicit · req-query-is-deterministic |
| [[tsp-read-back-inspection]] | inspection | req-a-resolution-is-proven-by-read-back · req-every-record-path-resolves-in-one-tree |
| [[tsp-reading-loop]] | test | req-reading-proof · req-owed-reading-is-served · req-compaction-reowes-the-reading · req-missing-document-stops-the-walk |
| [[tsp-reading-proof-run]] | demonstration | none — demonstrates sty-the-agent-proves-it-read carries the edge; the mechanics are test-verified by tsp-reading-loop |
| [[tsp-record-inspection]] | inspection | req-purpose-recorded-at-begin · req-record-arrives-prefilled · req-recommendation-is-derived · req-routing-reasoning-recorded · req-losers-stay-on-record · req-divergence-order-on-record · req-finding-keeps-its-sources · req-finding-lands-as-reference · req-finding-names-its-home · req-story-links-its-proving-run · req-upward-links-live-in-the-file · req-test-run-carries-its-question |
| [[tsp-record-lifecycle]] | test | req-container-offers-its-records · req-survey-counts-only-open-records · req-record-opens-on-word · req-record-status-comes-from-the-record · req-walk-opens-at-retro · req-unshipped-dependency-refused · req-landing-needs-no-close · req-size-choice-is-the-bless · req-size-escalation-readjudicated · req-size-proposal-names-strikes · req-bless-outputs-ride-the-bless · req-blessed-column-compiles-pinned · req-a-shipped-record-is-never-reclaimed · req-a-records-dependency-is-declared · req-a-records-own-status-decides-whether-it-is-open · req-entering-repairs-itself-or-names-the-remedy · req-work-starts-without-a-reachable-remote |
| [[tsp-repeated-failure-shape-becomes-durable-work]] | test | req-repeated-failure-shape-becomes-durable-work |
| [[tsp-research-across-harnesses]] | demonstration | none — demonstrates: carries the edge; the harness-contract requirements behind this story are verify_method: test and are carried by tsp-supported-harness-serves-one-lane-contract |
| [[tsp-ripple-root]] | test | req-a-ripple-names-its-root |
| [[tsp-seed-dependency]] | test | req-a-seed-states-its-dependency |
| [[tsp-seeded-scaffolds]] | test | req-pin-writes-seeded-scaffolds |
| [[tsp-size-compiles-mechanically]] | test | req-the-size-is-read-by-one-extractor · req-a-size-may-drop-a-question |
| [[tsp-stop-hook-yields-only-at-a-machine-stop]] | test | req-stop-hook-yields-only-at-a-machine-stop |
| [[tsp-supply-gap]] | test | req-no-state-demands-what-it-cannot-supply |
| [[tsp-supported-harness-serves-one-lane-contract]] | test | req-supported-harness-serves-one-lane-contract |
| [[tsp-test-discipline]] | test | req-scoped-run-records-its-timings · req-test-scope-discipline · req-test-result-is-structured · req-first-green-needs-a-red · req-red-is-never-carried |
| [[tsp-the-arrival]] | test | req-the-arrival-never-costs-the-session · req-the-declared-runtime-floor-is-read-never-edited |
| [[tsp-the-arrival-in-one-act]] | demonstration | req-one-command-takes-a-fresh-clone-to-a-live-lane · req-arriving-twice-changes-nothing |
| [[tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound]] | test | req-the-benchmark-history-is-unreadable-while-a-run-is-bound |
| [[tsp-the-bucket]] | test | req-a-harmless-finding-is-carried-not-stopped-on · req-a-harmless-finding-names-an-open-entry · req-close-refuses-loose-ends |
| [[tsp-the-cited-refs-resolve]] | demonstration | req-every-ref-the-corpus-cites-resolves-on-arrival |
| [[tsp-the-desk-takes-a-sentence-in-five-seconds]] | test | req-the-desk-is-usable-soon-after-the-folder-opens |
| [[tsp-the-driving-calls-come-back-inside-a-second]] | demonstration | none — demonstrates carries the edge; the one-second demand is verify method test and is carried by the bound checks on the modelled interfaces |
| [[tsp-the-engine-keeps-no-record-of-what-it-produced]] | inspection | req-the-source-keeps-no-record-of-a-copy |
| [[tsp-the-folder-answers-for-consent]] | test | req-a-folder-is-driven-only-with-consent |
| [[tsp-the-folder-shows-what-to-run]] | test | req-the-folder-shows-what-to-run |
| [[tsp-the-graph-answers-what-a-change-touches]] | demonstration | none — this spec demonstrates a story end to end, so the demonstrates edge above carries its trace; no requirement in the corpus mentions either story; the claim is about what a person can trust rather than about a return value |
| [[tsp-the-mint-crosses-the-boundary]] | test | req-draining-to-the-pool-mints-an-option-on-trunk · req-a-minted-option-is-authored-never-the-note-s-own-text · req-a-minted-option-says-what-it-is-and-when-it-comes-back · req-the-raw-note-stays-local-and-is-marked-drained |
| [[tsp-the-open-folder-is-the-root]] | test | req-the-machine-state-sits-in-the-folder-that-is-open |
| [[tsp-the-package-answers-what-it-is]] | demonstration | none — demonstrates: sty-ask-the-package-what-it-is carries the edge; the mechanics are test-verified by tsp-an-install-answers-what-it-is |
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
| [[tsp-withheld-by-its-door-not-by-its-folder]] | test | req-only-a-file-with-its-own-door-is-withheld |
| [[tsp-work-past-its-bound-signals]] | test | req-work-past-its-bound-says-it-is-working |
| [[tsp-write-guard]] | test | req-a-write-that-breaks-the-corpus-refuses · req-a-value-outside-its-vocabulary-refuses · req-a-standing-break-reports-and-lands · req-a-check-names-its-way-forward · req-a-check-too-slow-for-the-write-moves-to-the-sweep |

## follow_up

- specify-build is next, then observe-red makes tests/benchmark-run.test.ts go red for real.
- THE TRUNK MERGE HAPPENS AT build-steps, which is the first state on this walk where se_git is legal. Recorded as an answered question; the owner asked for it before author-tests and the machine does not allow git here.
- THE INCREMENTAL REPORT GETS THE FIRST TEST, as gate-prototype required. It is inside tsp-a-benchmark-report-carries-its-conditions, as the case that a run stopped early records the state it actually ended in.
- tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound CANNOT GO GREEN IN THIS ITERATION. It waits on wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-. The spec is authored anyway, because test-first means the spec never waits for the build, and a requirement with no spec is invisible at verification.
- THE EIGHTH GOAL IS STILL UNSERVED. vp-rigor-without-toil gains its success criterion at the state that derives value, or it is cut. Four gates have now named it.

## anything_else

ONE CHOICE IN THESE SPECS IS ARGUABLE AND IS ARGUED ON THE NODES RATHER THAN HERE.

tsp-a-benchmark-run-leaves-the-archive-untouched IS AN INSPECTION, NOT A TEST, and its requirement's verify_method already said so. The approach section says why it is the right method rather than a weaker one: the claim is about ABSENCE across a whole tree, and a test proves only what it looked at. Enumerating the expected write sites and asserting none fired is exactly the failure — it proves the guard holds where somebody already thought about it.

TWO SPECS CARRY A KNOWN-BROKEN THING ON PURPOSE.

- THE CONCEALMENT SPEC IS WRITTEN AGAINST CALL SITES, NEVER AGAINST A LIST, because M6 measured four exclusion lists with one empty and three disagreeing. A test that exercises one list and passes proves nothing about the other three. It asserts the site COUNT, so a verb added later fails the spec rather than escaping it.
- THE CONDITIONS SPEC ASSERTS WHAT THE RIGOR MATRIX STAMP COVERS, not merely that it is present. The stamp was probed FALSE on 2026-08-20: it hashes rows/*.md and nothing else, while guidance, form templates, item templates, method cards and the engine all change walk cost. A report stamping that hash alone claims more than it knows, and this is the cheapest place to make that visible.

NO SPEC HERE CLAIMS AN EXISTING BATTERY FILE. The guidance warns that an existing file may already carry a requirement and that a mapping nobody checked is fabricated coverage. Every requirement in scope is new, the benchmark run does not exist yet, and all five test-method requirements point at one planned file.
