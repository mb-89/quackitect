# M8 — Package and hand over (i0005_workspace_stubs)

Evidence for the M8 subtasks. Each section is the referent for one gate.

## Docs complete and match the surface  → i5-m8-docs-complete  *(killer)*

- `method/prompts/integrate.md` gains a "Drive a BARE workspace from INSIDE" section: `quack start stubs`, the three emitted stubs, and the runtime resolution order (internal → `.quack\engine.local` → `QUACK_ENGINE`).
- Root `AGENTS.md` determinizer-tools list documents `quack start stubs [path]`.
- The engine method prompts (`engage.md`, `milestone-review.md`) were also updated this iteration to codify writing `M<n>-*.md` evidence docs and the M6 build-step lower bound.

## Packaged and versioned  → i5-m8-packaged-versioned

The feature ships as engine code (`insideStubFiles`, `quack start stubs`, extended `selftest:workspace`, `selftest:stubs`) plus the i0005 spec. `quack build` re-baselined the golden root; `quack ship` packages `product/` when desired.

## Configuration baselined  → i5-m8-config-baselined

`.quack/config.toml` remains `type=default, rigor=systematic, version=i0005_workspace_stubs`. The engine binary is rebuilt and golden re-baselined (`c13f042ae80b`).

## Handover accepted  → i5-m8-handover-accepted

Delivered: drive-from-inside stubs + emitter + automated roundtrip, all 25 selftests green, `status` non-recursive. Follow-ups logged: POSIX launcher and existing-workspace retrofit (both deferred in M1); the report should mark killer-gates in the task view (captured as a note for i0001_reporting).

## Verdict

**Verify** — docs match the shipped surface; build + golden baselined; selftests green. **Validate** — the iteration delivers `uc-drive-from-inside` end to end. **Red-team** — the one process scar (the freeze) is fixed and guarded, and its lesson codified in the method. **Pass** → gate blessed.
