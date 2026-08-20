---
form: derive-criteria
by: agent
signed_off: 2026-08-20T11:45:11.826Z
reopened: "2026-08-20T11:45:09.399Z — the requirements it draws its axes from were re-signed after it during the M3 repairs, including a tenth requirement minted for the extension the completeness criterion had skipped"
authors: agent
files:
---

# Evidence form / derive-criteria

## current_situation

M3 is blessed. This state asks which criteria will judge the candidate designs.

FOURTEEN CRITERION AXES STAND, carried from earlier records, and the standing pairwise judgments already cover them — 123 of the 287 requirements carry a `weighs_against` and 24 carry a `weighs_with`, so both compare cards render with nothing owed.

THE STATE'S OWN NOTE SAYS WHAT TO DO WITH THAT: standing criteria are reused where they still measure what matters, and the change usually adds one or two of its own. This change adds exactly one, and it had to.

## compounding

| a | verdict | b |
| --- | --- | --- |
| [[req-a-clear-jump-is-one-call]] | ! — one measures whether aim-plus-move fits in a single call, the other measures per-call response latency; differ | [[req-call-answers-in-one-second]] |
| [[req-a-clear-jump-is-one-call]] | ! — one measures call count for the walk, the other measures a person's render latency at the mirror's HTTP bounda | [[req-surface-answers-in-one-second]] |
| [[req-a-resolution-is-proven-by-read-back]] | ! — one is a test-authoring discipline (prove by read-back), the other a runtime guarantee against silent failure; | [[req-a-wrong-act-never-passes-silently]] |
| [[req-boot-needs-no-manual-test-metadata-repair]] | ! — one is a test-authoring discipline about proving tree resolution, the other is boot tolerating a stale test-re | [[req-a-resolution-is-proven-by-read-back]] |
| [[req-boot-needs-no-manual-test-metadata-repair]] | ! — one is a runtime guarantee against silent failure across all calls, the other is boot's own handling of one re | [[req-a-wrong-act-never-passes-silently]] |
| [[req-boot-needs-no-manual-test-metadata-repair]] | ! — one is diagnosing an already-interrupted call, the other is tolerating an old test-record shape at boot; diffe | [[req-interrupted-call-names-the-stopping-layer]] |
| [[req-boot-needs-no-manual-test-metadata-repair]] | ! — one prevents a premature session end, the other repairs boot's own record reading; different mechanisms | [[req-stop-hook-yields-only-at-a-machine-stop]] |
| [[req-call-answers-in-one-second]] | ! — one times a driver's lane call at dispatch, the other a person's surface render at the mirror's HTTP boundary; | [[req-surface-answers-in-one-second]] |
| [[req-interrupted-call-names-the-stopping-layer]] | ! — one is a test-authoring discipline, the other is a runtime diagnostic on an interrupted call; different artifa | [[req-a-resolution-is-proven-by-read-back]] |
| [[req-interrupted-call-names-the-stopping-layer]] | ! — one covers every rule-violating call, the other only a call that ended without a normal result; different trig | [[req-a-wrong-act-never-passes-silently]] |
| [[req-interrupted-call-names-the-stopping-layer]] | ! — one reports which layer already ended a call, the other prevents the session ending in the first place; diagno | [[req-stop-hook-yields-only-at-a-machine-stop]] |
| [[req-native-project-tools-stay-outside-the-cage]] | ! — one is which tools a caged session can see, the other is which network addresses the mirror answers; different | [[req-mirror-stays-on-the-machine]] |
| [[req-newcomer-leaves-able-to-ask]] | ! — one measures what a tour teaches a newcomer, the other what the panel shows a returning person; a design can d | [[req-resume-needs-no-person]] |
| [[req-newcomer-leaves-able-to-ask]] | ! — one is a person's grasp after a tour, the other a payload size at the lane | [[req-the-answer-never-exceeds-its-bound]] |
| [[req-oversized-results-remain-recoverable-through-the-lane]] | ! — one measures result byte size and reconstruction, the other measures call count for a walk; different axes of  | [[req-a-clear-jump-is-one-call]] |
| [[req-oversized-results-remain-recoverable-through-the-lane]] | ! — one measures payload size, the other measures wall-clock latency; different axes | [[req-call-answers-in-one-second]] |
| [[req-oversized-results-remain-recoverable-through-the-lane]] | ! — one is the lane's own payload bound, the other a person's render latency at the mirror; different boundaries | [[req-surface-answers-in-one-second]] |
| [[req-oversized-results-remain-recoverable-through-the-lane]] | ! — one bounds payload size, the other signals that a slow operation is still running; different failure modes | [[req-work-past-its-bound-says-it-is-working]] |
| [[req-resume-needs-no-person]] | ! — one is what the panel shows a returning person, the other what any lane answer may weigh | [[req-the-answer-never-exceeds-its-bound]] |
| [[req-stop-hook-yields-only-at-a-machine-stop]] | ! — one is a test-authoring discipline, the other prevents a premature session end; different artifacts | [[req-a-resolution-is-proven-by-read-back]] |
| [[req-stop-hook-yields-only-at-a-machine-stop]] | ! — one covers every rule-violating call, the other only a stop event while work remains executable; different tri | [[req-a-wrong-act-never-passes-silently]] |
| [[req-supported-harness-serves-one-lane-contract]] | ! — one is zero binary files under the product root, the other is fitting served payloads to a harness's measured  | [[req-every-artifact-is-readable-text]] |
| [[req-the-lane-runs-without-a-console]] | ! — one is the process surviving stdin close and port conflict, the other is listing/entering work offline; differ | [[req-work-starts-without-a-reachable-remote]] |
| [[req-work-past-its-bound-says-it-is-working]] | ! — one measures what happens WHEN the bound is exceeded, the other measures the bound itself; they are complement | [[req-call-answers-in-one-second]] |
| [[req-work-past-its-bound-says-it-is-working]] | ! — the same complement at the other boundary: a signal during slowness against a render latency | [[req-surface-answers-in-one-second]] |
| [[req-work-past-its-bound-says-it-is-working]] | ! — one is a signal emitted during a long wait, the other is how many calls a jump costs; different quantities ent | [[req-a-clear-jump-is-one-call]] |

