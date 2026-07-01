# M6 — Build and verify (i0005_workspace_stubs)

## Build planned  → i5-m6-build-planned  *(killer)*

The build is decomposed into small, resumable steps, children of `i5-m6-build`, in dependency order. Split by *unit of durable progress* (each step earns its checkpoint), not by file:

1. **i5-m6-bs-stub-templates** — the launcher (`quack.cmd`: internal → `.quack\engine.local` → `QUACK_ENGINE`, clear failure otherwise), the `AGENTS.md` stub, and the `.gitignore`, authored together as one unit. Realizes `req-inside-launcher`, `req-inside-entry-surface`, `req-engine-loc-untracked`. *(label-goto shape validated in the M5 spike)*
2. **i5-m6-bs-emit** — emit the three templates into a target workspace via the scaffold path. Realizes the emit half of `req-drive-from-inside`. *(depends on 1)*
3. **i5-m6-bs-selftest-stubs** — `selftest:stubs`: resolution order + clear failure, AGENTS self-contained, gitignore excludes the pointer. Wires `test-inside-launcher`, `test-inside-entry-surface`, `test-engine-loc-untracked`. *(depends on 2)*
4. **i5-m6-bs-roundtrip** — extend `selftest:workspace` to drive a bare workspace FROM INSIDE via the emitted launcher. Wires `test-drive-from-inside` (the killer). *(depends on 3)*

The non-build M6 subtasks (`detailed-design-complete` via `coverage:designs-realized`, `verification-green` via `coverage:tests-pass`, plus the review subtasks) roll up after the steps. The four current design-holes close as steps 1–2 land their `design:` markers.

**Lower bound applied.** An earlier draft split step 1 into three per-file steps (launcher / AGENTS / gitignore); the `.gitignore` step was three lines and none was worth resuming alone, so they were folded into one. Codified in engage.md's M6 guidance.

## Built  → i5-m6-build (+ children)

1. **stub-templates** — `insideStubFiles(proj)` in the engine returns the three templates (launcher `quack.cmd` with internal→pointer→env resolution + clear failure, the `AGENTS.md` entry surface, the `.gitignore`), carrying the `design:` markers for `req-inside-launcher`, `req-inside-entry-surface`, `req-engine-loc-untracked`.
2. **emit** — `quack start stubs [target]` writes the stub set into a workspace (default: the current one); `design:` marker realizes `req-drive-from-inside`.
3. **selftest:stubs** — pure static guard: resolution order + clear failure, AGENTS self-contained (branded launcher, no `product/quackitect` path), gitignore excludes the pointer. Wires the three unit tests.
4. **roundtrip** — `selftest:workspace` now emits a bare workspace, points the gitignored pointer at this engine, and drives it FROM INSIDE via the launcher (time-boxed; empty workspace so no tests-pass recursion). Wires `test-drive-from-inside`.

## Detailed design complete  → i5-m6-detailed-design-complete  *(derived: coverage:designs-realized — DONE)*

All four requirements now have realized code (design markers); the earlier design-holes are closed.

## Verification green  → i5-m6-verification-green  *(derived: coverage:tests-pass — DONE)*

Full selftest is 25/25 green (adds `selftest:stubs`); `status` returns without recursion.

## Internal quality / impl risks  → i5-m6-internal-quality-ok, i5-m6-impl-risks-acceptable

Launcher is a plain `.cmd` (Windows-first; other-OS deferred and logged). `selftest:workspace` spawns a time-boxed subprocess on an EMPTY temp workspace per status — bounded, cannot hang, cannot recurse.

## Verdict

**Verify** — every requirement realized and marked; 25/25 selftests green; the drive-from-inside roundtrip runs automatically. **Validate** — the build matches the M4 architecture and the M5 spike keeper exactly (launcher shape, emit, roundtrip). **Red-team** — the freeze risk (a selftest hook computing StatusMap → recursion) was hit and fixed by making `selftest:report-verdict` pure and time-boxing the roundtrip; the residuals the spike named are now owned by `selftest:stubs`. **Pass** → gate blessed.
