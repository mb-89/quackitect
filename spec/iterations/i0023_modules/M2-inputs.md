# M2 Inputs Evidence

## Inputs captured -> i23-m2-inputs-captured-context

Context: Quackitect currently treats a workspace as one product surface with one method stack. Vehicles can vendor the whole engine, but cannot import one capability module and own local modules in the same timeline.

Stakeholders:

- vehicle maintainer: needs a cloneable vehicle repository with imported and local capability areas
- project owner: needs one ledger and one timeline across modules
- reader/reviewer: needs module-first filtering before need filtering
- engine maintainer: needs deterministic imports and updates that do not overwrite local overlays

Use cases composed in this iteration:

- `uc-module-scoped-views`
- `uc-module-import-update`
- `uc-vehicle-se-doc`
- `uc-module-nesting`

The trace edges connect those use cases to `need-module-ownership` and `need-vehicle-independence`.

## Prior art checked -> i23-m2-prior-art-checked

The requirement set was checked against the mechanisms already in the engine:

- `start init` solves whole-vehicle vendoring, but not one-module import.
- `start stubs` solves drive-from-inside, but not module ownership.
- The overlay resolver solves local overrides, but not imported module provenance.
- `quack apply` solves deterministic file changes, and should be reused for module import/update manifests.
- Project types and rigor solve tailoring, but they do not create module facets or module ownership.
- `--base` solves one engine driving another workspace, but not module filtering inside one workspace.

Misses added to the requirement set:

- module registry loading
- dotted module subtree filtering
- node default module assignment
- module-first table facets
- module command selector
- deterministic module import and update
- generic vehicle setup with imported `se` and local documentation modules

## Stakeholder coverage -> i23-m2-stakeholder-coverage-no

No new named stakeholder classes are needed for this engine iteration. The existing role set covers the concern:

- project owner: adjudicates the one-ledger, one-timeline semantics
- developer-maintainer: implements module parsing, filtering, import, update, and resolver changes
- agent: needs unambiguous module command selection and module-aware gather/compose rules
- newcomer: benefits from single-module hiding and module-first views when projects grow
- assessor: reviews module imports, provenance, and cross-module trace visibility

The requirements cover each role's concern:

- ownership
- shareability
- filtering
- imports
- updates
- bounded dotted nesting

Late design input from the i23 walk: user handoffs must batch only user-adjudicated checks. The durable marker is `killer: true`. Deterministic checks and agent-fillable review work stay in the agent lane. The engine should prefer agent-lane ready work before opening a user handoff. When dependency order leaves only ready user-lane checks, the handoff may batch them together.

## Requirements verifiable -> i23-m2-requirements-verifiable-every

Every module requirement has a matching test node in the verification lane.

## Requirements traced -> i23-m2-requirements-traced-every

Every module requirement refines one of the composed module use cases, and each use case refines one of the two module needs.

## Review Verdict -> i23-m2-gate

Verify - the trace covers:

- module ownership
- import/update
- module-first filtering
- command selection
- generic vehicle setup

Validate: the requirements match the revised owner direction:

- no per-module iterations
- dotted nested ids as filter rollups
- no Tracer-specific Quackitect documentation

Red-team: the main missing design decision would be treating imports as overlays only. That is rejected by `req-module-import` and `req-module-update`, which require deterministic manifests and provenance.

Verdict: M2 is ready for adjudication.