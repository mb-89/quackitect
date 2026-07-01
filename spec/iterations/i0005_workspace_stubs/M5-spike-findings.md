# M5 — Prove the riskiest unknowns (i0005_workspace_stubs)

Evidence for the M5 subtasks. Each section is the referent for one gate.

## Design is buildable  → i5-m5-design-buildable

The design decomposes into small pieces with no engine core rework:
- Extend `quack.cmd` with the B→A fall-through (the internal case already exists).
- Add a committed `AGENTS.md` stub (static text).
- Add a `.gitignore` rule for `.quack/engine.local` and any vendored engine.
- Extend `selftest:workspace` (the roundtrip) to drive a bare workspace from inside; add `selftest:stubs` for the unit-level checks.

M3 feasibility already proved the two load-bearing facts (launcher internal case works today; `quack resolve` gives path-free prompts).

## Riskiest assumptions validated by evidence  → i5-m5-riskiest-validated  *(killer)*

**Spike:** `.quack/spikes/i5-inside-drive/ws/` — a throwaway BARE workspace (product+spec+`.quack/`, no engine) with:
- a committed launcher `quack.cmd` implementing internal → `.quack/engine.local` → `QUACK_ENGINE`;
- `.quack/engine.local` (gitignored) holding the path to the real engine binary;
- `.gitignore` excluding `.quack/engine.local` and any `.quack/engine/`.

**Run (from inside `ws`):** `cmd /c "quack.cmd status"` →
```
0 gates | 0 suspect | 0 trace-content
---exit:0---
```

**What it proves (R1, R2):**
- **Drive-from-inside works** — the launcher, run from within the workspace, forwarded to the resolved engine, which walked up from cwd to the workspace's own `.quack` marker: the board is the BARE workspace's own (empty), not quackitect's 175 gates. `ROOT` = the workspace, `ENGINE` = wherever the binary lives.
- **Resolution order is real** — internal engine absent, so path B (the gitignored pointer) resolved the engine. Clean exit 0.
- **No engine path in version control** — the only reference to the engine lives in `.quack/engine.local`, which `.gitignore` excludes; no engine binary in the tree.

Residual: the "no engine found → clear message" failure path and the env-var (A) fallback are exercised by `selftest:stubs` in M6.

## Spike recorded, keeper captured  → i5-m5-spike-recorded

Spike lives at `.quack/spikes/i5-inside-drive/` (gitignored). Keeper captured backward into the M4 architecture (`adr-engine-resolution`) and the M6 build plan: the launcher shape (label-goto resolution, `set /p` pointer read) is the design to realize in `quack.cmd`, and the run becomes the `selftest:workspace` extension.

## Verdict

**Verify** — the spike ran green from inside a bare workspace via the resolved engine. **Validate** — it demonstrates the M1 success criteria 1 & 2 directly (inside `.\quack status`; no engine path in VC). **Red-team** — the untested branches (A fallback, clear-failure message) are named and assigned to `selftest:stubs` in M6, not hand-waved. **Pass** → gate blessed.
