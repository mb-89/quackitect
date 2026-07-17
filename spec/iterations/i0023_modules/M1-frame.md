# M1 Frame Evidence

## Vision and scope stated -> i23-m1-vision-scope-stated

Vision: a Quackitect workspace is a set of modules that share:

- one iteration
- one ledger
- one report
- one book

The first module implementation is deliberately small:

- Modules are dotted ids such as `se`, `doc`, and `doc.review`.
- A parent module is a view/filter rollup, not a recursive mini-project.
- Every loaded node gets a module, defaulting to the workspace default module.
- Derived tables filter by module first, then by need.
- Vehicles can import and update one module from another project through a deterministic manifest.

Out of scope for the first cut:

- independent module timelines
- nested ledgers
- automatic parent gate adjudication
- true composite `(module, id)` identity
- recursive module import by default

## Problem agreed -> i23-m1-problem-agreed-the

The delta is real and worth solving.

Vehicles can already vendor Quackitect as a whole engine layer, but that is too coarse for a multi-purpose vehicle.

The needed capability is narrower:

- Import one module from another project.
- Update that import deterministically.
- Keep one workspace timeline and ledger.
- Filter every table by module before need.
- Let dotted child modules roll up in views without recursive process semantics.

The current engine has related pieces:

- vendored vehicles
- overlays
- `--base`
- deterministic apply manifests

It does not yet have:

- first-class modules
- module import/update
- module-scoped derived views

This iteration is therefore justified as an engine architecture change, not only a vehicle customization.

## State of the art checked -> i23-m1-state-of-the

The closest existing patterns are present inside Quackitect already:

- `start init` vendors a whole engine into a vehicle.
- The overlay resolver lets a vehicle override vendored method resources.
- `--base` lets one engine drive another workspace.
- `quack apply` provides deterministic byte-exact file changes.
- Project types and rigor tailor method input, but they do not divide one workspace into owned product areas.

Those mechanisms are useful but incomplete for a vehicle with multiple product areas.

The selected direction is to add modules as first-class ownership and filtering units, while keeping one workspace timeline and one ledger. Dotted ids such as `doc.review` give nested views without recursive process semantics.

## Success is measurable -> i23-m1-success-is-measurable

The iteration closes when these outcomes are visible:

- A workspace can declare modules in `spec/project.toml`.
- Nodes without a module load into the default module.
- Dotted module ids filter as subtrees.
- Derived tables present module pills before need pills.
- A command can run with a module selector.
- A vehicle can import and update a module from recorded provenance through a dry-runnable manifest.
- A fixture can build an empty vehicle, import `se` from Quackitect, and create local `doc` modules.

Each outcome has a matching test node in this iteration.

## Top risks logged -> i23-m1-top-risks-logged

The risk register now carries the main module risks:

- `raid-module-import-drift`: imports can drift or overwrite local vehicle work.
- `raid-module-scope-confusion`: dotted modules can be mistaken for nested projects.
- `raid-module-id-collisions`: module-local content can collide while ids remain globally keyed.

The mitigations match the selected first cut:

- deterministic dry-run manifests
- one ledger with view-only rollups
- module-prefix lint before any later composite identity change

## Review Verdict -> i23-m1-gate

Verify: every M1 subcheck has a concrete referent in this evidence file or the risk register.

Validate: the iteration answers the actual owner ask. It starts module support for shareable vehicles. It avoids module-local timelines. It keeps Tracer out of the Quackitect iteration record.

Red-team: the main risk is overbuilding modules into nested projects. The explicit out-of-scope list and dotted-id rollup ADR keep the first implementation bounded.

Verdict: M1 is ready for adjudication.