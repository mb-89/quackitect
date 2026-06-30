# M3 — Candidate architectures (i0004_vendoring_out)

The core decision: how to make the engine drive a SELECTABLE workspace.

## Alternatives elaborated  → i4-m3-alternatives-elaborated  *(killer)*
- **(A) Base selector (sebot/git-style).** The engine resolves a workspace ROOT: default = walk up from cwd to a marker; override with `--base <path>` (or `quack -C <path>`). ALL state paths (QUACK/ATTEST/NOTES/evidence/gather/out/config) derive from the workspace root; the engine's own resources resolve independently (vendor/dogfood). One engine, many workspaces.
- **(B) workspaces/ registry subdir.** The engine owns a `workspaces/<name>/` tree and a "current" pointer; `quack workspace use <name>`. Heavier; introduces a registry + switching state; couples workspaces to one engine install.
- **(C) Status quo.** Vendor a full engine per project (today). No selection; every driven project carries an engine. Rejected as the thing we are removing.

## Criteria weighted  → i4-m3-criteria-weighted
Least vendoring (0.3), backward-compatible default (0.3), minimal findRoot/state change (0.2), sebot parity / familiarity (0.2). **(A)** wins on all but is slightly heavier on state-path centralization; **(B)** loses on complexity; **(C)** loses on the core need.

## Feasibility checked  → i4-m3-feasibility-checked
The touch points are `findRoot()` and the package-level state vars (`ROOT/SPEC/QUACK/ATTEST/NOTES`) in engine.go, plus report/gather/ship which already build paths off those. Centralizing them behind a resolved workspace root + adding a `--base/-C` flag is tractable and localized. Default (cwd walk-up) preserves today's behavior exactly.
