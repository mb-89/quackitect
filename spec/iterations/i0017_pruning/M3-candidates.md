# M3 - Design (i0017_pruning, lean)

TL;DR: Six approaches, each with its reason and its rejected obvious alternative. Five are sealed as ADRs. The riskiest scope is the compaction loader (hash preservation) - its kill-criterion stands from M1. Numbers pinned: 292 requirement files at baseline, target <= 120.

## Approach chosen with recorded reasons  -> i17-m3-approach

- **Clustering** ([adr-cluster-numbered-statements](../../decisions/adr-cluster-numbered-statements.md)): requirement nodes cluster with an umbrella statement and NUMBERED singular shall-statements in the body; verifies edges may target `req-x.1`; shipped iterations migrate 292 -> <=120 nodes; the trace-graph render clusters too (the theme-cluster pattern from the i16 onion, reused). Tests follow the owner's re-verification-economics rule - both fan directions legal. *Rejected:* clustering only future requirements - fails the unreadable-graph complaint, which is about the shipped mass. *Standards note:* deliberate ISO 29148 singularity divergence, mitigated at statement level (M1 red team carried).
- **Metrics removal**: delete the three computations and their surfaces outright. *Rejected:* hide-behind-flag - keeps the maintenance without the value; git history is the archive.
- **Prose currency + config split, ONE mechanism** ([adr-rules-as-config](../../decisions/adr-rules-as-config.md)): the retired-vocabulary list ships as a config file consumed by the lint; the weasel-word and facet vocabularies migrate to the same pattern (the sebot grammar-in-JSON precedent). *Rejected:* hardcoded lists - the exact smell item 6 names; and config-for-everything - rules with logic stay code (YAGNI).
- **Compaction** ([adr-compact-archive-loader](../../decisions/adr-compact-archive-loader.md)): a determinized migration (`compact <iteration>`) merges a shipped iteration's files into an archive file the strict loader reads natively - node statements and evidence preserved so recorded hashes stand; logs, gather caches, and spike homes delete freely; the LEDGER never compacts. *Rejected:* git-only archaeology (delete + rely on history) - breaks the live board and the suspect cone. *Kill-criterion armed:* hashes immovable on a fixture, or item 4 ships as documented convention.
- **Go analysis** ([adr-go-analysis-stdlib-first](../../decisions/adr-go-analysis-stdlib-first.md)): `quack build` always runs gofmt + go vet and fails on findings (the toolchain is already required - zero new deps); staticcheck grab-if-present from the tools lane. *Rejected:* golangci-lint as required dependency - the meta-linter is the industry standard but violates the zero-dep spirit and imports a config culture we do not need at this size.
- **Ask context** ([adr-ask-context-once](../../decisions/adr-ask-context-once.md)): `ask` gains the narrative below the card - one generated text, both lanes identical, card first. *Rejected:* a second ntfy message - the two-cards law forbids it.

Scope guard (what does NOT happen, per the owner's light-on-features ruling):

- no new model kinds
- no new report surfaces
- no Slack/corporate work
- no book-manifest additions (descoped to this iteration's own docs round only where the owner rules)

## Decisions traced  -> derived check
Five ADRs, each addressing its requirement; req-metrics-removed and req-docs-clean need none (pure removals and the owner round).

## The build plan (L4 method - seeded at the M3 close)
Ten steps under i17-m4-build; ORDER IS NOT DEPENDENCY:
- Stage 1: [i17-b1-red-suite](tasks/i17-b1-red-suite.md) - the seven-test battery RED.
- Stage 2 (parallel, disjoint files): [i17-b2-ask-context](tasks/i17-b2-ask-context.md), [i17-b3-metrics-removal](tasks/i17-b3-metrics-removal.md), [i17-b4-rules-as-config](tasks/i17-b4-rules-as-config.md), [i17-b5-go-analysis](tasks/i17-b5-go-analysis.md), [i17-b6-sub-addressing](tasks/i17-b6-sub-addressing.md), [i17-b8-render-folds](tasks/i17-b8-render-folds.md), [i17-b9-compaction](tasks/i17-b9-compaction.md), [i17-b10-mint-templates](tasks/i17-b10-mint-templates.md) (timeboxed relief valve).
- Stage 3: [i17-b7-cluster-migration](tasks/i17-b7-cluster-migration.md) - after sub-addressing; ONE re-baseline, ONE wave bless.
Sizing honesty: b7 ripples everything (the recorded mitigation); b10 drops to a note if the schedule breaks; the owner joins at M5 for the docs round.

## Extension (owner scope ruling, 2026-07-10 at the L4 gate)
The owner folded EVERYTHING on the board into this iteration - "we are still pruning; put everything you've written down into the current iteration" - superseding the original scope guard's book-manifest line and the light-on-features fence for these named items. Six new requirements minted (req-expedition, req-question-nodes, req-cone-triage, req-ask-hardening, req-models-complete-book, req-battery-lean), six tests observed RED, eight extension steps:
- Stage 4: [i17-b13-perf-slice](tasks/i17-b13-perf-slice.md) (one shared book render, status-fast restructure, lint AST cache), then [i17-b20-selftest-registry](tasks/i17-b20-selftest-registry.md) (the owner's mid-build ask: the dispatcher switch + duplicated all-list collapse into per-file registries - the adr-rules-as-config tier-3 pattern, logic staying in code).
- Stage 5 (sequential - each ends in a build): [i17-b15-ask-hardening](tasks/i17-b15-ask-hardening.md), [i17-b16-cone-triage](tasks/i17-b16-cone-triage.md) (the b7 incident's fix), [i17-b17-question-nodes](tasks/i17-b17-question-nodes.md), [i17-b18-expedition](tasks/i17-b18-expedition.md) (the Socratic package formalized - "we do it all the time anyways"), [i17-b19-models-book](tasks/i17-b19-models-book.md) (the i16 descope reversed by the owner).
- Stage 6: [i17-b14-compact-run](tasks/i17-b14-compact-run.md) - the compactor applied to the REAL spec, probe-first, battery per batch.
End-state the owner named: a quick system and a full docu; M5 stays the owner-led docs round.

## Milestone review  -> i17-m3-gate
**Verify:** every approach names its ADR or its reason-in-place; the numbers are pinned (292 -> <=120); the compaction risk carries its kill-criterion. **Validate:** all eight requirements have an approach; the scope guard encodes the owner's ruling. **Red-team:** the clustering migration touches EVERY shipped iteration's files - the single largest suspect-ripple this project has seen; mitigation: it runs as a determinized migration (the migrate-layout precedent) with ONE re-baseline and ONE wave bless, never file-by-file hand edits. **Verdict: PASS** - hand-off for the gate.
