---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
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
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
step: design/tests-red
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [io-modules-own-their-names]
record:
  - step: design/draft
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: f21b27ff6cb75cde48977ddbd22c65f4d2fc72e1
    hash_after: f21b27ff6cb75cde48977ddbd22c65f4d2fc72e1
    inputs:
      - name: ask
        hash: 3b3ed3a2827d6a53
        size: 796
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
---

# Ask

A module declares a projection of `files/` with a glob, a codec and a kind, per [[spec/design_output/model#everything-on-disk-mirrors]]. The kinds `loaded`, `saved` and `dump` stand. The config, the plan and the holds become loaded projections, and each codec keeps one contract suite.

The codec is then the one code knowing a file format. A write goes back one way, through `disk`, so no module writes a file past it.

- `go test ./...` from the root passes
- each codec's suite round-trips every committed file of its glob, byte for byte
- a case writes through `disk` with a stale revision, and reads the refusal
- a case restores a saved file with a removed name, a changed type and a new name
- a case dumps a prefix with `quack dump`, and nothing reads it back
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The draft takes seven pieces. Each keeps to the model section on mirrors.

1. `src/q/projection.go` adds the kinds as a type `Mirror`, with `Loaded`, `Saved` and `Dump`, since `Kind` names a fault already.
2. It adds `Codec[T]`, an interface with `Parse` and `Serialize` over bytes.
3. `ProjectIn[T](c, name, glob, codec, kind, def)` registers a family `<name>/<path...>`. For `Loaded`, the store runs it per key when `files/<key>` moves, and the value is the parse of that file. A path outside the glob answers nothing.
4. `Store.Run` takes a concrete key of such a family, so a scheduler run and a case reach one file.
5. `src/q/codec.go` holds `JSON`, an order-keeping JSON codec. It parses into ordered nodes, keeps each number literal, and serializes with two spaces and a closing newline, as the JavaScript writes the files today. It lives in `q`, because `onlyq` lets a module import `q` alone.
6. `Saved` restores once at start through `Store.Restore(bytes)`, over a JSON map of name to type and value. It skips a name nobody registers, refuses and reports a changed type, and leaves a missing name at its built-in value. `Store.Save(prefix)` answers the bytes, and the saved file stands under `.se/state/`.
7. `Dump` answers `Store.Dump(prefix)`, and `quack dump <prefix>` writes it under `.se/dump/` through `disk`. No projection covers that folder, so nothing reads it back.

A write goes one way. `files.Write` gains `Read`, the hash of the file its writer read, and `disk` refuses a write where the file hash moves since. The fake disk refuses the same way.

The loaded projections:

- `src/modules/config`: `spec/config/level0.json` and `.se/.runtime/config.json`, as `config/`
- `src/modules/queue`: `.se/.runtime/plan.json`, as `queue/`
- `src/modules/holds`: `.se/.runtime/hold/*.json`, as `hold/`

`spec/wiring.yaml` names the three instances, and the watch adds `.se/.runtime` and its hold folder by name, since it stands off dot folders under `.se`.

The round-trip suite stands in `src/quack`, the one package that may read the tree. It runs every codec over every file `git ls-files` names under the glob of each projection it wires, and over the local files where they stand. A module test cannot read the disk.

Assumed: `the-config-module-resolves-layers` builds the resolver over `config/`, and `tickets-becomes-a-module` brings the markdown codec. This ticket builds the JSON codec alone.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/store.go: Run, which takes a key of a projected family
src/modules/files/disk.go: Accept and disk.Write, which read the revision
src/modules/files/watch.go: watch.adds, which adds the runtime folders
src/quack/main.go: modules and load, which take the three projection modules
src/index/main.go: asked, which takes the verb dump
src/index/door.go: the handler that answers dump

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: `go test ./...` from the root
src/quack/codec_test.go: TestEveryCodecRoundTripsItsCommittedFiles
src/q/codec_test.go: TestJSONRoundTripsItsEdgeCases
src/modules/files/files_test.go: TestAStaleWriteIsRefused
src/q/projection_test.go: TestASavedFileRestoresNameByName
src/q/projection_test.go: TestALoadedProjectionParsesItsFile
src/quack/dump_test.go: TestADumpIsReadByNothing
RUNME.sh: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/projection.go
src/q/projection_test.go
src/q/codec.go
src/q/codec_test.go
src/q/store.go
src/modules/files/disk.go
src/modules/files/watch.go
src/modules/files/files_test.go
src/modules/config/config.go
src/modules/config/config_test.go
src/modules/queue/queue.go
src/modules/queue/queue_test.go
src/modules/holds/holds.go
src/modules/holds/holds_test.go
src/quack/main.go
src/quack/codec_test.go
src/quack/dump_test.go
src/index/main.go
src/index/door.go
spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened `Store.Run`, `Store.owner`, `files.Accept`, `watch.adds`, `load` in `src/quack`, `asked` in the index, and the plan, hold and config files, and checked each claim there
I grepped the callers of `Run`, `Accept`, `Write` and `load` across `src`, and the list names each the change touches
each done_when line names its test above, or the command `go test ./...` or `./RUNME.sh check`

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
