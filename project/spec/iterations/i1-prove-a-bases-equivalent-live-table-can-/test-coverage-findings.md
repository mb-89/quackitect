---
id: test-coverage-findings
statement: What the verified_by mapping found on 2026-08-10 — the untested requirements, the orphan tests, and which orphans point at missing requirements.
---

# Test coverage findings — 2026-08-10 overnight

## TLDR

- 53 of 102 test-method requirements now carry `verified_by`. 20 stood from the day; 33 were mapped tonight, each against the read test code.
- 49 test-method requirements have NO existing test. The author-tests submit refuses until they are resolved. The full list is below.
- The battery holds 1,113 current test cases. The mapping claims 63 of them. Roughly 1,050 cases stand orphan at case grain.
- The biggest orphan clusters are MISSING REQUIREMENTS, not junk tests. The live table — this iteration's own goal — has 245 test cases and zero requirement nodes behind them.
- Nothing was deleted, per the ruling. Orphanhood is information tonight, never a verdict.

## The 49 untested requirements

Each has verify_method test and no honest test to name. Grouped by what they need.

### The product-lifecycle features nobody built tests for

- req-begin-touches-nothing-existing
- req-fresh-product-starts-empty
- req-scaffold-from-template
- req-method-reuse-is-vendoring
- req-product-is-a-folder
- req-setup-floor-editor-shell
- req-setup-stops-before-partial
- req-extension-replaced-reported
- req-engine-port-fallback
- req-engine-folder-is-sealed

### The overlay family (vendored-engine seam, nothing built yet)

- req-overlay-drift-reported
- req-overlay-resolution
- req-overlay-survives-update
- req-trees-never-mix
- req-diverged-trees-reported-never-merged
- req-guidance-edit-lands-where-it-compiles (the write-routing half; the compile-live half is tested)

### The archive and close tail

- req-archive-read-only
- req-archive-releases-worktrees
- req-landing-needs-no-close
- req-land-demands-fresh-green
- req-land-target-routes-to-gate
- req-reject-names-the-redo

### The desk and ideation judgments

- req-idea-lands-as-note
- req-ideation-opens-no-record
- req-problem-recorded-before-options
- req-record-opens-on-word
- req-choice-records-case-against-losers
- req-choosing-none-is-legal
- req-single-option-recorded-as-finding
- req-option-carries-cost-and-shed
- req-duplicate-stray-still-captured
- req-unshipped-dependency-refused

### The overhaul and sweep family (machine not built)

- req-overhaul-closes-green
- req-overhaul-takes-only-unowned-drift
- req-sweep-covers-every-drift-class
- req-clean-sweep-is-dated

### The tour (no tour tests exist at all)

- req-tour-admits-absence
- req-tour-outlives-a-missing-highlight

### The observability and discipline tail

- req-acts-carry-role-and-channel
- req-repo-search-carries-intent
- req-instruction-names-its-source
- req-call-answers-in-one-second — measured FALLING today by exp-latency-ledger; a test would be red
- req-first-green-needs-a-red
- req-red-is-never-carried
- req-crash-lands-safe
- req-mirror-stays-on-the-machine
- req-fallen-condition-named — its old suspect-claim test was superseded by the reopen redesign, and nothing replaced it
- req-kickoff-refuses-pending-notes
- req-size-proposal-names-strikes

## The orphan tests, by cluster

Cases nobody claims, grouped by what they verify. The counts are current-era distinct cases.

### The live table — 245 cases, 0 claimed, and the requirements are MISSING

- [tests/bases.test.ts](../../deliverable/tests/bases.test.ts) — 54 cases: the base file written through controls, round-tripping verbatim.
- [tests/baseui.test.ts](../../deliverable/tests/baseui.test.ts) — 28 cases: the table card's controls and their honesty rules.
- [tests/expr.test.ts](../../deliverable/tests/expr.test.ts) — 104 cases: the expression language, function by function.
- [tests/tables.test.ts](../../deliverable/tests/tables.test.ts) — 35 cases: rows from notes, cell edits landing in notes, pivots.
- [tests/grouping.test.ts](../../deliverable/tests/grouping.test.ts) — 22 cases: sort and group semantics.
- [tests/vault-sync.test.ts](../../deliverable/tests/vault-sync.test.ts) — 2 cases: the warm model.

THIS IS THE ITERATION'S OWN GOAL, and the reverse-engineering of the spec never wrote its requirements. The tests exist because the work was done test-first; the register never caught up. The missing family, roughly: the query lives in the base file verbatim; every control write survives a round-trip; the expression subset and its refusals; group and sort semantics; a cell edit lands in the note and nowhere else; unknown layouts and operators refuse by name.

### The autonomy control surface — 53 cases, 0 claimed, owner-ruled behavior with no register rows

- [tests/emergency.test.ts](../../deliverable/tests/emergency.test.ts) — 15 cases: arming, survival across reload, revocation by the dial.
- [tests/power.test.ts](../../deliverable/tests/power.test.ts) — 19 cases: shutdown-at-idle, the five-minute window, the toggles.
- [tests/drumroll.test.ts](../../deliverable/tests/drumroll.test.ts) — 7 cases: five presses arm from a locked rung.
- [tests/params.test.ts](../../deliverable/tests/params.test.ts) — 9 cases: the control bar drawn from its spec.
- [tests/scale.test.ts](../../deliverable/tests/scale.test.ts) — 3 cases: the notches.

Implied missing requirements: emergency mode is above full delegation, survives the reload it was granted through, and a lowered dial revokes it; the machine shuts down only at idle after a named window; the control bar is drawn from data.

### The method machinery of M4–M6 — about 120 cases, nearly 0 claimed

morphbox, pareto, pugh, compare, dsm, elematrix, atamwalk, binding, catalogs, drawnsub, flowclosure, suspect, outward. Built these last days, test-first, with no requirement rows behind the features (the compare walk's cost bound, the exposure chart, the fold-back table, flow closure, the DSM clustering).

Implied: either a method-machine value prop with its own story and requirement family, or these stay engine-internal and their tests map to the broader machine requirements once those exist.

### The engine's own laws — the long tail, mostly fine

frontmatter, stamp, files (35 unclaimed), reads, editsafety (12 unclaimed), tokens, ticks, rounds, sizes, rigor-matrix, rowreads, routereads, scripts, preflight, help, refusals, remedies, palette, testlint, lintfix, logquery, lifetime, mcp-http, gitgraph, narration, nesting, feed, mirror-contract (31), panel, elements, sizing, cards, boot, stophook, verdictlog, roots, search, multiread, patchguard, discipline (40 unclaimed).

Most of these verify MECHANISMS serving requirements that are already mapped through one or two representative cases. The one-test-per-requirement law is satisfied without claiming every case; the reverse sweep stays warn-first for exactly this reason. A smaller part (help completeness, the floor, the rounds) implies genuine method requirements nobody wrote.

## What this says about "too many tests"

- Very few tests look deletable. The clusters are dense because the work was built test-first.
- The orphan count is dominated by MISSING REQUIREMENTS (the live table, the autonomy surface, the method machinery) and by GRAIN (many cases per mechanism, one requirement per mechanism).
- The honest next moves, in order: write the live-table requirement family (it is this iteration's own deliverable), decide the autonomy-surface and method-machine families, and only then judge the remainder as too many.

## Method note

Every address written tonight was verified by reading the test code first. Two stale names were caught that the timing log alone would have written dangling: the reopen test was renamed when the reopen redesign landed, and the old suspect-claim test no longer exists.
