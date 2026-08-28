---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-19T21:04:19.305Z
authors: agent
files: null
---

# Evidence form / gate-release

## current_situation

gate-validation is blessed and package is signed. dist/quackitect-6.0.0.zip assembled by script, expanded, and the entrypoint run from inside it: --help and --version both exit 0. This gate judges whether the package stands and works; the bless ships it.

## market_block


## round_0_verify

- evidence vs claims: PASS — every artifact cited was confirmed by reading it directly, including the archive's own extracted copy rather than trusting the assembly log alone.
- types: PASS — every patch typechecked clean this iteration.
- lint: PASS — biome check clean, 0 warnings.
- tests: PASS — 1501/1501 green at rest, per run-demos' final battery.

## round_1_validate

- exercised against the goal: PASS. The package's own entrypoint answered from inside the extracted archive, matching the version the manifest carries (6.0.0), not a stale copy.
- missing: nobody installed from the package with RUNME.ps1 and nobody reached the desk — the same limit i16's own package.md named, and doing that unasked while nobody is watching would be a side effect rather than a check.
- wrong: nothing found against this release. i16's own emit_back named a missing --version flag as its sharpest finding; that flag now exists and was exercised here for the first time as the package's own proof.
- out of scope: unchanged — the dashboard, embeddings, book table-interactivity, mirror-widget UI beyond the verb/subset.
- prior art: unchanged from gate-motivation — no live scan against Obsidian's own Bases plugin or Dataview; raid-risk-i15-ships-without-a-live-prior-art-scan stays open.

## goals_served

- Ship a read-only lane verb that reads nodes, edges, states and notes from .base files, returns filtered rows with chosen fields, and refuses an unknown field by naming the field list.: SERVED — se_query, wired to answerStructuredQuery, ships inside dist/quackitect-6.0.0.zip; SE-C-144 refuses an unrequested field by name.
- Harvest v1's 25 working .base query files from `spec/queries/` at ref `main`, plus the reader ADR at `spec/decisions/adr-query-in-engine.md`.: SERVED — all 26 files harvested and shipped inside the archive at spec/queries/ and spec/decisions/adr-query-in-engine.md.
- Extend the pinned Bases subset only where a harvested query needs it, test-first, reopening the decision rather than smuggling in a silent extension.: SERVED — file.inFolder and the hasTag fix, both test-first, both in the shipped tree.
- Add conformance fixtures that pin the subset against drift.: SERVED — 5 new tests in query.test.ts, shipped with the archive's test suite.
- Fix raid-debt-delta-default-views so the $-item resolvers default to the bound record's minted_in delta, with an opt-in to widen to the corpus.: SERVED, PARTIALLY — 8 of 15 sources fixed test-first; 7 deliberately deferred, documented in the raid entry, carried unchanged into this release.
- Build the BM25 retrieval sibling as its own lane verb over the same corpus, forcing per-candidate disposition rather than raw retrieval, and skipping what the graph already encodes structurally.: SERVED — se_couplings ships in the archive, demonstrated against 706 real candidates before this gate.
- Mint the interface entries both new lane verbs owe.: SERVED — if-walk-engine-to-query-evaluator and if-walk-engine-to-coupling-disposer, both minted and shipped.

## bound_breaches

- if-agent-harness-to-entrypoint: not breached — every lane call this session, including the package script and the entrypoint checks, returned well inside the one-second bound.

## round_2_red_team

- is checking --help and --version enough to call the package "works", when nobody installed it or reached the desk? => It is the row's own bar, not a lowered one: i16 and i33 both passed this gate on the same shape of check (expand, inspect, run the entrypoint from inside), and both named the install gap plainly rather than papering over it, same as here.
- does the smaller-model demo gap (raid-issue-smaller-model-demo-owed, minted at gate-validation) block a release verdict? => No: it is a demonstration gap on a story about a DIFFERENT walk mode, not a defect in what ships; the test-spec defining the procedure ships in the archive, honestly marked owed rather than silently dropped.
- is the partial delta-default-views repayment (8 of 15) being quietly upgraded to a pass at the last gate before shipping? => No: it is carried forward unchanged from gate-implementation and gate-validation, named again here in round_1_validate's missing line, and the standing raid entry still reads open.

## raid_additions

- none

## verdict

pass — the package stands and works: assembled by script, expanded, and its entrypoint answered correctly from inside the archive at both --help and --version, the latter closing a gap i16's own release named. The seven kickoff goals ship inside it, one honestly partial and unchanged since gate-validation. The battery is green at rest, 1501/1501, and the one modelled bound held throughout. The open risks (prior-art scan, delta-default partial, lexical-fit assumption, the smaller-model demo) are named rather than hidden and travel forward as standing raid entries rather than blocking this gate.

## follow_up

Onward to shipped. Standing debts for a future iteration, unchanged by this gate: raid-debt-delta-default-views (7 of 15 resolvers still corpus-wide), raid-risk-i15-ships-without-a-live-prior-art-scan, raid-asm-i15-corpus-suits-lexical-matching, raid-issue-smaller-model-demo-owed, and the harvest-content finding parked as note-b20975667464. The install-from-package gap (nobody ran RUNME.ps1, nobody reached the desk) is now the third release in a row to name it, per i16's own follow_up — worth a future iteration's own scope rather than another repeated mention.

## anything_else

