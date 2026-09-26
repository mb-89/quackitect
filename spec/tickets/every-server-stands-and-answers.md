---
kind: [[ticket]]
state: open
group: the-servers-and-views-hold
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: design/draft
---

# Ask

A level zero tool, the editor and `doctor` each tell a live server from a dead one. A server that restarts or runs stale code comes back with no hand running `./RUNME.sh serve` or reloading the window.

The host fetch cuts a `wait` post at its own timeout, and the plugin reads the cut as a dead server. A restart waits on open connections before it respawns. A Go binary rebuilds off its own folder alone. The language client gives up on `se-lsp` at its default cap.

- a `mcp__level0__wait` call on a live server running past the host fetch's timeout answers its signal or its cap
- that answer takes the place of the `no server answers` line, and a case in `test/level0/bridgehead.test.js` holds both
- `restart` in `src/bridge/server.js` starts the child once the port stops listening, with no wait on open connections
- a case in `test/level0/server-crash.test.js` holds a respawn with a connection open
- a change to a `.go` file under `src/lsp`, `src/index` or a package their `go.mod` replaces rebuilds that binary
- the rebuild keys on a source hash, as `sourceHash` in `src/scripts/tui-build.js` keys one, and a case under `test/level0` holds it
- the language client `startsServer` in `src/extension/editor.js` builds restarts `se-lsp` on every close, and a case in `test/level0/lsp.test.js` holds it
- `doctor` in `src/scripts/cli-check.js` prints an `se-lsp` row off a probe that starts `se-lsp lsp`
- that row names the diagnostics the probe gets back
- cases in `test/level0/doctor-hooks.test.js` hold a server that answers and one that exits
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Five parts, one a server, each in the file the ask names.

| part | file | what it does |
|---|---|---|
| the stamp | `.claude/skills/level0/hooks/level0.js`, `stamped` | marks a wait call with `since`, the moment of its first post |
| the cut | `.claude/skills/level0/hooks/level0.js`, `ask` | asks `/health` once where the host cuts a wait post after `CUT` |
| the post again | `.claude/skills/level0/hooks/level0.js`, `ask` | posts the wait again where the health answers, and answers the line where it answers nothing |
| the watch | `src/bridge/wait.js`, `watchOf` | keeps the watch a `since` begins on the box, and counts the cap from `since` |
| the older loop | `src/bridge/wait.js`, `waits` | ends once a later post takes the watch |
| the restart | `src/bridge/server.js`, `restarts` | ends the listen, drops the idle sockets, and starts the child on the next turn of the loop |
| the hash | `src/scripts/go-source.js`, `foldersOf` and `fresh` | hashes the folder and each local folder its `go.mod` replaces, through `sourceHash` |
| the stamp beside the binary | `src/scripts/go-source.js`, `stamps` | holds the hash the build reads |
| the install | `src/scripts/install.sh`, `lsp_here` and `index_here` | asks `fresh`, and the build writes the stamp |
| the client | `src/extension/lib/lsp.js`, `clientOf` | hands the client a handler whose `closed` answers `Restart` every time, after a second |
| the editor | `src/extension/editor.js`, `startsServer` | builds its client through `clientOf` |
| the probe | `src/scripts/lsp-probe.js`, `lspProbe` | runs `se-lsp lsp` with `initialize`, a `didOpen`, `shutdown` and `exit` on its input |
| the row | `src/scripts/cli-check.js`, `doctor` | prints `se-lsp lsp` with each diagnostic code the probe gets back, or a `warn` naming the exit |

