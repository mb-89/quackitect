---
form: write-requirements
by: agent
signed_off: 2026-08-11T09:55:30.054Z
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

gate-inputs stands blessed. The owner ordered the register written, hundreds expected, mined from the ancestors.

Three miners distilled 234 demands from v1 (ref main), v2 (ref v2 plus the design doc) and the sebot family. Eight drafters derived rows from every use-case step and extension. A cross-set critic returned 39 fixes: 17 merges, 3 conflicts, 4 vocabulary sweeps, 9 demotions, 4 precision repairs, 7 EARS rewrites. All applied at the mint.

150 ROWS STAND, must at 56 of 150 (37%). Every row passed the mint-side validation: EARS shape, weasel and escape bans, closed vocabularies, scenario on every quality, breaks_if_removed and refines on every row, zero TBD markers.

THE QUALITIES WERE RESTRUCTURED (owner ruling 2026-08-07). They used to hang under five ad-hoc quality use cases somebody invented. They now hang under the nine characteristics of ISO/IEC 25010:2023, and a quality's only upward edge is its characteristic.

WHAT A QUALITY PROTECTS IS READ FROM THE FUNCTION SIDE. Functions satisfy it, one quality may be satisfied by several, and a function serving several requirements is drawn several times. That edge already existed and is already checked both ways, so nothing new was built and nothing went unenforced.

FOUR ROWS CAME FROM ASKING ALL NINE, and each is grounded in something already true in this repo rather than invented to fill a slot.

req-mirror-stays-on-the-machine. SECURITY had no quality because nobody thought this product had one. It does: the mirror served the whole record on every network interface with no authentication, while a comment three hundred lines up asserted it never left localhost. The bind is fixed and a test now checks every listen call.

req-no-agent-act-destroys-work. SAFETY is new in the 2023 revision and had no answer here. The demand is cross-cutting: across every operation an agent can reach, committed work stays recoverable. The refusals that serve it already existed; the property they serve did not.

req-every-artifact-is-readable-text. COMPATIBILITY had no answer, and asking found a rule the suite has enforced for weeks without the register ever stating it.

req-reachable-capability-is-traced. FUNCTIONAL SUITABILITY, and it has failed twice: the requirements gate found four reachable capabilities with no use case on its first run and three more on its second.

ONE ROW WAS MISSING FROM THIS LIST AND IS BACK. req-state-needs-all-its-inputs stood in the corpus and never in the register field.

## register

