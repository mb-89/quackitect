# M3 — Candidate architectures (i0005_workspace_stubs)

Evidence for the M3 subtasks. Each section is the referent for one gate.

## Alternatives elaborated  → i5-m3-alternatives-elaborated  *(killer)*

How a bare workspace reaches its engine:
- **A. Env var** (`QUACK_ENGINE`) — zero files, nothing in VC; but fails if unset, easy to forget.
- **B. Gitignored pointer** (`.quack/engine.local`) — discoverable in-repo, per-clone override, nothing machine-specific committed.
- **C. Engine on PATH** — simplest launcher; but global mutation, ambiguous which engine, no per-workspace pinning.
- **D. Committed relative link** — no setup; but **violates** the "no engine path in VC" constraint and is non-portable (Windows symlinks).
- **Internal** — the workspace's own `.quack\engine\quack.exe` if present (the self/dogfood case, as `quack.cmd` does today).

## Criteria weighted  → i5-m3-criteria-weighted

| Criterion                          | Weight |
| ---------------------------------- | ------ |
| Engine path out of version control | High   |
| Drives from inside (no `--base`)   | High   |
| No engine copied in                | High   |
| Portability (Windows-first)        | Medium |
| Simplicity / low setup             | Medium |

## Feasibility checked  → i5-m3-feasibility-checked

Verified live against the existing engine:
- The current `quack.cmd` already implements the **internal-engine** case (`%~dp0.quack\engine\quack.exe %*`); adding B/A fall-through is trivial `.cmd` logic — no engine change.
- `quack resolve method/prompts/engage.md` returned a resolved absolute path → path-free prompt loading works from inside a workspace.

## Verdict

**Verify** — the chosen order (internal → B → A) satisfies every High criterion and is buildable on the existing engine. **Validate** — preserves the dogfood case (internal-first) while enabling the bare-workspace case; nothing regresses. **Red-team** — C rejected (global/ambiguous), D rejected (leaks path to VC); residual = a machine with none of internal/B/A, handled by the launcher's clear failure message. **Pass** → gate blessed.
