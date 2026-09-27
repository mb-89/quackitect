---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
depends_on: [go-code-shares-one-module]
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: 39a9a56ed9b59728a1b8f13dd7dfdc8fcb75375f
    hash_after: 39a9a56ed9b59728a1b8f13dd7dfdc8fcb75375f
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 4bd72d95f1cb7b742e64e651f042e2fcfc4e4567
    hash_after: 4bd72d95f1cb7b742e64e651f042e2fcfc4e4567
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 493b53e5b59804d053495b93482ab8fd30c7d455
    hash_after: 493b53e5b59804d053495b93482ab8fd30c7d455
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: ef21a01fbab56ab16a672af1e1316ebbf0133e1c
    hash_after: ef21a01fbab56ab16a672af1e1316ebbf0133e1c
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:123:1: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: implement/tests-green
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 46d321728e9478c41cf91c4613484bcb902363e4
    hash_after: 46d321728e9478c41cf91c4613484bcb902363e4
    answered:
      - name: tests
        exit: 0
        said: green, 67 test(s) pass in 5 file(s); green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:131:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

The index reads SQLite through the pure Go driver, with FTS5, and the C compiler and Zig leave the install. The change replaces [[spec/design_output/index#the-compiler-it-needs]], and [[spec/rationales/the-index-drops-cgo]] argues it.

A box builds the index with Go alone, as one static binary for Linux and Windows. Without it every box carries a C compiler.

- `CGO_ENABLED=0 go test ./...` from the root passes
- `grep -ci zig src/scripts/install.sh` answers 0
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The index opens SQLite through `modernc.org/sqlite` at `v1.46.1`, the last release asking for Go 1.24. Every later release asks for 1.25. A scratch build on this box ran an FTS5 table, a `MATCH` and `bm25` with `CGO_ENABLED=0`, and each answered.

| the part | what changes |
|---|---|
| the root `go.mod` | takes `modernc.org/sqlite v1.46.1`, and `github.com/mattn/go-sqlite3` leaves |
| `src/index/index.go` | imports the pure driver and opens `sqlite`, with the same journal, busy timeout and sync settings, each written as a `_pragma` |
| `src/scripts/install.sh` | builds the index with `CGO_ENABLED=0`, and the compiler probe, the Zig download and the Zig version leave |
| `src/scripts/cli-go.js` | `goEnvOf` answers `CGO_ENABLED=0`, and the Zig and the FTS5 tag leave |
| the index note | its compiler chapter says the index builds with Go alone, and keeps its heading so every pointer resolves |
| the rationale | its last chapter says where the driver stands |

The schema, the queries and the ranking stay as they stand, so the search answers as it did.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/index/index.go` `Open` and `dsn`
- `src/scripts/install.sh` `get_index` and `get_zig`
- `src/scripts/install.sh` `working_compiler` and `compiler_here`
- `src/scripts/cli-go.js` `goEnvOf`
- `src/scripts/cli-check.js` `goHolds`, a caller of `goEnvOf`
- `src/scripts/work-test.js` `testVerb`, a caller of `goEnvOf`
- `spec/design_output/index.md` the compiler chapter, and `spec/rationales/the-index-drops-cgo.md` its last chapter

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/index/index_test.go` `TestTheIndexOpensWithoutCgo`, which opens the index and ranks a line search with `bm25`
- `test/level0/go-tests.test.js` "the run takes no C compiler and no tag"
- `test/level0/test-verb.test.js` "a named test file runs under the check's spawn tally", asserting `CGO_ENABLED=0`
- `test/contract/install.test.js` "the install downloads no Zig", which decides the second done line
- `CGO_ENABLED=0 go test ./...` from the root, which decides the first
- `./RUNME.sh check`, which decides the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `index.go`, the install's compiler lines, `cli-go.js`, the index note and the rationale stand opened
- the callers come off a search for `zig`, `sqlite_fts5`, `CGO_ENABLED` and `sqlite3` over the tree
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- the-compiler-leaves-every-caller: take Zig out of `BORROWED` in `src/scripts/work-review.js` and its row in `test/level0/review.test.js`. Also move the fixture at `test/contract/tree.test.js` off the Zig probe. The callers list names none of the three.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/go-tests.test.js test/level0/test-verb.test.js test/contract/install.test.js test/level0/review.test.js test/contract/tree.test.js src/index

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Three node cases fail on their own assertion. `TestTheIndexOpensWithoutCgo` fails under `CGO_ENABLED=0` on the stub the old driver builds, and passes under the tag today. The review case and the survey fixture drop the compiler, and each passes on both sides. They answer [[spec/tickets/the-compiler-leaves-every-caller]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the files the draft and its review name
- the disk and the process take fakes, and the index test opens a real file
- each new case carries a comment pointing at the index note
- each fact points at the index note
- the review row stands answered in the review and survey cases

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft and its review name, and `sqlite` joins the dictionary
- the disk and the process take fakes, and the index test opens a real file
- the index note's compiler chapter names the parts, and the code points at it
- the pin stands in `go.mod` alone, and the note points there
- the review row stands fixed in the review list, its test and the survey fixture

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/go-tests.test.js test/level0/test-verb.test.js test/contract/install.test.js test/level0/review.test.js test/contract/tree.test.js src/index

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The index builds with Go alone, so a box needs no C compiler.

| the part | what changes |
|---|---|
| `go.mod` | the pure driver at `v1.46.1` stands in, and the cgo driver leaves |
| `src/index/index.go` | opens `sqlite`, with the three settings as `_pragma` |
| `src/scripts/install.sh` | builds the index with `CGO_ENABLED=0`, and the compiler probe and the download leave |
| `goEnvOf` | answers `CGO_ENABLED=0` alone |
| the review list | borrows the modules alone |

`CGO_ENABLED=0 go test ./...` passes from the root, and the install names no Zig.

What I assume, for the reader at the merge:

- A box keeps a Zig folder an older install fetched. Nothing reads it, and a clean install leaves it out.
- The pin stays at `v1.46.1` until the root `go.mod` asks for Go 1.25.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft and its review name, and the dictionary
- the disk and the process take fakes in each node case
- each new case carries a comment pointing at the index note
- the pin stands in `go.mod` alone
- the review row stands fixed, and `says` names each assumption

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
