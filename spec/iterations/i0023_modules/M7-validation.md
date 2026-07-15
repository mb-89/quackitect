# M7 Validation Evidence

## Meets the need -> i23-m7-meets-the-need

Validated against the M1 success criteria:

- Module registry: `selftest module-registry` passed.
- Default membership: `selftest node-module-default` passed.
- Dotted subtree selection: `selftest module-subtree-filter` passed.
- Module-first tables: `selftest module-table-filter` passed.
- Command selector: `selftest module-command-selector` passed.
- Import planning: `selftest module-import` passed.
- Update planning: `selftest module-update` passed.
- Vehicle fixture: `selftest vehicle-module-setup` passed.

The implementation keeps one workspace timeline and ledger. Modules add ownership, filtering, and import/update planning. They do not add nested ledgers or parent-module gates.

## Killer use-cases demonstrated -> i23-m7-killer-use-cases

The focused checks exercise the core owner-facing use cases:

- A workspace declares modules in `spec/project.toml`.
- Historical nodes load into the default module.
- Dotted ids select a module subtree.
- Reader tables expose module facets before need facets.
- Commands can be scoped by a leading module selector.
- Module import and update produce deterministic plans.
- A vehicle fixture can carry an imported `se` module and local `doc` modules without overwriting the local module area.

The handoff batching rule was also exercised: `selftest pager-merge` passed. The rule keeps deterministic and agent-fillable checks out of user batches. It batches only ready user-adjudicated checks.

## Consistency swept -> i23-m7-consistency-swept-everything

Documentation and templates were checked against the implemented behavior:

- `compose-reference.md` documents optional `module:` frontmatter and module-first derived tables.
- `integrate.md` documents modules, dotted rollups, `module import`, and `module update`.
- The vehicle project template seeds `[workspace]` and `[modules.default]`.
- The systematic checklist names the M4 model-authored check in management-readable language.
- M2 design input now records the handoff batching rule: agent-lane work is filled before user handoff, and user batches contain only user-adjudicated checks.

No Tracer-specific content was added to Quackitect documentation.

## Acceptance obtained -> i23-m7-acceptance-obtained-sign

The owner accepted the module architecture direction during the walk:

- Keep one ledger and one iteration.
- Treat dotted modules as view rollups.
- Keep parent modules out of separate process ownership.
- Import modules deterministically.
- Keep Tracer out of Quackitect docs.

The remaining owner-facing acceptance is this M7 handoff.

## Validation gaps captured -> i23-m7-validation-gaps-captured

Known gaps are recorded as RAID:

- `raid-module-import-drift`: update plans must keep provenance clear and preserve overlays.
- `raid-module-scope-confusion`: dotted modules can be mistaken for nested projects.
- `raid-module-id-collisions`: ids remain globally keyed in this first cut.

Accepted first-cut limitations:

- Module delete operations are planned but not yet applied through `quack apply`.
- Report-specific module UX can follow the book/table module facets.
- More module-scoped commands can extend the same selector later.

## Review Verdict -> i23-m7-gate

Verify: focused module checks and the pager batching check passed.

Validate: the implementation satisfies the requested module semantics without introducing nested ledgers or Tracer-specific Quackitect documentation.

Red-team: the main weakness is still module id collision handling. The current global-id model prevents silent duplicates today. A later composite-id design can be considered when imports carry larger payloads.

Verdict: M7 is ready for adjudication.