# M7 — Validate and accept (i0005_workspace_stubs)

Evidence for the M7 subtasks. Each section is the referent for one gate.

## Meets the need  → i5-m7-meets-need  *(killer)*

`need-workspace-drive` → `uc-drive-from-inside` is satisfied. A bare workspace (product+spec+`.quack/`, no engine) is now drivable from inside its own folder via `.\<proj> …`, resolving an engine at runtime. Validated against the M1 success criteria:
1. inside `.\quack status` works — ✓ (live demo below + `selftest:workspace`);
2. no engine path in version control — ✓ (`.gitignore` excludes `.quack/engine.local`);
3. self-contained `AGENTS.md` entry surface — ✓ (`selftest:stubs`);
4. roundtrip test exercises it — ✓ (`selftest:workspace` drives from inside automatically).

## Killer use-cases demonstrated end-to-end  → i5-m7-killer-ucs-demonstrated  *(killer)*

**Live demonstration** (M7): `quack start stubs` emitted the stub set into a fresh bare workspace; the branded launcher drove it FROM INSIDE:
```
launcher: m7demo_1140165567.cmd
0 gates | 0 suspect | 0 trace-content
---exit:0---
.gitignore:2:.quack/engine.local
```
The engine resolved via the gitignored `.quack/engine.local` pointer; `ROOT` = the bare workspace (its own empty board, not quackitect's). Also demonstrated automatically every run by `selftest:workspace`.

## Acceptance obtained  → i5-m7-acceptance-obtained

The killer UC passes both live and in the automated roundtrip. Sign-off recorded here; the human delegated adjudication for this run (self-blessed) with the evidence docs as the audit trail.

## Validation gaps (RAID)  → i5-m7-validation-gaps

- **Gap (deferred):** the launcher is Windows-only (`.cmd`); a POSIX launcher for other OSes is out of scope (logged in M1).
- **Gap (deferred):** retrofitting existing bare workspaces (e.g. `adapter_obs_pola`) — explicitly deferred in M1 scope.
- **Cost (accepted):** `selftest:workspace` spawns a time-boxed subprocess per status; bounded, cannot hang or recurse.

## Verdict

**Verify** — the killer UC passes live and automatically; every M1 criterion met. **Validate** — meets `need-workspace-drive` for the from-inside case without touching the `--base` path. **Red-team** — the freeze failure mode was found and fixed; remaining gaps are the deliberately-deferred POSIX launcher and existing-workspace retrofit. **Pass** → gate blessed.
