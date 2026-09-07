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

## Which box you are on

`node util/cage/host.mjs --say` answers it.

A cloud box is handed `util/cage/cloud-runner.md` by the wake at session start,
and that card is the instruction. Read it. A desk is told in one line and never
receives the card, so a desk following it goes looking for a lane that was never
missing.

## The branch you are on is your instruction

A branch named `group/<name>` narrows the queue to `bucket: <name>`. It is
derived every time the filter is read and never stored, so nothing is typed and
nothing is configured: a box cloned onto `group/tests` is handed the tests
bucket and nothing else, and every pull says which branch narrowed it. A filter
a person set outranks the branch. An ordinary branch narrows nothing.

- `se_start` first. Nothing refuses you until an engine is up, so use the
  harness's own Write, Edit and Bash until one answers.
- `se --land` before you work. A group box is refused work until it has landed.
- `se --group <name>` puts this tree on that branch. `se --branch-group <name>`
  makes the branch for a bucket and pushes it without moving this tree, which is
  what the Branch button in the work editor presses.
- Push each time you finish something. Nothing you write survives except what
  you push.

## Committing

`sh util/git/land.sh "<message>" <path> ...` is the push door. It copies the
named files onto a fresh worktree at the tip and commits them there, so a clone
that is behind does not re-add what the tip already carries. A path this tree no
longer holds is removed there. `util/git/cherrypush.sh` does the same for a
commit. Never merge in the shared tree: seventeen of a hundred and fifty-nine
merges on this branch differed from both their parents.

## Building and running

- `sh util/checks/battery.sh` runs every check. It is the one command that says
  whether the tree is sound.
- `se --swap` rebuilds the engine and hands over to it. **This is the only way
  to rebuild it.** A plain `go build` on this box produces a 15 MB binary with
  `CGO_ENABLED=0`, and go-sqlite3 is then a stub: the indexer cannot open the
  index, the model socket never opens, and the engine comes up looking healthy —
  ready, guarded, beating — while `--ping` says nothing is running and the
  battery's `engine up` step fails. The real build is 21 MB. This line used to
  read `go build -C src/engine -o ../../.bin/se.exe .`, which is that stub, and
  it cost an hour.
- With no engine running there is nothing to swap, and then it is the
  installer's build: `CC="<the zig in AppData/Local/quackitect/tools>/zig.exe cc"
  CGO_ENABLED=1 GOFLAGS=-tags=sqlite_fts5 go build -C src/engine -o
  ../../.bin/se.exe .`. `util/setup/archive.go` is where those three come from.
- `se --project` rewrites the projections after a guidance edit.
- `.bin/se-mcp --tools > util/cage/tools.json` rewrites the tool list the cold
  door answers from, after a change to `src/mcp/lane.go`. `mcp-tools` says
  when it is stale.
- `./RUNME.sh --diagnose` writes a diagnosis of this box under
  `.se/scratchpad` and prints it. On a tree with nothing built,
  `node util/cage/diagnose.mjs` is the same call.
