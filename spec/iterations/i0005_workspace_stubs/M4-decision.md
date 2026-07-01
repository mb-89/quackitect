# M4 — Decide the architecture (i0005_workspace_stubs)

Evidence for the M4 subtasks. Each section is the referent for one gate.

## Architecture stated  → i5-m4-architecture-stated

A bare workspace reaches its engine through a **committed root launcher** (`quack.cmd`) that resolves a `quack.exe` in a fixed order and forwards all args:
1. **Internal** — `%~dp0.quack\engine\quack.exe` if it exists (self/dogfood).
2. **B — gitignored pointer** — `%~dp0.quack\engine.local` (contents = path to a `quack.exe`), if present.
3. **A — env var** — `%QUACK_ENGINE%`, if set.
4. Else exit with a clear message.

Plus a committed **`AGENTS.md` stub** (drive via `.\quack`, load prompts via `quack resolve` / `quack guides`) and a **`.gitignore`** excluding `.quack/engine.local` and any vendored engine. The engine location lives only in gitignored/machine-local places. The engine itself is unchanged. See `adr-engine-resolution`.

## Choice traced  → i5-m4-choice-traced

| Criterion | How the choice satisfies it |
|---|---|
| Out of VC | Location only in gitignored `.quack/engine.local` or `QUACK_ENGINE`. |
| Drives from inside | Committed root `quack.cmd`; no `--base`. |
| No engine copied in | Launcher resolves; nothing binary committed. |
| Portability | Plain `.cmd`, no symlinks. |
| Simplicity | Reuses the existing launcher shape; one optional pointer file + one gitignore rule. |

Internal → B → A dominates the rejected C/D on the High criteria.

## ADR recorded and traced  → i5-m4-adr-recorded  *(derived: coverage:adr-traced — DONE)*

- `adr-engine-resolution` addresses `req-inside-launcher`; adjudicated by the human (the internal → B → A order was the human's call). C and D rejected with reasons.

## Verdict

**Verify** — the ADR captures exactly the decided order (internal → B → A, no C, no D) and traces to a requirement; coverage green apart from the expected M6 design-holes. **Validate** — realizes `uc-drive-from-inside` without touching the engine or the `--base` path; the dogfood case is preserved (internal-first). **Red-team** — rejections justified in the ADR; only residual is a machine with none of internal/B/A, handled by the launcher's clear failure. **Pass** → gate blessed.
