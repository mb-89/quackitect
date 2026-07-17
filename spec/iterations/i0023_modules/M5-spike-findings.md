# M5 Spike Findings Evidence

## Design is buildable -> i23-m5-design-is-buildable

The selected architecture is buildable with small engine changes.

Build seams already exist:

- `readProjectConfig` and `Config` can grow module registry fields.
- `ParseNodeBytes` can load a `module` field.
- `LoadAll` is the single graph assembly point where default module assignment can happen.
- `renderBaseHTML` and table helpers can add module facets before existing need facets.
- `Dispatch` can consume a leading module id before command routing.
- `copyTree`, `quack apply`, and the existing vendoring lane can support deterministic module import and update.

The design avoids high-risk changes in the first cut:

- no independent module timelines
- no nested ledgers
- no recursive parent-gate semantics
- no composite `(module, id)` identity yet

The first implementation can therefore proceed as an additive module metadata and filtering layer.

## Riskiest assumptions validated -> i23-m5-riskiest-assumptions-validated

Assumption 1: module semantics can be added without splitting the ledger.

Evidence: `StatusMap`, `gateState` and attest events operate over loaded nodes and ids. Adding module metadata does not require changing the event model. Rollups can be view-only.

Assumption 2: imported modules can reuse deterministic file lanes.

Evidence: `copyTree` already mirrors engine source into a vehicle. `quack apply` already validates byte-exact edits before applying them. A module update command can generate the same all-or-nothing manifest instead of inventing a new mutation lane.

Assumption 3: module-first filters can reuse the derived-table facet machinery.

Evidence: the book/report already render facet pills for type + need + decision type + iteration. A module facet is another first-class facet, with the special rule that selecting a parent dotted id includes child ids.

Assumption 4: single-module workspaces can remain visually unchanged.

Evidence: the renderer already hides empty or irrelevant view affordances. The module facet can be suppressed when the module registry has one visible module.

Verdict: the risky assumptions are validated well enough to proceed to build planning.

## Spike results recorded -> i23-m5-spike-results-recorded

No throwaway code spike was needed. The useful spike was an architecture probe against the existing engine seams.

Results carried forward:

- module metadata belongs in `project.toml` and loaded node state
- parent module behavior is filter rollup only
- import/update should use the manifest/apply lane
- views and tables need module facets before need facets
- command dispatch needs an optional leading module selector

The design input and architecture were updated with these results.

## Review Verdict -> i23-m5-gate

Verify: the risky assumptions were checked against existing engine seams and recorded above.

Validate: the results support moving into implementation without expanding scope into recursive module process semantics.

Red-team: the import/update path is still the highest implementation risk. The deterministic manifest requirement keeps that risk bounded.

Verdict: M5 is ready for adjudication.