## comparisons

| a | verdict | b |
| --- | --- | --- |
| [[req-a-slowness-signal-never-shortens-the-wait]] | > — a signal that steals from the wait it is reporting makes the product slower for saying so; notes going out of  | [[req-open-notes-stay-visible]] |
| [[req-a-windowed-pool-answer-says-that-it-was-windowed]] | > — a silently truncated answer is read as complete; a container that does not offer its records is a missing affo | [[req-container-offers-its-records]] |
| [[req-a-wrong-act-never-passes-silently]] | > — it heads the standing chain and is graded corrosive; this row is fatal and makes every other guarantee checkab | [[req-call-answers-in-one-second]] |
| [[req-a-wrong-act-never-passes-silently]] | > — both fatal, but this row makes every guarantee in the system checkable while the other guards one reading scen | [[req-trace-source-never-mixes]] |
| [[req-a-wrong-act-never-passes-silently]] | > — fatal outranks crippling on the damage scale | [[req-walk-survives-host-swap]] |
| [[req-acts-carry-role-and-channel]] | > | [[req-repo-search-carries-intent]] |
| [[req-acts-carry-role-and-channel]] | > — both sit above a fresh machine running, and accountability underpins every other guarantee; a lost overlay cos | [[req-overlay-survives-update]] |
| [[req-acts-carry-role-and-channel]] | > | [[req-nothing-a-copy-does-reaches-its-source]] |
| [[req-acts-carry-role-and-channel]] | > — both crippling, but accountability underpins every other guarantee (who authorized what); a broken install is  | [[req-fresh-machine-runs]] |
| [[req-archive-lists-every-closed-record]] | > | [[req-archive-opens-to-a-person-only]] |
| [[req-archive-opens-to-a-person-only]] | > — an archive an agent can rewrite destroys the one record nobody can reconstruct; a small fix opening its own re | [[req-small-fix-joins-open-record]] |
| [[req-audit-answers-from-log]] | > — a retro that drifts from what ran misroutes real work; an unreadable trail only costs reading | [[req-decision-graph-reads-as-branches]] |
| [[req-autonomy-is-categorical]] | = | [[req-nodes-scoped-to-iteration]] |
| [[req-begin-says-own-window]] | > — a person waiting for a hand-off is felt now; palette drift is felt at the next theme change | [[req-colors-are-configuration]] |
| [[req-bless-outputs-ride-the-bless]] | > | [[req-close-leaves-trunk-clean]] |
| [[req-bm25-below-threshold-returns-empty]] | > — noise in a candidate list is paid by every reader of it; a slowness signal that costs time is paid only while  | [[req-a-slowness-signal-never-shortens-the-wait]] |
| [[req-broken-trace-is-a-defect]] | > | [[req-acts-carry-role-and-channel]] |
| [[req-call-answers-in-one-second]] | > | [[req-resume-needs-no-person]] |
| [[req-choosing-none-is-legal]] | > | [[req-problem-recorded-before-options]] |
| [[req-clean-sweep-is-dated]] | > — both are measurement gaps; the method's own agreement is checked more often than a cold read | [[req-newcomer-orients-unaided]] |
| [[req-close-leaves-trunk-clean]] | > | [[req-archive-lists-every-closed-record]] |
| [[req-colors-are-configuration]] | > | [[req-autonomy-is-categorical]] |
| [[req-colors-are-configuration]] | > — the same judgment as the line above it, written directly rather than through the equality, because an equals m | [[req-nodes-scoped-to-iteration]] |
| [[req-comparison-carries-both-sides]] | > | [[req-vendor-page-claim-only]] |
| [[req-container-offers-its-records]] | > — not being offered the records blocks the work; a survey counting closed ones misstates a number the reader can | [[req-survey-counts-only-open-records]] |
| [[req-controls-draw-from-their-spec]] | > — a spec edit that changes nothing beats a slower survey | [[req-selected-node-shows-its-claim]] |
| [[req-decision-graph-reads-as-branches]] | > — abandoned reading like landed misleads on every look; an unlinked run is one lookup | [[req-story-links-its-proving-run]] |
| [[req-desk-greets-walkable]] | > | [[req-reachable-capability-is-traced]] |
| [[req-desk-states-the-folder-rule]] | > — distrusting the folder model is durable; waiting in the wrong window ends when they look | [[req-begin-says-own-window]] |
| [[req-divergence-order-on-record]] | > — undetectable ratification poisons every divergence; one unexamined option poisons one | [[req-single-option-recorded-as-finding]] |
| [[req-drained-note-leaves-count]] | > | [[req-parked-note-re-drains]] |
| [[req-drawn-state-equals-a-row]] | > — a weaker authoring path is structural; a mis-sorted table is one view | [[req-grouping-and-sorting-hold]] |
| [[req-drumroll-arms-deliberately]] | > — accidental full delegation reaches the whole walk; a lost purpose reaches one product | [[req-purpose-recorded-at-begin]] |
| [[req-duplicate-stray-still-captured]] | > — friction at capture loses findings outright; an undated clean sweep loses only the date | [[req-clean-sweep-is-dated]] |
| [[req-engine-port-fallback]] | > | [[req-missing-provider-named]] |
| [[req-engine-port-fallback]] | > — crippling outranks abrasive on the damage scale | [[req-newcomer-leaves-able-to-ask]] |
| [[req-entry-speaks-plainly]] | > | [[req-newcomer-leaves-able-to-ask]] |
| [[req-entry-speaks-plainly]] | > — entry documents nobody can read cost every arrival; a search without its intent costs one reader of the log la | [[req-repo-search-carries-intent]] |
| [[req-extension-replaced-reported]] | > | [[req-engine-port-fallback]] |
| [[req-fallen-condition-named]] | > | [[req-first-green-needs-a-red]] |
| [[req-fallen-condition-named]] | > — a condition that falls without saying so stops the walk with nothing to read; a newcomer who leaves without th | [[req-newcomer-leaves-able-to-ask]] |
| [[req-filter-draws-only-what-serves]] | > | [[req-desk-greets-walkable]] |
| [[req-finding-lands-as-reference]] | > | [[req-finding-names-its-home]] |
| [[req-finding-names-its-home]] | > | [[req-sweep-covers-every-drift-class]] |
| [[req-first-green-needs-a-red]] | > — a suite that can pass without ever having failed proves nothing, and every later green rests on it; an undecla | [[req-unshipped-dependency-refused]] |
| [[req-fresh-machine-runs]] | > | [[req-setup-floor-editor-shell]] |
| [[req-fresh-machine-runs]] | > — crippling outranks abrasive on the damage scale | [[req-newcomer-leaves-able-to-ask]] |
| [[req-fresh-machine-runs]] | > — both touch a newcomer's first hour, and a machine that will not install has no tour to offer. THIS REPLACES AN | [[req-desk-offers-a-tour]] |
| [[req-fresh-product-starts-empty]] | > | [[req-extension-replaced-reported]] |
| [[req-gate-rounds-stay-readable]] | > | [[req-rejection-carries-its-reason]] |
| [[req-gate-shows-the-evidence-form]] | > | [[req-gate-rounds-stay-readable]] |
| [[req-grouping-and-sorting-hold]] | > — a table that looks authoritative and answers wrongly beats a second corrective call | [[req-lane-fixes-what-machines-fix]] |
| [[req-idea-lands-as-note]] | > | [[req-retro-asks-real-use]] |
| [[req-ideation-opens-no-record]] | > | [[req-panel-shows-the-machine]] |
| [[req-instruction-names-its-source]] | > | [[req-fallen-condition-named]] |
| [[req-kickoff-refuses-pending-notes]] | > | [[req-drained-note-leaves-count]] |
| [[req-landing-needs-no-close]] | > — hoarded work is a daily tax; the drumroll is one control on one surface | [[req-drumroll-arms-deliberately]] |
| [[req-lane-fixes-what-machines-fix]] | > — a cost on every write beats a control bar that drifts from its spec | [[req-controls-draw-from-their-spec]] |
| [[req-losers-stay-on-record]] | > | [[req-choosing-none-is-legal]] |
| [[req-method-reuse-is-vendoring]] | > — an undeclared dependency outlives the record; hoarded landings are recoverable by landing | [[req-landing-needs-no-close]] |
| [[req-missing-document-stops-the-walk]] | > | [[req-instruction-names-its-source]] |
| [[req-missing-provider-named]] | > — a silently worked-around gap is never fixed; a back-filled option is at least recoverable by reading | [[req-divergence-order-on-record]] |
| [[req-narration-toll-is-collected]] | > — the person's only view into a delegated walk outranks the drawing's authoring parity | [[req-drawn-state-equals-a-row]] |
| [[req-newcomer-leaves-able-to-ask]] | > | [[req-tour-reads-what-stands]] |
| [[req-newcomer-one-command]] | > — an install path that grows a step is visible the moment it happens; callers disagreeing about the corpus produ | [[req-what-the-corpus-is-has-one-answer]] |
| [[req-newcomer-orients-unaided]] | > — entry documents rotting unnoticed outlasts one install path's step count | [[req-newcomer-one-command]] |
| [[req-nodes-scoped-to-iteration]] | > | [[req-walk-branches-at-waypoint]] |
| [[req-one-note-per-settled-point]] | > — a drowned retro misses findings; a duplicate capture only costs a drain | [[req-duplicate-stray-still-captured]] |
| [[req-only-a-file-with-its-own-door-is-withheld]] | > — a folder that refuses to be read blocks anybody who wants to see what the machine did; a newcomer leaving with | [[req-newcomer-leaves-able-to-ask]] |
| [[req-open-notes-stay-visible]] | > | [[req-kickoff-refuses-pending-notes]] |
| [[req-option-carries-cost-and-shed]] | > | [[req-losers-stay-on-record]] |
| [[req-outbound-query-logged]] | > | [[req-missing-document-stops-the-walk]] |
| [[req-overhaul-opens-without-deliverable]] | > | [[req-overhaul-takes-only-unowned-drift]] |
| [[req-overhaul-takes-only-unowned-drift]] | > | [[req-option-carries-cost-and-shed]] |
| [[req-overlay-drift-reported]] | > | [[req-open-notes-stay-visible]] |
| [[req-overlay-drift-reported]] | > — a silent fallback is the DEFAULT behaviour of any naive implementation, so it bites without anybody choosing i | [[req-the-source-keeps-no-record-of-a-copy]] |
| [[req-overlay-resolution]] | > | [[req-overlay-survives-update]] |
| [[req-overlay-resolution]] | > — a wrong method layer governs every act that follows it, including the ones that write trace; a broken trace ed | [[req-broken-trace-is-a-defect]] |
| [[req-overlay-resolution]] | > — if the wrong method layer is served, every act is governed by the wrong rules including the one that records w | [[req-acts-carry-role-and-channel]] |
| [[req-overlay-survives-update]] | > | [[req-overlay-drift-reported]] |
| [[req-overlay-survives-update]] | > — both crippling, but this recurs on every future update while the install bar is paid once per machine | [[req-fresh-machine-runs]] |
| [[req-panel-shows-the-machine]] | > | [[req-filter-draws-only-what-serves]] |
| [[req-parked-note-re-drains]] | > | [[req-unknown-drain-ref-refused]] |
| [[req-pin-writes-seeded-scaffolds]] | > — a route refusal stops the walk; a guessed retro count only misinforms it | [[req-audit-answers-from-log]] |
| [[req-problem-recorded-before-options]] | > | [[req-ideation-opens-no-record]] |
| [[req-purpose-recorded-at-begin]] | > — a purpose lost to the next session beats a builder having to overlay before trying | [[req-setup-serves-shipped-method]] |
| [[req-query-is-deterministic]] | > — an answer that changes under you cannot be trusted at all; a windowed answer that says so is trustworthy and m | [[req-a-windowed-pool-answer-says-that-it-was-windowed]] |
| [[req-reachable-capability-is-traced]] | > | [[req-entry-speaks-plainly]] |
| [[req-reachable-capability-is-traced]] | > — both crippling, but an untraced capability corrupts the whole register's trustworthiness for every future deci | [[req-fresh-machine-runs]] |
| [[req-recommendation-is-derived]] | > | [[req-nothing-a-copy-does-reaches-its-source]] |
| [[req-record-arrives-prefilled]] | > | [[req-recommendation-is-derived]] |
| [[req-reject-names-the-redo]] | > | [[req-bless-outputs-ride-the-bless]] |
| [[req-rejection-carries-its-reason]] | > | [[req-reject-names-the-redo]] |
| [[req-repo-search-carries-intent]] | > | [[req-outbound-query-logged]] |
| [[req-resume-needs-no-person]] | > | [[req-walk-survives-host-swap]] |
| [[req-retro-asks-real-use]] | > | [[req-comparison-carries-both-sides]] |
| [[req-routing-reasoning-recorded]] | > | [[req-record-arrives-prefilled]] |
| [[req-scaffold-from-template]] | > | [[req-fresh-product-starts-empty]] |
| [[req-scaffold-from-template]] | > — crippling outranks abrasive on the damage scale | [[req-newcomer-leaves-able-to-ask]] |
| [[req-second-product-reuses-install]] | > — a heavy second product is paid by every builder; a dead-ended tour by newcomers only | [[req-tour-ends-at-the-desk]] |
| [[req-selected-node-shows-its-claim]] | > — survey pace is paid every session; a silent method fork is paid once and reconciled | [[req-method-reuse-is-vendoring]] |
| [[req-setup-floor-editor-shell]] | > | [[req-setup-stops-before-partial]] |
| [[req-setup-serves-shipped-method]] | > — not being able to try the engine blocks adoption; a repeated install only slows it | [[req-second-product-reuses-install]] |
| [[req-setup-stops-before-partial]] | > | [[req-scaffold-from-template]] |
| [[req-single-option-recorded-as-finding]] | > — a false decision enters the record; missing narration only hides progress | [[req-narration-toll-is-collected]] |
| [[req-small-fix-joins-open-record]] | > | [[req-routing-reasoning-recorded]] |
| [[req-story-links-its-proving-run]] | > — proof answered from memory is the weaker of the two memory failures | [[req-test-run-carries-its-question]] |
| [[req-surface-answers-in-one-second]] | > — a slow surface is paid on every look; a file served through its own verb instead of directly is paid once, by  | [[req-only-a-file-with-its-own-door-is-withheld]] |
| [[req-survey-counts-only-open-records]] | > — a wrong survey count misroutes planning; a weak match returned instead of nothing costs one disposition | [[req-bm25-below-threshold-returns-empty]] |
| [[req-sweep-covers-every-drift-class]] | > | [[req-overhaul-opens-without-deliverable]] |
| [[req-test-run-carries-its-question]] | > — a run whose question is lost cannot be judged; note fragments can be merged later | [[req-one-note-per-settled-point]] |
| [[req-the-desk-is-usable-soon-after-the-folder-opens]] | > | [[req-surface-answers-in-one-second]] |
| [[req-the-desk-is-usable-soon-after-the-folder-opens]] | > | [[req-only-a-file-with-its-own-door-is-withheld]] |
| [[req-the-product-name-is-one-fact]] | > — a name scattered across files causes a conflict on every update; a query that answers differently twice is cau | [[req-query-is-deterministic]] |
| [[req-the-source-keeps-no-record-of-a-copy]] | > — a registry breaks the promise that made this role vendor rather than contribute; a scattered name costs confli | [[req-the-product-name-is-one-fact]] |
| [[req-tour-admits-absence]] | > — an invented record teaches a falsehood; a missing highlight only costs the pointing | [[req-tour-outlives-a-missing-highlight]] |
| [[req-tour-admits-absence]] | > | [[req-desk-offers-a-tour]] |
| [[req-tour-ends-at-the-desk]] | > — a tour that never connects to an ask wastes the whole tour; a missing highlight wastes one stop | [[req-tour-highlights-the-named-part]] |
| [[req-tour-highlights-the-named-part]] | > — a newcomer who cannot map words to parts learns nothing; a placeholder gap is a known refusal | [[req-pin-writes-seeded-scaffolds]] |
| [[req-tour-outlives-a-missing-highlight]] | > — a tour that dies on one part beats a tour nobody is offered | [[req-desk-offers-a-tour]] |
| [[req-tour-reads-what-stands]] | > | [[req-tour-shows-live-instances]] |
| [[req-tour-shows-live-instances]] | > | [[req-tour-speaks-plainly]] |
| [[req-tour-speaks-plainly]] | > | [[req-tour-admits-absence]] |
| [[req-trace-source-never-mixes]] | > | [[req-broken-trace-is-a-defect]] |
| [[req-trace-source-never-mixes]] | > — mixing trace sources corrupts the record itself and nothing downstream can detect it; a wrong overlay layer se | [[req-overlay-resolution]] |
| [[req-trace-view-derived-from-files]] | > | [[req-upward-links-live-in-the-file]] |
| [[req-unknown-drain-ref-refused]] | > | [[req-idea-lands-as-note]] |
| [[req-unshipped-dependency-refused]] | > | [[req-walk-opens-at-retro]] |
| [[req-unshipped-dependency-refused]] | > | [[req-force-release-recorded]] |
| [[req-upward-links-live-in-the-file]] | > | [[req-trace-source-never-mixes]] |
| [[req-vendor-page-claim-only]] | > | [[req-finding-lands-as-reference]] |
| [[req-walk-branches-at-waypoint]] | > | [[req-pin-writes-seeded-scaffolds]] |
| [[req-walk-branches-at-waypoint]] | > — a walk that branches where it should not corrupts the record it is writing; a fresh machine failing to run is  | [[req-fresh-machine-runs]] |
| [[req-walk-opens-at-retro]] | > | [[req-gate-shows-the-evidence-form]] |
| [[req-walk-survives-host-swap]] | > | [[req-trace-view-derived-from-files]] |
| [[req-what-the-corpus-is-has-one-answer]] | > — a wrong answer is worse than a slow start, because the person can see the slow start | [[req-the-desk-is-usable-soon-after-the-folder-opens]] |
| [[req-what-the-corpus-is-has-one-answer]] | > | [[req-only-a-file-with-its-own-door-is-withheld]] |

