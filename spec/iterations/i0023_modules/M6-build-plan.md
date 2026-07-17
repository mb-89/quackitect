# M6 Build Plan Evidence

## Build planned -> i23-m6-build-planned-decomposed

The build is decomposed into eight resumable child steps under `i23-m6-build-the-planned`:

1. `i23-m6-b1-module-config` - module registry and default module parsing.
2. `i23-m6-b2-node-module-load` - node module membership and default assignment.
3. `i23-m6-b3-module-filters` - exact and subtree filtering.
4. `i23-m6-b4-table-facets` - module facets before need facets.
5. `i23-m6-b5-command-selector` - leading module selector in command dispatch.
6. `i23-m6-b6-import-manifest` - dry-run import/update manifests.
7. `i23-m6-b7-vehicle-fixture` - vehicle fixture with imported `se` and local doc modules.
8. `i23-m6-b8-docs-sync` - docs, templates and guidance updates.

Each step depends on the prior step. The aggregate build task depends on the final documentation step.

This keeps progress resumable and prevents a monolithic module rewrite.

## Module config parsing -> i23-m6-b1-module-config

Implemented:

- `Config.WorkspaceID`
- `Config.DefaultModule`
- `Config.Modules`
- `ModuleConfig`
- `[workspace]` parsing for `id` and `default_module`
- `[modules.<id>]` parsing for title, kind, path, parent, and source
- default single-module fallback

Verification:

- `selftest module-registry` passes.
- `selftest node-module-default` passes.

Design markers:

- `go-module-config` implements `req-module-registry`.
- `go-node-module-default` implements `req-node-module`.

## Node module loading -> i23-m6-b2-node-module-load

Implemented:

- `module:` frontmatter on nodes.
- default module assignment during `LoadAll`.
- default module assignment for scanned design regions.
- default module assignment for synthetic connection-lane nodes.

Verification:

- `selftest node-module-default` passes.
- `selftest module-registry` passes.

Design marker:

- `go-node-module-default` implements `req-node-module`.

## Module filters -> i23-m6-b3-module-filters

Implemented:

- exact module matching
- parent dotted-id subtree matching
- `all` and `*` selectors

Verification:

- `selftest module-subtree-filter` passes.

Design marker:

- `go-module-config` implements `req-module-dotted-ids`.

## Module table facets -> i23-m6-b4-table-facets

Implemented:

- node-backed table rows carry `data-mod`
- tables with multiple modules render a module pill row
- the module pill row renders before the need pill row
- parent/child module ids are available to the shared table filter script

Verification:

- `selftest module-table-filter` passes.

Design marker:

- `go-book-emitter` implements `req-module-filter-first`.

## Module command selector -> i23-m6-b5-command-selector

Implemented:

- optional leading module id parsing
- selected module state for command execution
- status filtering by selected module subtree
- next filtering by selected module subtree

Verification:

- `selftest module-command-selector` passes.

Design marker:

- `go-module-command-selector` implements `req-module-command-selector`.

## Module import and update manifests -> i23-m6-b6-import-manifest

Implemented:

- module import planning from an external source tree
- target layout under `modules/<id>/import`
- provenance file planning in `modules/<id>/module.toml`
- create, write, delete, and provenance operation reporting
- update planning from recorded provenance
- overlay preservation under `modules/<id>/overlay`
- `module import` and `module update` command surface for dry runs

Verification:

- `selftest module-import` passes.
- `selftest module-update` passes.

Design marker:

- `go-module-import-plan` implements `req-module-import` and `req-module-update`.

## Vehicle module fixture -> i23-m6-b7-vehicle-fixture

Implemented:

- a fixture vehicle created through `initVehicleFiles`
- module registry entries for imported `se`, local `doc`, and child `doc.review`
- import planning from the Quackitect source into the vehicle's `se` module
- a guard that the import plan does not touch the local documentation child module

Verification:

- `selftest vehicle-module-setup` passes.

Design marker:

- `go-module-import-plan` supports `req-vehicle-module-setup` through the fixture path.

## Documentation and template sync -> i23-m6-b8-docs-sync

Updated:

- `integrate.md` documents workspace modules, dotted rollups, module import, and module update.
- `compose-reference.md` documents optional `module:` frontmatter and module-first derived tables.
- `vehicleTomlTmpl` seeds a default module in new vehicles.
- The white-label section no longer promises an engine footer.

Verification:

- `selftest vehicle-module-setup` passes.
- `selftest stubs` passes.

Design marker:

- `go-start-init` implements `req-vehicle-module-setup`.

## Build realized -> i23-m6-build-the-planned

All planned child steps are complete:

- module config parsing
- node module loading
- exact and subtree module filtering
- module-first table facets
- leading module command selector
- module import/update manifest planning
- vehicle module fixture
- documentation and template sync

The build remained additive: one workspace timeline and ledger are preserved. Module behavior is introduced as metadata, filtering and deterministic import/update planning.

## Implementation risks acceptable -> i23-m6-implementation-risks-acceptable

Accepted implementation risks:

- Module id prefix lint is not yet implemented. Global ids still prevent collisions today.
- Module update plans report delete operations but do not yet apply them through `quack apply`.
- Module-first table filtering is emitted in the book table renderer first; report-specific module UX can follow if needed.
- Command selection currently filters `status` and `next`; deeper module-specific commands can extend the same selector.

These are acceptable for the first implementation because the core invariants are in place:

- module registry
- default membership
- subtree matching
- import/update planning
- documented vehicle setup

## Internal quality ok -> i23-m6-internal-quality-ok

Focused checks run:

- `selftest module-registry`
- `selftest node-module-default`
- `selftest module-subtree-filter`
- `selftest module-table-filter`
- `selftest module-command-selector`
- `selftest module-import`
- `selftest module-update`
- `selftest vehicle-module-setup`
- `git diff --check`

All passed.

## Models adhered-to -> i23-m6-models-adhered-to

Implementation follows `model-module-architecture`:

- workspace process: unchanged one iteration, one ledger, one report, one book
- module registry: `Config.Modules`, `ModuleConfig`, and `ReadConfig`
- module selector: `selectModuleArg`, `selectedModule`, and `moduleSelected`
- module facets: shared reader-table module facet and `data-mod` row stamps
- import manager: `modulePlan` and `module import`
- update manager: `modulePlan`, provenance reading, and `module update`
- module overlay: planner skips overlay paths and preserves local files

No new architectural element was added outside the M4 model.