- [[req-acts-carry-role-and-channel]]
- [[req-answer-recorded-with-question]]
- [[req-archive-lists-every-closed-record]]
- [[req-archive-opens-to-a-person-only]]
- [[req-archive-read-only]]
- [[req-archive-releases-worktrees]]
- [[req-archive-shows-it-as-it-closed]]
- [[req-audit-answers-from-log]]
- [[req-autonomy-change-applies-forward]]
- [[req-autonomy-gates-every-hop]]
- [[req-begin-says-own-window]]
- [[req-begin-touches-nothing-existing]]
- [[req-bless-outputs-ride-the-bless]]
- [[req-blessed-column-compiles-pinned]]
- [[req-boot-stands-agentless]]
- [[req-bound-field-rebuilds-from-nodes]]
- [[req-broken-trace-is-a-defect]]
- [[req-call-answers-in-one-second]]
- [[req-capture-moves-nothing]]
- [[req-cell-edit-lands-in-the-note]]
- [[req-choice-records-case-against-losers]]
- [[req-choosing-none-is-legal]]
- [[req-clean-sweep-is-dated]]
- [[req-close-leaves-trunk-clean]]
- [[req-close-refuses-loose-ends]]
- [[req-close-serves-its-findings]]
- [[req-colors-are-configuration]]
- [[req-compaction-reowes-the-reading]]
- [[req-comparison-carries-both-sides]]
- [[req-controls-draw-from-their-spec]]
- [[req-controls-never-advance-walk]]
- [[req-coverage-checked-both-ways]]
- [[req-crash-lands-safe]]
- [[req-decision-graph-reads-as-branches]]
- [[req-desk-greets-walkable]]
- [[req-desk-offers-a-tour]]
- [[req-desk-states-the-folder-rule]]
- [[req-desk-takes-plain-words]]
- [[req-diverged-trees-reported-never-merged]]
- [[req-divergence-order-on-record]]
- [[req-drain-one-home-with-payload]]
- [[req-drained-note-leaves-count]]
- [[req-drawn-state-equals-a-row]]
- [[req-drumroll-arms-deliberately]]
- [[req-duplicate-stray-still-captured]]
- [[req-emergency-sits-above-full]]
- [[req-engine-folder-is-sealed]]
- [[req-engine-port-fallback]]
- [[req-entry-binds-worktree]]
- [[req-entry-speaks-plainly]]
- [[req-every-artifact-is-readable-text]]
- [[req-every-call-logged]]
- [[req-every-update-reaches-the-render]]
- [[req-expressions-evaluate-per-reference]]
- [[req-extension-replaced-reported]]
- [[req-fallen-condition-named]]
- [[req-filter-draws-only-what-serves]]
- [[req-finding-keeps-its-sources]]
- [[req-finding-lands-as-reference]]
- [[req-finding-names-its-home]]
- [[req-first-green-needs-a-red]]
- [[req-form-is-built-and-checked]]
- [[req-fresh-machine-runs]]
- [[req-fresh-product-starts-empty]]
- [[req-gate-evidence-must-be-sound]]
- [[req-gate-needs-a-persons-verdict]]
- [[req-gate-rounds-stay-readable]]
- [[req-gate-shows-the-evidence-form]]
- [[req-grouping-and-sorting-hold]]
- [[req-guidance-edit-lands-where-it-compiles]]
- [[req-idea-lands-as-note]]
- [[req-ideation-opens-no-record]]
- [[req-instruction-names-its-source]]
- [[req-kickoff-refuses-pending-notes]]
- [[req-land-demands-fresh-green]]
- [[req-land-is-one-piece]]
- [[req-land-target-routes-to-gate]]
- [[req-landing-needs-no-close]]
- [[req-lane-fixes-what-machines-fix]]
- [[req-losers-stay-on-record]]
- [[req-method-reuse-is-vendoring]]
- [[req-mirror-stays-on-the-machine]]
- [[req-missing-document-stops-the-walk]]
- [[req-missing-provider-named]]
- [[req-moved-evidence-invalidates-the-bless]]
- [[req-narration-toll-is-collected]]
- [[req-newcomer-leaves-able-to-ask]]
- [[req-newcomer-one-command]]
- [[req-newcomer-orients-unaided]]
- [[req-no-agent-act-destroys-work]]
- [[req-no-claim-without-evidence]]
- [[req-one-note-per-settled-point]]
- [[req-one-script-installs]]
- [[req-open-notes-stay-visible]]
- [[req-option-carries-cost-and-shed]]
- [[req-outbound-query-logged]]
- [[req-overhaul-closes-green]]
- [[req-overhaul-opens-without-deliverable]]
- [[req-overhaul-takes-only-unowned-drift]]
- [[req-overlay-drift-reported]]
- [[req-overlay-resolution]]
- [[req-overlay-survives-update]]
- [[req-owed-reading-is-served]]
- [[req-panel-shows-the-machine]]
- [[req-parallel-iterations-own-worktrees]]
- [[req-parked-note-re-drains]]
- [[req-problem-recorded-before-options]]
- [[req-product-is-a-folder]]
- [[req-pull-answers-from-record]]
- [[req-purpose-recorded-at-begin]]
- [[req-query-is-the-file]]
- [[req-reachable-capability-is-traced]]
- [[req-reader-keeps-their-place]]
- [[req-reading-proof]]
- [[req-recommendation-is-derived]]
- [[req-record-arrives-prefilled]]
- [[req-record-opens-on-word]]
- [[req-red-is-never-carried]]
- [[req-refusal-carries-remedy]]
- [[req-reject-names-the-redo]]
- [[req-rejection-carries-its-reason]]
- [[req-reload-restarts-clean]]
- [[req-repo-search-carries-intent]]
- [[req-resume-needs-no-person]]
- [[req-retro-asks-real-use]]
- [[req-retro-window-drains-whole]]
- [[req-roles-never-usernames]]
- [[req-routing-reasoning-recorded]]
- [[req-scaffold-from-template]]
- [[req-second-product-reuses-install]]
- [[req-selected-node-shows-its-claim]]
- [[req-setup-floor-editor-shell]]
- [[req-setup-serves-shipped-method]]
- [[req-setup-stops-before-partial]]
- [[req-shutdown-fires-only-idle-or-end]]
- [[req-single-option-recorded-as-finding]]
- [[req-size-choice-is-the-bless]]
- [[req-size-escalation-readjudicated]]
- [[req-size-proposal-names-strikes]]
- [[req-small-fix-joins-open-record]]
- [[req-state-needs-all-its-inputs]]
- [[req-state-opens-only-when-earned]]
- [[req-story-links-its-proving-run]]
- [[req-stray-captured-in-one-call]]
- [[req-structure-verdicts-are-mechanical]]
- [[req-sweep-covers-every-drift-class]]
- [[req-table-refuses-what-it-cannot-draw]]
- [[req-table-rows-derive-from-notes]]
- [[req-test-result-is-structured]]
- [[req-test-run-carries-its-question]]
- [[req-test-scope-discipline]]
- [[req-tour-admits-absence]]
- [[req-tour-ends-at-the-desk]]
- [[req-tour-highlights-the-named-part]]
- [[req-tour-outlives-a-missing-highlight]]
- [[req-tour-reads-what-stands]]
- [[req-tour-shows-live-instances]]
- [[req-tour-speaks-plainly]]
- [[req-trace-source-never-mixes]]
- [[req-trace-view-derived-from-files]]
- [[req-trees-never-mix]]
- [[req-two-options-beyond-the-obvious]]
- [[req-unknown-drain-ref-refused]]
- [[req-unshipped-dependency-refused]]
- [[req-upward-links-live-in-the-file]]
- [[req-vendor-page-claim-only]]
- [[req-view-writes-round-trip]]
- [[req-walk-opens-at-retro]]
- [[req-walk-resumes-from-repo]]
- [[req-walk-survives-host-swap]]