## follow_up

- THE ADDED AXIS IS req-a-machine-decision-repeats and the reason it was needed is worth carrying to the design gate. Against the standing fourteen A RUNTIME ROUTER WINS: it fits each item better, costs less, and breaks none of them. The criterion set as it stood could not express why the chosen design is chosen, so a Pugh round run on it would have scored the option the owner already rejected. A comparison that cannot score the reason for the decision is not a comparison.

- ITS WEIGHT COMES FROM SIX JUDGMENTS AND EIGHT DELIBERATE ABSTENTIONS. It ranks below losing work, below a wrong act passing silently, and below every call being logged — that last one because it is the substrate this axis stands on. It ranks above one-second answers, above the newcomer's one command, and above the size bound. The other eight measure things this change does not press on, and a guessed comparison would move a weight that arithmetic then presents as measured.

- IT DELIBERATELY DOES NOT MEASURE CORRECTNESS. A design that reliably returns the same wrong driver scores full marks here. That is the separation working: a criterion that smuggles correctness into repeatability measures two things and is worth neither.

- NOTHING WAS RE-JUDGED AMONG THE STANDING FOURTEEN. They were read rather than re-derived, which is what the note asks, and none of them measures something this change makes stale.

- RE-EARNED AFTER THE M3 REPAIRS. The register gained a tenth requirement — req-a-weaker-driver-than-named-owes-a-recorded-reason — and it is NOT a criterion axis: it is a functional demand about what the record carries, not a dimension candidates are scored on. The axis set is unchanged at fifteen.

- THE ADDED AXIS ITSELF SURVIVED THE PASS UNTOUCHED. req-a-machine-decision-repeats was not among the twelve findings, and the argument for it is unaffected: against the standing fourteen a runtime router still wins on every axis, so the set could not express why the chosen design is chosen.

## anything_else

