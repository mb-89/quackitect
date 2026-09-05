# AGENTS.md

This file is yours. The engine does not write it and does not read it.

The standing layer — the rules every agent gets on every turn — is projected
from `doc/guidance` into the harness's own system prompt:
`.claude/output-styles/quackitect.md` for Claude Code, and
`.github/copilot-instructions.md` for Copilot. `se --project` writes both, and
`util/projections.json` says which files they come from.

So put here what is about THIS project and is not a rule: how to build it, where
the odd thing lives, what a newcomer keeps getting wrong. Editing it changes
nothing about how the engine behaves.

## Building and running

- `sh util/checks/battery.sh` runs every check. It is the one command that says
  whether the tree is sound.
- `go build -C src/engine -o ../../.bin/se.exe .` rebuilds the engine.
- `se --project` rewrites the projections after a guidance edit.
- `.bin/se-mcp --tools > util/cage/tools.json` rewrites the tool list the cold
  door answers from, after a change to `src/mcp/lane.go`. `mcp-tools` says
  when it is stale.
- `./RUNME.sh --diagnose` writes a diagnosis of this box under
  `.se/scratchpad` and prints it. On a tree with nothing built,
  `node util/cage/diagnose.mjs` is the same call.
