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
    hash_before: 0208338391e9a9900bd2b8a039d3df532afa0dbf
    hash_after: 7f44da3191089f4d1dd4022e91127495c5050d06
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: a82aebfdbb184ffc29b3d2bd9b4d7c58779d652a
    hash_after: a82aebfdbb184ffc29b3d2bd9b4d7c58779d652a
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 761ddd5ff9d849118cebb49b31859f4154eaf4ac
    hash_after: 761ddd5ff9d849118cebb49b31859f4154eaf4ac
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 93f419805eeceac247d56040da17227205c71761
    hash_after: 93f419805eeceac247d56040da17227205c71761
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:111:1: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: implement/tests-green
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 2b2c54a2d10dfe800033e12c204f63d4a6cace70
    hash_after: 2b2c54a2d10dfe800033e12c204f63d4a6cace70
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

`quack why <name>` answers the provider and its file, the inputs down to the files, and every reader. [[spec/design_input/the-index-holds-the-model#the-wiring-analyzer]] asks it.

An agent asks where a value comes from, and one command answers where a search over two languages answers today.

- - `go test ./...` from the root passes
- a case asks a name of a fake catalog, and reads the provider's file and line
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`q.Why` answers a name off the catalog and a snapshot, in the parts [[spec/design_output/model#quack-why]] gives, and the index door serves it as the method `why`.

| the part | what it holds |
|---|---|
| `Why.Value` | the value, and its state: `answered` or `default` |
| `Why.Provider` | the active registration: its kind, its alt, and its file and line |
| `Why.Inputs` | each input field, its name and that name's own answer, down to the names a door writes |
| `Why.Readers` | every active derived name whose input resolves to this one |
| `Why.Text` | the tree the design input draws, one line a part |

- A name the catalog lacks refuses, and says so.
- A family answers for each key, so `why files/spec/one.md` walks the family `files/<path...>`.
- The walk stops at a name it meets twice, so a cycle the check misses answers once.
- A view and a surface join the readers once the views land, per [[spec/design_output/views]].
- The state `stale since <time>` joins once `operations-and-leases-land` gives the store its stale mark.

The command line:

- No ticket in this group brings the `quack` binary, so the verb stands as `se-index why <name>` on the index command line.
- `quack why` takes the same door method once the binary lands.
- The agent tool `index/why` waits for the MCP door.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/index/door.go` `answers`, which gains `why`
- `src/index/main.go` `main`, whose usage line names `why`, and which prints `Why.Text`
- no other caller stands: `q.Why` is new

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/q/why_test.go` `TestWhyNamesTheProvidersFileAndLine`, deciding the second done line
- `src/q/why_test.go` `TestWhyWalksTheInputsDownToTheGivenNames`
- `src/q/why_test.go` `TestWhyNamesEveryReader`
- `src/q/why_test.go` `TestWhyReadsWhetherTheValueStandsAtItsDefault`
- `src/q/why_test.go` `TestWhyOfANameTheCatalogLacksRefuses`
- `src/index/door_test.go` `TestTheDoorAnswersWhy`
- `go test ./...` from the root, deciding the first done line
- `./RUNME.sh check`, deciding the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the model note, the design input section, `answers` and `main` stand opened
- a search for `why` in Go names no caller, and no ticket in the group brings the binary
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- why-reads-the-stale-mark: `Snapshot.Stale` stands in `src/q/store.go` now. So `Why.Value` answers the state `stale since <time>`, and a test covers it.

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

Every new test fails on its assertion against a stub. `TestWhyAnswersEachKeyOfAFamily` joins the list for the family row of the draft. The stale state rides in `TestWhyReadsWhetherTheValueStandsAtItsDefault` and answers [[spec/tickets/why-reads-the-stale-mark]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch `src/q` and `src/index`, which the draft names
- the catalog is a fake of its own, and the door test runs a real door
- each test file opens on a comment pointing at the model note
- each fact points at the model note
- the review row stands answered by the stale case

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/q/why.go`, `answers` and `main`, which the draft names
- the catalog is a fake of its own, and the door test runs a real door
- `why.go` opens on a comment pointing at the model note
- the parts of the answer stand in the model note, and the code points there
- the stale state stands in the change, and the review row stands fixed

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

`se-index why <name>` answers where a value comes from.

| the part | what it does |
|---|---|
| `q.Why` | answers the value and its state, the provider's file and line, the inputs down to the given names, and every reader |
| the door | serves the method `why` |
| `se-index why` | prints the tree, one line a name |

What I assume, for the reader at the merge:

- The walk stops at a provider it meets twice. A diamond input then answers its inputs once.
- The file names the absolute path the Go runtime records at registration.
- A bare `go test ./...` fails on `fts5` in `src/index`, so the first done line waits on [[spec/tickets/sqlite-runs-pure-go]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft names
- the catalog is a fake of its own in each test
- each file opens on a comment pointing at the model note
- the parts of the answer stand in the model note alone
- the stale state stands in the change, and the review row stands fixed

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
