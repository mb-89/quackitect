---
form: gate-requirements
bless: blessed by agent
reopened: 2026-08-16T17:25:25.575Z — derive-criteria's weighs_with/weighs_against writes to the same requirement files postdate this gate's signed_off timestamp; two se_amend attempts recorded the ripple but did not clear the downstream claim-guard (signed_off itself is untouched by amend), so a fresh bless is needed to update it
amended: 2026-08-16T17:23:05.814Z by agent — derive-criteria added weighs_with/weighs_against frontmatter to the same requirement files this round already verified; re-affirming since the substantive claims (statement, kind, priority, breaks_how_badly) this round checked are untouched
by: agent
signed_off: 2026-08-16T17:25:33.165Z
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

Design input for i15 is complete: 3 use cases (uc-query-the-corpus-by-structure, uc-get-a-trustworthy-answer, uc-dispose-of-a-candidate-coupling), 8 requirements, 6 flows and 3 functions, all read directly and cross-checked against write-requirements' and derive-functions' own claims. probe-assumptions is signed; every standing raid assumption carries a probe result, with the four new i15-specific ones marked scheduled pending the build.

## round_0_verify

- evidence vs claims: verified directly, re-affirmed 2026-08-16 after derive-criteria added weighs_with/weighs_against to the same requirement files (M4 pairwise fields only, not the statement/kind/priority/breaks_how_badly this check covers) — read all 3 use cases, all 8 requirements, all 6 flows and all 3 functions; every claim in write-requirements' and derive-functions' set_criteria/neutrality sections checks out against the actual file content, including the trace edges (refines, satisfies, source_refs) each carries.
- types: not applicable this milestone — no application code exists yet (project/deliverable/engine has no bm25 or query-verb code); every trace file carries its own type's fixed frontmatter fields, confirmed by reading them.
- lint: not run — se_lint is not on this gate's legal_tools list, and se_log_query shows zero se_lint calls this session. Spec frontmatter was checked by eye against each type's known field set instead.
- tests: not run — no code exists yet to test. This gate's own guidance says design input ends here; everything after is solution space.

## round_1_validate

- exercised against the goal: holds. draft-vision's goal_system traces both new verbs to vp-the-ledger (one-click-to-rationale) and vp-rigor-without-toil (capability-gap leaves a trace); every requirement traces to one of the three new use cases, and each use case traces to a resident story (sty-answer-what-does-this-touch, sty-trust-a-repeatable-answer, sty-dispose-a-candidate-coupling).
- missing: scope-non-goals names seven scope pieces. Six trace to a requirement or are process/test infrastructure. The fifth ("FIX raid-debt-delta-default-views", the $-item resolver default change) has no EARS requirement row, unlike the other six. raid-debt-delta-default-views.md carries its own complete Repayment/"CLOSED WHEN" acceptance criterion, owner-rescheduled to this iteration at the 2026-08-15 retro, but it sits outside the requirements register this gate blesses. Scope item 7 ("MINT THE INTERFACE ENTRIES") is confirmed NOT a gap here — element-matrix.md shows interfaces mint from the function/element matrix, which is downstream of the partition-functions state this gate can route to next.
- wrong: none found. No two requirement rows conflict; write-requirements' own consistent/bounded/no_tbd checks hold on inspection of the actual seven new rows.
- out of scope: holds. scope-non-goals' five non-goal lines (dashboard, embeddings, book table-interactivity, mirror-widget UI beyond what's required, the live prior-art scan) all still name a receiving record or say why none exists; nothing in the register reaches past them.
- prior art: NOT a live scan — raid-risk-i15-ships-without-a-live-prior-art-scan stands open because no search tool is legal to any state reached this session. In its place, the operator supplied a field report (2026-08-16, outside the lane, cited per voice rules as the operator's word): Obsidian Bases is now a CORE plugin with view-level filters, and/or nesting, and FORMULAS (computed properties). The harvested v1 subset (25 .base files, confirmed at ref main) may predate formula and view-level-filter support. This gate's own eight requirements name no check for that gap — conformance-fixture coverage of it is scope item 3's job (EXTEND THE PINNED SUBSET) at build time, not this register's.

## round_2_red_team

- STEELMAN: the eight-row register is too thin for a milestone gate-kickoff priced major — no field/kind vocabulary and no concrete BM25 threshold value are named, so build will discover real gaps mid-implementation that a fuller register would have caught here => ANSWERED: by design, not a gap. write-requirements' comprehensible check already states each row names no mechanism — "not the pinned subset, not the ranking formula" — matching map-stakeholders' own instruction that mechanism stays architecture's question. Concrete vocabulary and threshold values are M4+ design-space questions per derive-functions' own neutrality section, not requirements-phase gaps.
- KILL-CRITERION (adr-query-in-engine's own reverse-sensitivity clause): "a needed query beyond the pinned subset re-opens this decision." => LOOKED FOR: not yet triggered, but not yet ruled out either. The 25-file harvest has not been checked field-by-field against current Bases' formulas and view-level filters (the operator's 2026-08-16 report). This is the same gap round_1's prior-art line names — it belongs to the pinned-subset extension work, not this gate, but it is the concrete way the kill-criterion could fire.
- the resolver-default requirement gap (round_1's "missing") => ANSWERED: not fatal to this gate. raid-debt-delta-default-views already carries an owner-rescheduled, fully specified repayment criterion equivalent in rigor to an EARS row; the gap is a format inconsistency (six of seven scope pieces got a formal requirement, one did not), not an unmade decision.
- one raid row (prior-art scan) still open from kickoff, carried through every gate since => ANSWERED: correctly deferred per log-risks' own follow_up — no state in this walk, including this one, has a legal search tool. Deferring is not avoidance; it is routing to the first state that can actually resolve it.

## raid_additions

- project/spec/trace/raid/raid-debt-delta-default-views.md
- project/spec/trace/raid/raid-risk-i15-ships-without-a-live-prior-art-scan.md

## verdict

pass with overrides — Design input is coherent, traced both ways, and free of contradictions or scope creep. Two named overrides ride the pass, both already register entries per meth-gate-review's own rule: (1) the $-item resolver-default scope item has a complete repayment spec in raid-debt-delta-default-views.md but no EARS requirement row — acceptable because the debt entry is itself owner-rescheduled and fully specified, but the next state touching resolvers should promote it to a formal row before build closes on it; (2) the live prior-art scan still has not run, tracked in raid-risk-i15-ships-without-a-live-prior-art-scan.md, unresolvable by any state reached this session for lack of a legal search tool. Neither override blocks moving into solution space; both are named so a later sweep does not have to rediscover them.

## follow_up

Two doors are offered next: derive-criteria (pairwise judgment on the register) and partition-functions (the shared function DSM). Both are legal; the walk should ask which is offered rather than assume, per contract rule 9 on choices offered but not forced.

AMENDED 2026-08-16: derive-criteria wrote weighs_with/weighs_against onto every should-priority requirement's own frontmatter, per that state's own mechanism. This is exactly the pairwise judgment this gate's follow_up named as next, not a change to the register's content this gate reviewed.

Carried forward: raid-debt-delta-default-views (fix the resolver default, this iteration, per its own 2026-08-15 reschedule) and raid-risk-i15-ships-without-a-live-prior-art-scan (needs a state with a legal search tool).

When the resolver-default work is actually built, write a formal EARS requirement for it rather than building straight from the debt entry's Repayment section — named in this gate's verdict as the condition on the override.

## anything_else

