# M4 — Decide the architecture (i0004_vendoring_out)

## Architecture stated  → i4-m4-architecture-stated
**Alternative (A) — the base selector.** The engine resolves a WORKSPACE root (default: walk up from cwd to the `.quack` marker, exactly as today; override with `--base <path>` / `-C`). All project state derives from the workspace root. Engine resources resolve independently (vendor → dogfood). The engine is stateless w.r.t. the project. See `adr-workspace-base`.

## ADR recorded and traced  → i4-m4-adr-recorded  *(derived: coverage:adr-traced — DONE)*
- `adr-workspace-base` addresses `req-workspace-split`.
- `adr-white-label-argv` addresses `req-white-label` (grandfathered).

## Choice traced  → i4-m4-choice-traced
req-workspace-split → adr-workspace-base → the base-selector design (realized in M6). Backward-compatible default keeps every existing dogfood/vehicle path working with no flag.