Node's own close callback waits on every open connection, so `restarts` hands it none. `rebuilt` in `.claude/skills/level0/lib/tools.js` reads a `here` case asking `go-source.js fresh` as a rebuild. The design notes carry the parts. The wait and the restart stand in [[spec/design_output/level0]], and the build, the client and the probe in [[spec/design_output/lsp]].

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.claude/skills/level0/hooks/level0.js`, `seen`, which calls `ask` for every event
- `.claude/skills/level0/hooks/level0.js`, `reads` and `spoke`, which call `ask`
- `.claude/skills/level0/hooks/level0.js`, `streams`, which calls `ask`
- `src/bridge/server.js`, `TOOLS`, which routes `mcp__level0__wait` to `waits`
- `test/level0/wait.test.js`, every case calling `waits`
- `src/bridge/server.js`, `serve`, whose `restart` calls `restarts`
- `src/scripts/install.sh`, `here`, which calls `lsp_here` and `index_here`
- `src/scripts/install.sh`, `get_lsp` and `get_index`
- `.claude/skills/level0/lib/tools.js`, `rebuilt`, read by `test/contract/install.test.js` and `test/level0/tools.test.js`
- `src/extension/extension.js`, `startsServer`, which calls the door's `startsServer`
- `src/scripts/cli.js`, the `doctor` verb, which calls `doctor`
- `src/scripts/cli-check.js`, `doctor`, which calls `lspProbe`
- `src/extension/editor.js`, `startsServer`, which calls `clientOf`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/bridgehead.test.js`, "a wait the host cuts answers its signal on a live server, and the line on a dead one"
- `test/level0/wait.test.js`, "a wait posted again under its since carries on its watch, and counts its cap from the first post"
- `test/level0/server-crash.test.js`, "a restart starts the child once the port stops listening, with a connection open"
- `test/contract/wire.test.js`, "a restart frees the port while a connection stands open"
- `test/level0/go-source.test.js`, "a move in the folder or a replaced folder rebuilds the binary, and a test file moves nothing"
- `test/level0/tools.test.js`, "a here case asking go-source.js fresh names the binary that rebuilds"
- `test/level0/lsp.test.js`, "the client the editor builds starts the server again on every close, past its own cap"
- `test/level0/doctor-hooks.test.js`, "a language server that answers draws a row naming each diagnostic it sends"
- `test/level0/doctor-hooks.test.js`, "a language server that exits draws a warn row naming the exit"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file the table names stands opened, and each function the table names stands read
- the callers list names every caller of `ask`, `waits`, the restart and the two `here` cases
- the callers list names the callers of `rebuilt`, `startsServer` and `doctor` too
- the tests list names the case deciding each line of the ask, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bridgehead.test.js test/level0/wait.test.js test/level0/server-crash.test.js test/level0/go-source.test.js test/level0/tools.test.js test/level0/lsp.test.js test/level0/doctor-hooks.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Stubs of `restarts`, `clientOf`, `lspProbe` and the three `go-source.js` exports move each failure onto the assertions. Eleven cases stand red on their own assertion.

| case | what it sees red |
|---|---|
| the wait the host cuts | the plain `no server answers` line, because the hook reads the cut as a fall |
| the wait posted again | the quiet counts from the second post, and the cap runs its whole span again |
| the restart | the child waits on the open connection |
| the three `go-source.js` cases | no folder, no stamp |
| the here case | `rebuilt` reads `-newer` alone |
| the client | the fake client's own cap stops at four starts again |
| the three probe rows | an empty row |

The surprise: the probe that sends `initialized` waits five seconds on the sweep of the whole tree. The probe sends none, and answers in half a second.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the seven test files the design names, and the one contract file the restart reaches
- the probe runs over the fake process door, and the stamp over the fake disk
- the restart runs over a server shaped as node's
- each new case names the ticket as the approach it holds

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the ask names, the design notes, the install and `.vale.ini`
- `.vale.ini` lets `go-source.js` read its argument, as it lets `bundle.js`
- the probe reaches the process door, and the stamp the disk door, and each has a fake
- the restart reaches the wire door's server, and a contract case holds the real one
- every new comment points at [[spec/design_output/level0]] or [[spec/design_output/lsp]], and the design notes point at the files
- the design review stands unread, so no row of it stands fixed yet

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bridgehead.test.js test/level0/wait.test.js test/level0/server-crash.test.js test/level0/go-source.test.js test/level0/tools.test.js test/level0/lsp.test.js test/level0/doctor-hooks.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Every server comes back on its own now.

| server | what changes | why |
|---|---|---|
| level zero | the hook posts a cut wait again where `/health` answers, and the server carries on the wait under its `since` | the host cut a long wait, and the hook read the cut as a dead server |
| level zero | a restart starts the child once the listen ends | node's close waited on every open connection, a wait among them |
| `se-lsp` and `se-index` | each keys on a hash of its folder and every folder its `go.mod` replaces | a move in a shared package left the binary stale |
| the editor's client | every close starts `se-lsp` again, after a second | the client stopped at its own cap, and a rebuild ends the server |
| `doctor` | a `se-lsp lsp` row off a probe naming each diagnostic, or the exit | a person read no sign of a server that falls |

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the design names, the design notes, the install and `.vale.ini`
- every door the change reaches has a fake, and the wire a contract case beside it
- the wait's name stands in `wait.js`, and the hook spells it again with a pointer
- the hash stands in `tui-build.js`, and `go-source.js` calls it
- the design review stands unread, so no row of it stands fixed yet

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
