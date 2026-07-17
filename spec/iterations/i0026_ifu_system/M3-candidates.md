# M3 - Candidates (i0026_ifu_system)

## Alternatives elaborated -> i26-m3-2-alternatives-elaborated

A) New IFU document type.
- Pro: taxonomy is explicit.
- Con: duplicates deck machinery and guide discovery.

B) `kind: ifu` on deck manifests and guide rows.
- Pro: keeps markdown deck as truth.
- Pro: keeps the existing renderer.
- Pro: makes IFU visible in titles and tables.
- Con: `kind` must carry semantic weight.

C) Guide-only rows.
- Pro: minimal engine change.
- Con: does not make IFU decks first-class.
- Con: cannot support deterministic coverage cleanly.

## Criteria weighted -> i26-m3-criteria-weighted-derived

Criteria:
- discoverability: 0.30
- source editability: 0.25
- renderer reuse: 0.20
- deterministic coverage: 0.15
- reader clarity: 0.10

B wins because it balances all five without creating a second document pipeline.

## Feasibility rough-checked -> i26-m3-feasibility-rough-checked

A is feasible but broad. B is feasible with one allowed frontmatter field, one coverage rule, and guide/deck source edits. C is feasible but incomplete.

## Milestone review -> i26-m3-gate

Verify: three alternatives and criteria are recorded. Validate: B fits the owner ruling that IFUs are slideshows, not a new document type. Red-team: `kind` can become a dumping ground. The coverage rule only treats `kind: ifu` on deck manifests as IFU coverage. Verdict: PASS.
