# M3 Candidates Evidence

## Alternatives elaborated -> i23-m3-2-alternatives-elaborated

Four alternatives were elaborated:

- `cand-project-types-only`: reuse project types and overlays only.
- `cand-flat-modules`: add flat module ids without nesting.
- `cand-dotted-modules`: add dotted module ids with parent rollup filters and one shared ledger.
- `cand-recursive-modules`: give parent modules recursive process semantics.

The current preferred candidate is `cand-dotted-modules`.

It gives useful nesting, module-first views, and exact imports without introducing separate module timelines, nested ledgers, or recursive gate semantics.

## Criteria weighted -> i23-m3-criteria-weighted-derived

The criteria come directly from the requirements:

- one ledger and one timeline: 0.25
- module-first filtering across derived views: 0.20
- deterministic import/update with dry run and provenance: 0.20
- backward compatibility for single-module workspaces: 0.15
- implementation cost and risk: 0.10
- future path to local vehicle modules: 0.10

The weighting favors preserving the existing process model while adding module ownership and import boundaries.

## Feasibility rough-checked -> i23-m3-feasibility-rough-checked

Candidate feasibility:

- `cand-project-types-only`: feasible but insufficient. It cannot express imported/local product areas in one workspace.
- `cand-flat-modules`: feasible and cheap, but weak for parent rollup filters.
- `cand-dotted-modules`: feasible. It mainly adds module metadata, subtree matching, and view filters before deeper identity changes.
- `cand-recursive-modules`: feasible only with much larger scope. It risks nested timelines, parent gate semantics, and recursive import/update complexity.

Conclusion: dotted module ids are the feasible first implementation.

## Review Verdict -> i23-m3-gate

Verify: four alternatives are recorded, the weighted criteria are stated, and each candidate has a feasibility judgment.

Validate: the selected dotted-module candidate matches the owner direction: nesting as rollup, not recursive process behavior.

Red-team: flat modules are cheaper, but they lose the parent-module selection behavior that makes `doc` naturally include `doc.*`. Recursive modules are more powerful, but they would delay module import and filtering with process complexity.

Verdict: M3 is ready for adjudication.