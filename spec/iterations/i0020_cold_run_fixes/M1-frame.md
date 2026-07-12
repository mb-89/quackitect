# M1 - Frame · i0020_cold_run_fixes

## Problem agreed  → i20-m1-problem
A cold, memory-less run of the whole chain (clone → Zwiftbot vehicle via `start init` → Benjamin stub via `start stubs` → M1/M2 walked to owner blesses) surfaced ten field notes, each a reproduced gap, now archived with disposition (data home `notes/archive/NOTE-20260712-*`):

1. **go-bin shim unwired** - vehicle launchers call bare `go`; bootstrap + ratchet fail on a machine with uv/go-bin but no native Go; `dependencies.md` path drift (`product\tools` vs `.quack\tools`).
2. **defer/retire not ported** to the Go engine - documented reaches fail; scope tailoring was a by-hand checklist edit.
3. **Compose toil** - systematic `start` seeds only `iteration.md`; the agent hand-transcribes the whole milestone checklist.
4. **Hand-authoring toil** - `mint`/`apply` not serving vehicles for typed nodes/edges; ~40 files hand-written in Benjamin.
5. **Edges default split** - `start stubs` defaults `edges=connections`, `start init` does not; compose-reference calls frontmatter "the default" while JSONL is the intent.
6. **Stub template pollution** - `ex-*` example nodes + example connections flip coverage red and hard-refuse the strict graph once real content exists.
7. **Vehicle lint schema-home** - resolves the dogfood path instead of vehicle→engine.
8. **NFR tracing** - `req-traced` demands req→use-case; the owner's qualities-need pattern needs the ISO-quality-use-case convention canonized.
9. **Vehicle/overlay concept** buried in `integrate.md`; no guard against composing a driven project inside the vehicle's own spec (happened; Benjamin relocated).
10. **`project_types/classes/` naming smell** - stakeholder classes masquerade as a project type.

**Scope:** fix the batch small; cheap extras ride (README walkthrough-link fold-in). The seed-checklist fix (3) ships a cheap slice or defers explicitly. Success = each note fixed-and-verified or deferred-with-reason at M7; selftest green.

## Review
Verify: all ten notes reproduce from this session's transcript and archived files. Validate: matches the owner's directive ("fix them now, small batch, planned work shifts down" - `i0020_field_ux` → `i0021`). Red-team: the batch risks scope creep via fixes 3/4 (feature-sized); both carry an explicit cheap-slice-or-defer clause.

**Verdict:** frame complete; the killer problem check and gate go to the owner.
