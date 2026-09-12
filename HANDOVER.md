---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The server stands, built and wired into every door.

| the piece | where | what proves it |
|---|---|---|
| the module, no cgo and no dependency | `src/lsp` | `go test ./...` passes, and a build takes under a second |
| the note shape and the placeholders | `schema.go`, `note.go`, `yaml.go` | `schema_test.go`, sixteen tests |
| the names | `names.go` | `names_test.go` |
| the rules over two files | `tree.go`, `install.go`, `private.go` | `tree_test.go`, thirteen tests |
| the stdio front | `lsp.go` | `lsp_test.go`, over `initialize`, `didOpen` and `didChange` |
| the port and the standing file | `serve.go` | `serve_test.go`, where a second caller finds the first server |
| the one-shot verb | `main.go` | `se-lsp check <path>` prints the findings as JSON |
| the build beside the index | `src/scripts/install.sh` | `./RUNME.sh` builds both, sharing no step |
| the survey and `doctor` | `lib/tools.js` | the `se-lsp` row names the path and `0.1.0` |
| `lint` asks the server | `src/scripts/cli.js` | one list carries Vale, Biome and the server |
| the editor starts it | `src/extension` | `test/level0/lsp.test.js` |
| what it holds | [[spec/design_output/lsp]] | the note the code points at |

The module hand-rolls the JSON-RPC. `go.lsp.dev/protocol` costs a module graph
for forty lines of framing.

The port carries `check`, `sweep`, `standing` and `stop`.

- a caller reads `.se/lsp.json` and asks that port
- a caller meeting a stamp apart asks that server to stop
- it then starts its own, the way the index door does

The checks carry over from the JavaScript, rule for rule. A sweep over a tree
of broken fixtures answers what the JavaScript answers, line for line.

The JavaScript stays in place, the way the brief asks.

- the write door keeps calling it
- `lint` falls back to it where the server stands unbuilt
- `.se/scripts` holds no script of mine, because every one-off runs inline

# What waits

| the thing | where | why it waits |
|---|---|---|
| the stop pool rule | `lib/tree.js`, `stopFolderIsData` | it drives the JavaScript pool over a synthetic rule file |
| the stale projection | `lib/projection.js` | the wanted text comes out of two generators, thirty kilobytes of JavaScript |
| the paths from the index | `src/lsp/tree.go` | `Glob` caps at five hundred paths and orders by time |
| the node version | `surveyFindsNode` | the rule reads the node running the sweep, and this server asks `node --version` |
| the write door | `lib/apply.js` | the brief leaves it on the JavaScript for a later branch |

The first two keep `lint` calling the JavaScript for one rule. Read the line in
`cli.js` under [[spec/design_output/lsp#one-checker-every-front-asks]], which
says so.

Two choices a later branch revisits:

- the document selector names markdown and the four files a two-file rule reads
- `se-lsp` joins the survey list, so `doctor` prints its row with no code

# The retro

Three things surprise me.

- the write door refuses a shell redirection into any tracked path
- a fixture therefore lands through Python, or through a Go test
- the `CodeComment` rule reads one line, so a two-line prose comment breaks it
- the voice rules hold a commit message, so the harness footer meets `Private`

Two dead ends.

- `go.lsp.dev/protocol` reads well, and costs a module graph for forty lines
- the index port answers the walk, and `Glob` caps it at five hundred paths
- so `git ls-files` stays the source of the paths a rule walks

One thing goes better than I expect. The differential run is the whole proof.
Drive the JavaScript and the Go over one broken tree, sort both, and diff. It
names every porting slip in one pass, and the two agree now.

# How a person starts it

A person on a fresh clone follows these, one action each.

1. Clone the tree, and open a terminal in it.
2. Run `./RUNME.sh`. It installs what the tree needs and builds the server.
3. Read `building the language server` in that output. The binary lands at `.se/bin/se-lsp`.
4. Run `./RUNME.sh doctor`. The `se-lsp` row names that path and the version `0.1.0`.
5. Open the folder in VS Code, where `code` stands off the PATH.
6. Open `HANDOVER.md` in the editor.
7. Change `status` in the frontmatter to `maybe`.
8. Read the Problems panel. `se-lsp` draws `Schema.status` on that line.
9. Read its message, which names `todo, held, done`. Type `todo` back, and the line clears.
10. Run `./RUNME.sh lint .` for the same findings on the command line.
