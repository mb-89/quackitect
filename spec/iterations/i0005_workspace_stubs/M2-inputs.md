# M2 — Requirements (i0005_workspace_stubs)

Evidence for the M2 subtasks. Each section is the referent for one gate.

## Inputs captured  → i5-m2-inputs-captured

- **Context:** the engine drives external workspaces via `--base`; it exposes `quack resolve <rel>` and `quack guides` for path-free resource access. A bare workspace has no in-repo entry surface.
- **Prior inputs:** the two backlog retro notes (bare-workspace-stubs, roundtrip-test-uses-feature); the existing `--base` mechanism; `quack resolve` for prompts.
- **Use cases:** drive a bare workspace from inside; AI reads the `AGENTS.md` stub; roundtrip test drives from inside.

## Stakeholder coverage — no role left out  → i5-m2-stakeholder-coverage

- **Human operator** — drives from inside via `.\quack`.
- **AI agent** — reads the `AGENTS.md` entry surface; loads prompts via `quack resolve` / `quack guides`.
- **Version control** — must not carry the engine path or binary.
- **Engine maintainer** — unaffected; the `--base` path is untouched.

## Requirements traced  → i5-m2-requirements-traced  *(derived: coverage:req-traced — DONE)*

Reused need `need-workspace-drive`; new use case `uc-drive-from-inside` refines it. Every requirement refines the use case:
- `req-inside-launcher`, `req-inside-entry-surface`, `req-engine-loc-untracked`, and killer `req-drive-from-inside`.

## Requirements verifiable  → i5-m2-requirements-verifiable  *(derived: coverage:req-has-test — DONE)*

Each requirement has a verifying test: `test-inside-launcher`, `test-inside-entry-surface`, `test-engine-loc-untracked` (all `selftest:stubs`), and `test-drive-from-inside` (extends `selftest:workspace`, killer). The four "no design" lint holes are honest design-holes, realized in M6.

## Verdict

**Verify** — `req-has-test` and `req-traced` both green; every requirement has a test and traces to a need. **Validate** — the requirements cover the M1 success criteria 1:1 (inside status, no engine path in VC, self-contained AGENTS stub, roundtrip test green). **Red-team** — R1/R2 pinned by `req-inside-launcher`'s fixed order and `req-engine-loc-untracked`; the killer's test closes "does it work from inside" at M7. **Pass** → gate blessed.
