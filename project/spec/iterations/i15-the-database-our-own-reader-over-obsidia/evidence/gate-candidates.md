---
form: gate-candidates
bless: blessed by agent
by: agent
signed_off: 2026-08-19T17:38:20.447Z
authors: agent
files: null
---

# Evidence form / gate-candidates

## current_situation

evaluate-set closed. Front of two: cand-explicit-and-safe, cand-fast-path-plus-blocking. Three candidates eliminated with reasons. This gate blesses the front, never a winner.

## reasons_hold

YES. Every one of the 96 cut axes carries "identical by construction," checkable directly against the candidate records: all five state in their own How it works section that "the unchanged baseline... stays exactly as it is" outside cluster-the-query/cluster-the-disposition. No row was moved out of rank order. The front is size 2, a genuine crossing trade (cand-fast-path-plus-blocking wins on speed/scale axes, cand-explicit-and-safe wins on correctness axes), confirmed by the engine's own arithmetic matching my hand check before submission.

## round_0_verify

- evidence vs claims: scores land verbatim from a spawned, clean-context subagent; the front, eliminations, utopia, nadir and flat axis are all engine-computed from the score table, not typed
- types: all 35 score cells (5 candidates × 7 axes) are integers 0-5, every 4/5 score names a prior_art comparison per the anchor rule
- lint: no TBD/TBC/"???" markers in cuts, scores, or reading
- tests: not applicable at this M4 gate; feasibility_checked already ran at run-candidates per the gate's own note

## round_1_validate

- exercised against the goal: the front answers "which architectures for the-query/the-disposition survive an independent scoring pass" — yes, two do, on genuinely different tradeoffs
- missing: req-broken-trace-is-a-defect scored 0 across all five candidates — a real gap, carried forward as a note pending a write-capable state to mint the RAID entry
- wrong: none found — the cut reasons are checkable, the sort was not gamed, the front is not collapsed to one
- out of scope: the relational-store candidate's second-source-of-truth risk is exactly what req-trace-view-derived-from-files exists to catch, and it did (scored 1/5)
- prior art: three named comparisons anchor the 4/5 scores — Obsidian Bases for the file-derived, no-separate-database shape; none scored 5, so no candidate claimed to beat prior art outright

## round_2_red_team

- composer bias in the cut step => the cut is blind to importance and checkable against the candidates' own explicit "unchanged baseline" text, not a preference judgment, so the conflict-of-interest the spawned-scorer rule guards against does not transfer to cutting the same way it would to scoring
- a criterion nobody's design addressed => req-broken-trace-is-a-defect at 0/5 unanimously is real and carried forward, not waved through as agreement
- an asymmetric write-up inflating an elimination => cand-narrow-grammar-plus-explicit's req-call-answers-in-one-second score (0) may reflect uneven candidate documentation rather than a real gap, since it shares its literal mechanism with cand-continue-v1s-shape's timed probe; flagged in evaluate-set's reading and carried forward as a note, not silently accepted

## raid_additions

- none

## verdict

pass — one viable candidate front (cand-continue-v1s-shape), reasoned through set-based evaluation with no forced early convergence. The cut, sort and threshold acts at cut-criteria are all mechanical and traced; nothing here overrides them. goals_served correctly shows M4 as a candidate-selection milestone, not a build one — no verb exists yet, but the shape it will take is now chosen and evidenced.

## follow_up

M5 inherits: the front of two (cand-explicit-and-safe, cand-fast-path-plus-blocking), the unaccepted narrow-grammar elimination question, and the unanimous req-broken-trace-is-a-defect gap. The next write-capable state should action note-dea35af35e0b: close the stale prior-art-scan RAID entry and mint the two new ones.

## anything_else

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: nothing yet — m5/m7 own the build; m4 chose to continue v1's declarative view-spec shape (cand-continue-v1s-shape) as the sole viable candidate, which the verb will implement.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: nothing yet — still owed at the harvesting sub-step, first state where se_run/se_git are legal; find_prior_art's live search this milestone confirmed no competing plugin beats the chosen shape.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: nothing yet — m5/m6 own it.
- Add conformance fixtures that pin the subset against drift.: nothing yet — m7 (author-tests) owns it.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: nothing yet — m5/m7 own the resolver-default rewrite.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: nothing yet — m4's cluster-the-disposition finder positioned the BM25 sibling against Fellegi-Sunter's match/possible-match/non-match theory (find_prior_art, verified this session); m7 owns the build.
- Mint the interface entries both new lane verbs owe.: nothing yet — owed once the verbs exist.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — no calls against this interface have run since gate-kickoff last signed; M4 states used file/read/write/search/run/web-search tools.
