# Quackitect

The duck that went to engineering school — a human-driven gate ledger for systematic
engineering. The agent FILLS checks; a human ADJUDICATES the gates; the result is an
auditable, change-aware record of a project's design. This repo **dogfoods itself**.

## Layout
```
README.md  AGENTS.md  DASHBOARD.md  pyproject.toml  uv.lock
spec/      the thinking — decisions/ = the design as a Merkle DAG of checks
product/   what ships — quackitect/ (engine + cli + method/), zipped by ship
.quack/    hidden: attest.json (durable) · notes/ (backlog) · logs · evidence/+out (cache)
```
The shipped zip is ephemeral output (`.quack/out/`), never kept in the repo.

## Command surface (default-closed, sebot-style)
Three intents — slash-commands; methods live in `product/quackitect/method/prompts/`:
```
/note                      capture an idea
/engage  start|next|ship   plan -> walk -> output an iteration  (reaches triage, defer, retire)
/review  readout|retro|report   assess & look back (retro opens with the field-feedback question; report renders the HTML)
```
Determinizer lane — deterministic CLI:
```
uv run quack status [id] | why <id> | bless [--all|<id>] | note "..." | report [--out F] | ship
```
`AGENTS.md` tells an AI how to drive it.

## The check model
Each check is a markdown node with a load-bearing `statement`, `depends_on` edges, and a `class`:
- **judgment / review** — a human blesses it (a signed attestation). On any input change it goes
  **SUSPECT** (not silently open); one `bless` re-attests it. Killer checks are always gates.
- **executed** — a `verify:` command the engine runs and caches content-addressed in
  `.quack/evidence/`; the machine adjudicates, re-running only when inputs change.
A node's hash folds in its upstream hashes (Merkle DAG), so a change ripples downstream. Only
load-bearing fields are hashed, normalized — editing a `## Rationale` body or whitespace flags nothing.

## Versioning
Each version is an iteration = a git branch/worktree; `.quack/notes/` is trunk-owned.
**Run `git init` once on your machine** (the sandbox couldn't) — `.gitignore` is ready.

## Status (v0)
Real: the engine (judgment + executed, suspect/bless, Merkle fold, evidence cache), the
determinizer CLI, the slash-command surface + AGENTS.md, the method skeleton, the dogfood design
graph. Next: richer engage/triage/retro automation, executed checks beyond the self-test, the
rebuildable index, a first fully-authored type x rigor.

## Use it on itself
`uv run quack status` — the design board. Edit a decision's `statement`, watch the cone go suspect,
`bless` to re-attest. `/engage start` to plan the next iteration.
