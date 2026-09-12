---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The design input `spec/design_input/one-server-holds-the-shape.md` says what
the owner asks for. Read it first. It stands on the branch
`claude/friendly-brown-k6kohy` until the owner merges it, so take that branch
in where `work sync` leaves it absent.

The editor runs two language servers today, `vale-ls` over the prose rules and
Biome over the code. Four checks stand outside both, in JS under
`.claude/skills/level0/lib`:

- the note-shape checker, in `schema.js`
- the rules over two files, in `tree.js`
- the names, in `names.js`
- the stale projection, in `projection.js`

`./RUNME.sh lint` runs them on a walk, and the write door runs them at a
write. Nothing draws them as a person types.

# What waits

| the piece | where | proves it |
|---|---|---|
| the server, a Go module with no cgo | `src/lsp` | `go test ./...` passes, and `go build` takes seconds |
| the four checks, in Go | `src/lsp` | each one refuses the fixture its JS test refuses today |
| the stdio front | `src/lsp` | a client sends `initialize`, `didOpen` and `didChange`, and reads `publishDiagnostics` |
| the port and the standing file | `src/lsp`, and `.se/lsp.json` | a second caller finds the first server, and a stale file gives way |
| the one-shot verb | `se-lsp check <path>` | prints the findings as JSON in the shape `lib/refuse.js` prints |
| the build, beside the index | `RUNME.sh`, `install.sh` | `./RUNME.sh` builds both, and `doctor` names the server and its version |
| `lint` asks the server | `src/scripts/cli.js` | one list carries findings from Vale, Biome and the server |
| the editor starts it | `src/extension` | a departing note draws a red line as a person types |
| the start, in the handback | `HANDOVER.md` | a person follows the steps on a fresh clone |

# The four checks

Port them from the JS, test for test, and keep the finding in the shape every
door prints:

    { file, rule, line, column, message, severity }

The note-shape checker reads `spec/schemas/*.schema.yaml` with the YAML subset
`readYaml` reads, and nothing past it. The rules over two files walk the paths
git holds, and skip a draft under an underscore the way `isDraft` does. Ask the
index on its port where one stands, and walk the disk where none does.

Leave the JS in place on this branch. The door keeps calling it until the
server stands on every box, and a later branch takes it out.

# The server

`se-lsp lsp` speaks the language server protocol over stdio: `initialize`,
`textDocument/didOpen`, `textDocument/didChange`, `textDocument/didSave`, and
`textDocument/publishDiagnostics` back. A finding maps to a diagnostic with its
rule as the code and its message as the text. Hand-roll the JSON-RPC or take
`go.lsp.dev/protocol`, and say which in the handback.

`se-lsp serve` listens on loopback on a port the machine picks and writes
`{ port, pid, root, stamp }` to `.se/lsp.json`, the way the index door writes
`.se/index.json`. A caller reads the file and asks, and a caller whose stamp
disagrees asks that server to stop and starts its own.

`se-lsp check <path>` answers once and exits, for a box where no server stands.

# The build and the verbs

`RUNME.sh` builds the server into `.se/bin/se-lsp` beside the index, with
`go build` and no compiler flags, and the two builds share no step. `doctor`
names it and its version. `lint` asks the server through `check`, or through
the port where one stands. It merges the server's findings with Vale's and
Biome's into the one list it prints today.

# The editor

`src/extension` starts the server for every markdown file on activation, over
stdio, with `.se/bin/se-lsp lsp` as the command. Take `vscode-languageclient`
as the one dependency, and pin it. The extension stands linked into VS Code
through `./RUNME.sh` already, so a person needs no second install.

# What the handback says

End the handback with the steps a person takes on a fresh clone to see the
server stand. Write them as a numbered list, one action each. Name the one
command they type, the place the binary lands, what the Problems panel shows
on a departing note, and what `doctor` prints.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