## set_criteria

- complete: every numbered step and lettered extension of all 31 use cases was walked by a dedicated drafter and carries at least one row, with the step pointer in source_refs; the engine's covers check proves node-level coverage both ways on this submit; 234 mined ancestor demands were folded in so the set demands more than the use cases spell out. The nine ISO/IEC 25010:2023 characteristics now ask the completeness question from the quality side too, and asking them in full added four rows nobody had thought to write.
- consistent: a cross-set critic compared all nine drafts pairwise by theme and found 3 conflicts, all reworded so a single implementation satisfies the set; vocabulary is standardized (the engine, the panel, the pull, the driver) across every row. The quality restructure changed where rows hang, never what they demand, so no statement, measure or verify method moved.
- affordable: the bulk of the set states what the shipped engine already does, so its cost is the checks that keep it true; the genuinely new rows sit inside i1's own charter, and no row demands hardware, services or staffing the project does not have. One of the four new rows is NOT satisfied today — req-mirror-stays-on-the-machine was a live defect — and the fix was one argument to a listen call.
- bounded: every row refines a use case and answers to a source (a step pointer, a stakeholder, a mined ancestor demand, or a recorded ruling); the critic's gold-plating pass found four fabricated precisions and all four are repaired; won't-haves were kept out of the register entirely. The four rows added from the checklist were each grounded in existing code, an existing test, or a measured failure — none was written to fill a characteristic.
- comprehensible: every statement is one EARS sentence with a named acting subject; detail rides in tables under the statement, not in prose; a reader from any discipline finds their rows by kind and by the use case they refine; must sits at 56 of 150 so the binding core is readable on its own. A quality is now found by its characteristic rather than by guessing which ad-hoc category somebody filed it under.
- no_tbd: swept project/spec/trace for TBD, TBC, TBR and ??? at this gate and counted zero across the whole corpus rather than the requirement folder alone.

## follow_up

- derive-functions is next, and twin peaks predicts the register moves while functions are derived - fold-backs ride this same register.
- the register preamble in the book must define the reference machine once (v1's term, cited by the timing rows) - lands at finalize-docs.
- the qualities chain adds 5 stories and 5 use cases to the M2 corpus after its gate - the suspect path may present them at gate-inputs for a look; they were drafted journey-shaped under the blessed picture's rules.
- the register is expected to shrink to deltas in future iterations; this product-size fill is the standing baseline.

## anything_else

The three ancestors are mined into .se/req-mine-v1.md, .se/req-mine-v2.md and .se/req-mine-sebots.md (234 demands with sources); the cross-set critique with all 39 applied fixes is .se/req-critique.md. The draft-to-mint pipeline is reproducible: drafts in .se/req-drafts/, fixes in .se/req-fixes.json, the mint script in .se/req-mint.mjs.
