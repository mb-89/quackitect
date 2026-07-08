# M3 - Candidate architectures (i0014_doc_review, lean)

TL;DR: No new architecture - the iteration reworks rendering inside the shipped i12/i13 substrate. Four deciding ADRs are recorded; each names its rejected alternative. No spike: the riskiest cluster (oversized renders) is deliberately deferred to an in-walk discussion by owner ruling.

## Approach chosen with recorded reasons  -> i14-m3-approach-chosen

**The approach.** Fix everything inside the existing single-file book substrate. Template-first: rendering changes land in the engine and template home, the dogfooding spec re-derives, and the book-drift check gates the sync. Content changes (seeded examples, prose rework) land in this project's spec.

The deciding ADRs, each with its rejected alternative:

- [adr-template-first](../../decisions/adr-template-first.md) - fixes land in the substrate, never patched into the dogfood book. Rejected: spec-local patches (fork).
- [adr-section-paging](../../decisions/adr-section-paging.md) - client-side paging, one top-level section per page. Rejected: multi-file output (breaks the single-file identity).
- [adr-derived-prose](../../decisions/adr-derived-prose.md) - derivable sections render as canned queries. Rejected: agent-drafted prose (drifts, duplicates).
- [adr-table-interact](../../decisions/adr-table-interact.md) - interactivity extends the Bases-table substrate, vanilla inline JS. Rejected: a table library (breaks CSP-safe zero-dependency).

**Riskiest unknown.** The oversized renders (req-compact-renders) have no settled design - by owner ruling they sit LAST in the build order behind a design discussion, which is the lean spike slot used as a deferred discussion instead. Second risk, watched not spiked: search-across-pages (req-search-hitlist must pan across section pages) - buildable within the paging design of adr-section-paging.

## ADRs traced  -> i14-m3-adr-traced

All four ADRs address requirements via the addresses lane; the rule computes live.

## Milestone review  -> i14-m3-gate

**Verify.** The four ADR nodes exist in spec/decisions with adjudicated_by stamps; the addresses edges are in the lane; the derived check computes green.
**Validate.** The approach honors the M1 kill-criterion (nothing breaks the single-file book) and the owner rulings (template-first sync, derived over authored, easy stuff first).
**Red-team.** Opposing case: "client-side paging + in-place filtering will bloat the inline JS." Held: the substrate already carries the annotator and Bases tables in inline JS; the increments are bounded, and the dom-static selftests gate regressions. Kill-criterion: if paging or interactivity forces an external dependency, the ADR reopens.
**Verdict: PASS** - proceed to the gate bless.
