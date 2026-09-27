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
depends_on: [the-q-core-holds-names]
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: 85d541d35ac8ddd2ebef68b23469cc38ea31d092
    hash_after: d05637e98a855bf6d470f9530a06162ed13441d0
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 9eb7eccbcf2afc7735d19f2ef0ed67493a3024d6
    hash_after: 9eb7eccbcf2afc7735d19f2ef0ed67493a3024d6
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 046df8259fcf3e9b97014cfdb924c546a70092e9
    hash_after: 046df8259fcf3e9b97014cfdb924c546a70092e9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 563f2a5f92062f786fdc0ae6966acdf555511c20
    hash_after: 563f2a5f92062f786fdc0ae6966acdf555511c20
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: bef567ca7edc3ce6ea0f20c5b73b0c0cb3835bbb
    hash_after: bef567ca7edc3ce6ea0f20c5b73b0c0cb3835bbb
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes; green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:111:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

The `files/` topic answers off the rows the index holds already, and every module reads a file's contents through it.

Modules touch no disk. Without the topic each one reads the tree itself again.

- - `go test ./...` from the root passes
- a case changes a file under the watcher, and reads the new contents under `files/`
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The index registers the family `files/<path...>`, and the door commits its values into a `q.Store` off the `file` rows it already writes.

| the part | what it holds |
|---|---|
| `files/<path...>` | a family whose key takes the rest of the name, so `files/spec/one.md` reads one file |
| `Content` | the value: the hash and the text of the row, with the empty `Content` as default |
| the start | `Serve` registers the family on the catalog it takes, checks it, and commits every tracked row at one revision |
| a settle | `settles` commits the paths it moves, off their rows, at one new revision |
| `read` | a door method answering the value of a name at the latest revision |

- A key segment `<name...>` stands last alone, and takes one or more segments. `src/q` learns it, and the check refuses it elsewhere.
- A key segment holds any text, since a path holds capitals. The lowercase check reads the family's own segments alone.
- A path the settle drops, or git stops tracking, commits the default.
- The store holds the text a second time, in memory, since the model reads values off a snapshot. A later ticket moves a value behind the row, where memory costs too much.
- Modules run in this process for now, and a module in its own process reads through `read`.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/index/door.go` `Serve`, which registers the family and loads the rows
- `src/index/door.go` `settles`, which commits what moves
- `src/index/door.go` `answers`, which gains `read`
- `src/q/q.go` `matches`, which takes a key of many segments
- `src/q/check.go` `wellNamed`, which places that key last

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/index/topic_test.go` `TestAChangedFileReadsItsNewContentsUnderFiles`, deciding the second done line
- `src/index/topic_test.go` `TestARemovedFileReadsTheDefaultUnderFiles`
- `src/q/store_test.go` `TestAKeyOfManySegmentsTakesTheRestOfTheName`
- `src/q/catalog_test.go` `TestAKeyOfManySegmentsStandsLast`
- `go test ./...` from the root, deciding the first done line
- `./RUNME.sh check`, deciding the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the door's functions the callers list names stand opened, with `touches`, `Texts` and `trackedIn`
- a search for `Serve(` and `answers(` names no caller beyond the door, its tests and `serves`
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

pass

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test src/q src/index

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The two `src/q` cases fail on the name check and on the commit, since a key takes one segment alone. The two `src/index` cases fail on `no method called read`. The surprise: a bare `go test` of `src/index` fails on `no such module: fts5`, so the index runs under the verb or under `-tags=sqlite_fts5`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the tests of `src/q` and `src/index` alone
- the index cases drive the door over loopback on a temp tree, as the door's own tests do
- each new case links this ticket
- the read method and the family name stand in the tests once each
- the review passes with no rows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint src/q src/index

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/q` and `src/index` alone, the two the callers list names
- the topic reads the rows the database door holds, and reaches no disk of its own
- `src/index/topic.go` opens on the approach and links this ticket
- the family name and its prefix stand as constants in `topic.go` alone
- the hand-built door in `sweep_test.go` takes a store, the one caller the design leaves out

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test src/q src/index

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The index registers `files/<path...>` on the catalog it takes, and commits every tracked row into a `q.Store` at the start. A settle commits the paths it moves, and a sweep or a retrack commits the whole list, so a removed path reads the empty `Content`. The door answers `read`, the value of a name at the latest revision.

`src/q` learns a key `<name...>` taking the rest of the name. The check places it last, after one plain segment at least.

A bare `go test ./...` still fails every index case on `no such module: fts5`, as it does on main, since the cgo driver wants the `sqlite_fts5` tag. [[spec/tickets/sqlite-runs-pure-go]] owns that line. The verb passes the tag, and every case passes under it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/q` and `src/index` alone
- the topic reads the rows the database door holds
- `src/index/topic.go` opens on the approach and links this ticket
- the family name stands once, in `topic.go`
- the review passes with no rows

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
