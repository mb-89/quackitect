---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-19T20:54:19.648Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

gate-implementation is blessed and sweep-consistency is signed. run-demos ran the two must stories i15 itself unblocked (sty-answer-what-does-this-touch, sty-dispose-a-candidate-coupling) against the real vault: demo1 found and fixed a real bug (parseBase silently dropped a harvested .base file's own top-level filters), demo2 ran BM25 against 706 real candidate couplings from one real change. Battery is green at rest, 1501/1501. This gate judges whether the delta meets the need.

## meets_need

- vp-a-cheaper-model-does-the-mechanical-work: not touched by this delta — frame-delta's own value_props field named none, and nothing built this iteration measures model cost.
- vp-autonomy-range: not touched by this delta.
- vp-qualities: touched, narrowly. The demos exercised the real system under real load rather than a toy fixture and surfaced a genuine correctness gap (parseBase dropping filters silently) that mechanical checks alone had not caught; it is now fixed and pinned by two regression tests.
- vp-rigor-without-toil: MET. se_query and se_couplings replace hand grep and unstructured judgment with structured, refusing lane verbs — se_couplings forces a disposition per candidate instead of raw retrieval, se_query refuses an unrequested field by name (SE-C-144) instead of silently answering wrong.
- vp-systematic-engineering: MET. se_couplings enforces per-candidate disposition rather than relying on the agent to remember to judge each one; se_query enforces the pinned subset rather than an ad-hoc grammar.
- vp-the-engine: not touched by this delta — this is a lane-tool addition, not a state-machine drawing change.
- vp-the-ledger: not touched by this delta beyond ordinary raid usage already in place (debt amended, not newly served).
- vp-the-unattended-arrival: not touched by this delta.
- vp-vendoring: not touched by this delta.
- vp-what-is-learned-outlives-the-machine: touched, narrowly. The 26 harvested v1 query files and the 5 new conformance fixtures pin what was learned about the Bases subset against future drift, so it survives beyond this session.

## musts_demonstrated

- sty-a-check-binds-without-engine-code: not exercised by this delta.
- sty-a-finding-outlives-the-box-that-found-it: not exercised by this delta.
- sty-a-smaller-model-walks-a-record: not exercised by this delta.
- sty-answer-what-does-this-touch: DEMONSTRATED — real run against the real vault, report on file at spec/iterations/i15-the-database-our-own-reader-over-obsidia/reports/rpt-answer-what-does-this-touch.md; found and fixed a real bug (parseBase dropping harvested filters silently).
- sty-ask-the-lane-what-it-can-do: not exercised by this delta.
- sty-ask-the-package-what-it-is: not exercised by this delta.
- sty-carry-a-finding-without-stopping: exercised once — a harvest-content finding (a harvested view asks for a name column some matching notes do not carry) was parked as note-b20975667464 rather than stopping the walk.
- sty-dispose-a-candidate-coupling: DEMONSTRATED — real run against 706 real candidate couplings from one real change, report on file at spec/iterations/i15-the-database-our-own-reader-over-obsidia/reports/rpt-dispose-a-candidate-coupling.md; only the top 15 were individually disposed in this run, a named gap rather than a hidden one.
- sty-drive-somebody-elses-product: not exercised by this delta.
- sty-hand-over-and-walk-away: not exercised by this delta.
- sty-nothing-i-do-reaches-what-it-came-from: not exercised by this delta.
- sty-press-create-vehicle-and-land-in-it: not exercised by this delta.
- sty-ramp-up: not exercised by this delta.
- sty-review-a-gate: exercised repeatedly this record — gate-kickoff, gate-motivation, gate-inputs, gate-requirements, gate-candidates, gate-architecture, gate-prototype, gate-implementation and this gate all reviewed and (where owed) blessed in sequence.
- sty-see-what-the-other-machine-may-pull-from: not exercised by this delta.
- sty-send-an-agent-to-a-cloud-box: not exercised by this delta.
- sty-start-a-new-product: not exercised by this delta.
- sty-the-agent-proves-it-read: exercised this walk — this session's own read probes on refusals.md and meth-test-design.md were answered against the actual document text.
- sty-the-call-that-comes-back-inside-a-second: not exercised by this delta.
- sty-the-control-that-says-why-it-declined: not exercised by this delta.
- sty-the-slow-call-that-says-it-is-working: not exercised by this delta.
- sty-the-write-refuses-the-break: not exercised by this delta.
- sty-vendor-it-into-my-product: not exercised by this delta.
- sty-walk-it-by-hand: not exercised by this delta.
- sty-work-on-two-machines: not exercised by this delta.

## market_tier


## round_0_verify

- evidence vs claims: PASS — every artifact cited in this record's evidence forms was confirmed by reading the actual file (se_query and se_couplings registered as ToolDefs in engine/tools-query.ts and spliced via tools.ts; both demo reports exist on disk at the paths cited).
- types: PASS — every patch this iteration typechecked clean; no outstanding typecheck error in the final battery.
- lint: PASS — biome check clean, 0 warnings, per the final battery run.
- tests: PASS — 1501/1501 green at rest per run-demos' final battery (up from 1492/1492 at gate-implementation, +9 from the two demo-driven regression fixes).

## round_1_validate

- exercised against the goal: PASS. record.md's DONE LOOKS LIKE line is now demonstrated for real rather than only argued: both must stories this iteration unblocked were run against the real vault, not asserted.
- missing: 7 of 15 $-item resolvers stay corpus-wide by documented design choice (raid-debt-delta-default-views, partial, carried unchanged from gate-implementation); 23 of the 25 tracked must stories remain undemonstrated, each owned by an iteration this record did not touch.
- wrong: nothing found against this delta's own goals. One real bug WAS found and fixed by the demos themselves — parseBase silently dropped a harvested .base file's own top-level filters, so a real query matched the whole vault instead of the filtered set; two regression tests now pin it.
- out of scope: unchanged from gate-kickoff and gate-implementation — the dashboard, embeddings, book table-interactivity, and mirror-widget UI changes beyond the verb/subset.
- prior art: unchanged from gate-motivation — no live scan against Obsidian's own Bases plugin or Dataview; raid-risk-i15-ships-without-a-live-prior-art-scan stays open.

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: SERVED — se_query, wired to answerStructuredQuery, executes a harvested .base file's own view against the real vault; SE-C-144 refuses an unrequested field by name with the legal list.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: SERVED — all 26 files harvested, hash-verified against the ref-main read, at spec/queries/ and spec/decisions/adr-query-in-engine.md.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: SERVED — file.inFolder added test-first (3 of 25 harvested files needed it); readVault's file.hasTag wiring fixed test-first (2 of 25 harvested files needed it). Both are named, reasoned extensions.
- Add conformance fixtures that pin the subset against drift.: SERVED — 5 new tests in query.test.ts mirroring harvested filter/sort shapes; tables.test.ts's pre-existing full-vault coverage tests now cover the harvest too.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: SERVED, PARTIALLY — 8 of 15 $-item sources fixed and proven test-first; 7 pool/comparison-machine sources deliberately deferred with rationale, documented in the raid entry itself.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: SERVED — se_couplings, wired to rankCandidateCouplings and recordCouplingDisposition, both real and demonstrated against 706 real candidates.
- Mint the interface entries both new lane verbs owe.: SERVED — if-walk-engine-to-query-evaluator and if-walk-engine-to-coupling-disposer, both minted; trace-coverage.test.ts's previously-red assertions are green.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — every lane call this session returned well inside the one-second bound; no timeout or retry was observed.

## round_2_red_team

- is a gate-validation covering only 2 of 25 must stories too thin to bless? => No: i15's actual delta is a scoped lane-verb addition that unblocked exactly two must stories, and both were demonstrated for real; the other 23 belong to iterations that have not been built yet, and each is marked plainly "not exercised" with no fabricated demonstration.
- did the demos actually stress the real system or a toy fixture? => Real: demo1 ran the harvested .base files against the real vault and found a genuine parseBase bug; demo2 ran BM25 against 706 real candidate couplings from one real change, not a synthetic set.
- is the partial delta-default-views repayment (8 of 15) being quietly upgraded to a pass here? => No: it is carried forward from gate-implementation's own honest partial verdict, unchanged, and named again in round_1_validate's missing line; nothing here claims it closed.

## raid_additions

- none

## verdict

pass — the delta meets the need it was scoped for: both must stories i15 unblocked were demonstrated for real against the real vault, finding and fixing a genuine bug in the process; the seven kickoff goals are served (one partially, honestly scoped and unchanged since gate-implementation); the battery is green at rest, 1501/1501; and the one open bound (if-agent-harness-to-entrypoint) held throughout. The standing open risks (prior-art scan, delta-default partial, lexical-fit assumption) are named rather than hidden and are not this gate's to close.

## follow_up

Onward to M9 package, gate-release and shipped. Standing debts for a future iteration: raid-debt-delta-default-views (7 of 15 resolvers still corpus-wide), raid-risk-i15-ships-without-a-live-prior-art-scan (no live scan against Obsidian's own Bases plugin or Dataview), raid-asm-i15-corpus-suits-lexical-matching (measured post-ship against real misses), and the harvest-content finding parked as note-b20975667464 for a future sweep of the 26 harvested files.

## anything_else

