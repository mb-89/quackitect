# Handover — Quackitect v0

_Written 2026-06-28. Read this first next session._

## What Quackitect is
A human-driven gate ledger for systematic engineering: the agent FILLS checks, a human
ADJUDICATES the gates, and the result is an auditable, change-aware record of a project's
design. It **dogfoods itself** — its own design lives in `spec/decisions/` as a Merkle DAG of
checks, and the `product/` engine walks that graph.

## Status: usable end-to-end
Everything below was verified through `uv`:
- `uv run quack status` → **17 checks, all green** (the design graph, all blessed).
- `status [id]` · `why <id>` · `bless [--all|<id>]` · `note "..."` · `next` · `gather <ver>` · `ship` all work.
- The three rigor checklists exist (`vibe`/`lean`/`systematic`), `gather` pulls the whole
  rigor floor-cascade + type-tree into one bundle for composition.
- `.git` is initialised (no commit yet — see below).

## Layout (the map)
```
README.md  AGENTS.md  DASHBOARD.md  HANDOVER.md  pyproject.toml  uv.lock
spec/decisions/   the design, as a dependency graph of checks (15 design + engine-selftest + 2 process)
product/quackitect/
  engine.py  cli.py            the determinizer (status/why/bless/note/next/gather/ship)
  method/prompts/              the verb methods: note · engage(start/next/refine/ship) · review · triage
  method/rigor/{vibe,lean,systematic}/checklist.md   the checklist TEMPLATES (the principle structure)
  project_types/default/guides/                       the always-on guidance (only `default` exists)
.quack/            hidden: attest.json (durable) · notes/ (backlog) · config.toml · evidence/+gather/+out (cache)
.claude/commands/  slash-commands (/note /engage /review) for an agent in the repo
```

## The model in five lines
1. A check = a node with a load-bearing `statement`, `depends_on` edges, and a `class`
   (judgment/review = human bless; executed = a `verify:` run). Hashes fold upstream (Merkle DAG).
2. Edit a load-bearing field → downstream checks go **SUSPECT** (not open); a human `bless` re-attests.
3. **rigor** holds the checklist templates (vibe⊂lean⊂systematic, a floor); **type** overrides.
4. `engage start`: retro → triage → migration → `gather` (collect ALL rigor+type source, any format)
   → the agent **composes** the concrete checklist into `spec/iterations/<v>/` → human blesses.
5. **refine** is the default in late phases: idea → spike in `.quack/spikes/` → capture the keeper
   backward into design input → the suspect DAG sizes the step-back. Field feedback = retro's first question.

## How to pick up (next session)
1. **Commit the baseline** (yours — the sandbox can't git this mount):
   `git add -A && git commit -m "quackitect v0"`
2. **Drive it on itself**: `/engage start` (or follow `product/quackitect/method/prompts/engage.md`).
   It will ask for the iteration's goal and gather the source for you to compose + bless.
   - The inbox has a couple of stray test-notes from the build — triage will surface them.
   - Rigor is set to `systematic` in `.quack/config.toml`; for incremental tooling work `lean`
     may be the honest call — let the plausibility check flag it.

## Candidate first iterations (pick one as the vision)
- **Harden v0**: real executed `verify` commands beyond the self-test; `note` auto-commit to trunk;
  the rebuildable index.
- **Author a first real project type** on top of `default` (e.g. a `tool/` type with overrides).
- Your own idea — throw it at `/engage start`.

## Open edges / honest gaps (none block use)
- **`note` doesn't auto-commit** to trunk yet (design says it should). Captures still work.
- **Composition is the agent's judgment step** (by design) — `gather` hands over the full source.
- **Executed `verify` portability**: the self-test uses `python3`; on a non-sandbox box you may
  prefer `python` or `uv run python`.
- **No iteration started yet** — `spec/iterations/` is created by the first `engage start`.
- **Index not built** — `status` recomputes fine without it at this scale; it's a v0 edge.

## Gotcha for whoever edits the code
The file-editing tools and the shell **diverged** on this mount once (Edit wrote truncated lines
onto the path `uv` reads, breaking a build). **Edit `engine.py`/`cli.py` through the shell**, and
after any code change run `python3 -m py_compile product/quackitect/*.py` and `uv run quack status`
to confirm. Clear stale builds with `rm -rf .venv product/quackitect/__pycache__` if `uv` runs old code.

## One-line truth
The machine (engine + suspect/bless + Merkle DAG + the command surface + the rigor templates +
gather→compose) is real and green; the next move is to USE it — `/engage start` on a real goal.
