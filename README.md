# Quackitect

The rubber duck that went to engineering school. A human-driven gate ledger for systematic engineering.

The agent FILLS checks. A human ADJUDICATES the gates. The result is an auditable, change-aware record of a project's design. This repo **dogfoods itself**.

## Layout
```
README.md  AGENTS.md  pyproject.toml  uv.lock
spec/      the thinking — decisions/ holds the design as a Merkle DAG of checks
product/   what ships — quackitect/ (engine + cli + method/), zipped by ship
.quack/    hidden — attest.json (durable) · notes/ (backlog) · logs · evidence/+out (cache)
```
The shipped zip is ephemeral output. It lives in `.quack/out/`. It is never kept in the repo.

## Command surface (default-closed, sebot-style)
Three intents. Each is a slash-command. The methods live in `product/quackitect/method/prompts/`.
```
/note                              capture an idea
/engage  start|next|refine|ship    plan -> walk -> output an iteration
/review  readout|retro|report      assess & look back
```
A deterministic CLI runs alongside them:
```
quack status [id] | why <id> | bless [--all|<id>] | note "..." | report [--out F] | ship
```
`AGENTS.md` tells an AI how to drive it.

## The check model
A check is a markdown node. It has a load-bearing `statement`, `depends_on` edges, and a `class`.

- **judgment / review** — a human blesses it. The bless is a signed attestation. On any input change the check goes **SUSPECT**, not silently open. One `bless` re-attests it. Killer checks are always gates.
- **executed** — a `verify:` command. The engine runs it and caches the result in `.quack/evidence/`, keyed by content. The machine adjudicates. It re-runs only when inputs change.

A node's hash folds in its upstream hashes. This is a Merkle DAG. So a change ripples downstream. Only load-bearing fields are hashed, and they are normalized first. Editing a `## Rationale` body or whitespace flags nothing.

## Versioning
Each version is an iteration. An iteration is a git branch or worktree. `.quack/notes/` is trunk-owned.
**Run `git init` once on your machine.** The `.gitignore` is ready.

## Use it on itself
Run `quack status`. That is the design board. Edit a decision's `statement`. Watch the cone go suspect. Run `bless` to re-attest. Run `/engage start` to plan the next iteration.
