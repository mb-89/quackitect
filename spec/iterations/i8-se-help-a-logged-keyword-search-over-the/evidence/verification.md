---
form: verification
by: agent
signed_off: 2026-08-13T09:44:29.726Z
authors: agent
files: null
---

# Evidence form / verification

## current_situation

M7 verification for i8. The claims checklist previously stalled because 3 of 8 whole-product specs needed eyes only the owner has, and the engine had no honest way to record that short of a fabricated tick.

This round built the owed checkbox (engine/stateform.ts, committed 1db5189) so a checklist item can point at an open raid entry instead of a tick. A fresh-eyes tester subagent verified 7 of 8 specs independently; this session handled the 8th (tsp-panel-walkthrough) directly, since it needed the new mechanism and the owner's own prior ruling on how to treat it.

The tester found, and this session fixed, one real defect: tsp-autonomy-tiers' categorical-tiers cutover had left "the slider" naming the live control in 4 binding guidance files (committed 6c231b5).

## claims

- [x] tsp-autonomy-tiers
- [x] tsp-derivation-analysis
- [owed] tsp-desk-and-gates — raid-issue-must-demos-owed
- [owed] tsp-first-run — raid-issue-must-demos-owed
- [owed] tsp-panel-walkthrough — raid-issue-must-demos-owed
- [x] tsp-prose-inspection
- [x] tsp-record-inspection
- [owed] tsp-tour-run — raid-issue-must-demos-owed

## follow_up

- Extend raid-issue-must-demos-owed's wording to name all 4 owed specs here (note-31d447ff93bd) — needs a write-capable state bound to i8; not reachable from verification itself.
- tsp-desk-and-gates and tsp-tour-run need an actual observed live session to move past owed. No amount of file-reading substitutes for that.
- tsp-prose-inspection and tsp-record-inspection were checked with named gaps — several sub-requirements sampled and held, several not yet sampled. A fuller pass is fair game later; nothing sampled contradicted the claim.
- Carry i8 on to whatever M7 asks next.

## anything_else

### M7 verification — 2026-08-13, agent pass

Fresh-eyes discipline: a tester subagent (fresh context, se_file_read/search/glob only) verified 7 of 8 specs independently. tsp-panel-walkthrough was checked directly by this session, since its owed treatment needed the owed-checkbox mechanism built earlier in this same M7 pass.

### tsp-autonomy-tiers — checked

The tester found a real defect: the categorical-tiers cutover left 4 files naming the live control "the slider" in binding, agent-read guidance — meth-gate-review.md:52, conditions/read.md:48, states/idle.md:6, ideation.canvas:7. Fixed this round (commit 6c231b5). A fresh sweep of machines/ and guidance/ for "slider" now returns only the anti-slider rule itself and one past-tense historical reference, both exempt by the spec's own checklist line.

The rendered control was independently confirmed non-numeric: engine/params.ts:116-119 renderRungs emits one button per rung plus a hidden wire carrier (input id="thr" type="hidden") — matching the spec's own sanctioned exemption.

### tsp-derivation-analysis — checked

Dated argument, this round.

View derivation (req-trace-view-derived-from-files): the four named view families are code-confirmed as computed, not stored.
- The machine: engine/session.ts reads the .canvas/state-note files fresh on every pull (software.md: "the truth is read live").
- The trace graph and the registers: engine/trace.ts loadTrace() reads project/spec/trace/**/*.md fresh, cache-keyed to a content stamp, never to size or mtime.
- The tables (criteria, DSM, scenario decks): stored directly in the evidence markdown that is the record — no second copy to drift.
Standing guard: tests/files.test.ts's direct-read ratchet (may fall, never rise) keeps new code from reaching around the derived views to a cached copy.

Capability coverage (req-reachable-capability-is-traced): the measure is explicitly "walked against the live offer AT EACH design-input gate", not a one-time global sweep. i8's own gate-requirements.md round_1_validate recorded this iteration's walk: "missing: none against uc-find-the-right-lane-tool — steps 1-4 and extensions 2a/4a all trace to a requirement." tests/trace-coverage.test.ts is the standing mechanical guard for the layer below capabilities (value-prop/story/use-case/requirement, both directions) — green this session.

Not independently re-walked this round: the full historical live-offer enumeration predating i8. The per-gate measure does not ask for that; a whole-corpus re-audit is a separate, larger undertaking.

### tsp-prose-inspection — checked, with named gaps

Directly sampled: req-desk-offers-a-tour (front-desk.md's fixed greeting names the tour first), req-entry-speaks-plainly (brand/README.entry.md and the root README carry no bare method jargon), req-roles-never-usernames (tests/stamp.test.ts:39-58 — by: takes only fixed role values), req-no-claim-without-evidence and req-vendor-page-claim-only (a real instance of the honest-citation practice at meth-build-strategies.md:75 — "primary not seen"), req-upward-links-live-in-the-file (confirmed extensively and directly this session).

Not sampled this pass: req-tour-speaks-plainly, req-comparison-carries-both-sides, req-one-note-per-settled-point. Nothing sampled contradicted the claim; the scope note on this spec says these items retire into a lint as one grows teeth.

### tsp-record-inspection — checked, with named gaps

Directly sampled: req-record-arrives-prefilled (render.ts:1962-1965, the prefill law), req-finding-keeps-its-sources (the same meth-build-strategies.md:75 citation), req-story-links-its-proving-run (tsp-panel-walkthrough.md and tsp-first-run.md both carry demonstrates: links to their sty- ids), req-upward-links-live-in-the-file (as above), req-test-run-carries-its-question (every se_test call this session named files/name_pattern and its scoped verdict logged itself), req-losers-stay-on-record (the rank-cut editor writes a bare [moved] rather than dropping an unreasoned move).

Not sampled this pass: req-purpose-recorded-at-begin, req-recommendation-is-derived, req-routing-reasoning-recorded, req-divergence-order-on-record, req-finding-lands-as-reference, req-finding-names-its-home. Nothing sampled contradicted the claim.

### The 4 owed items

tsp-panel-walkthrough, tsp-first-run, tsp-desk-and-gates and tsp-tour-run are owed against raid-issue-must-demos-owed. Two are population/eyes-on claims the entry already exists for; two (desk-and-gates, tour-run) are demonstration-method specs that genuinely need an observed live run — no amount of reading the source substitutes for that, per meth-verification-discipline.md: "a plausible argument that it would pass is worth nothing." See note-31d447ff93bd for the full breakdown.
