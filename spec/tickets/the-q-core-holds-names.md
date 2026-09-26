---
kind: [[ticket]]
state: open
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
step: implement/tests-red
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
depends_on: [go-code-shares-one-module]
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: 86f6feaac417b2837ccb432ed8b58202aef10914
    hash_after: 86f6feaac417b2837ccb432ed8b58202aef10914
  - step: design/review
    hand: box d7a69cb6601d7 · claude-code-remote · helper-2
    hash_before: 430b32b4a9b9972011a4a89f5977018374732de4
    hash_after: 430b32b4a9b9972011a4a89f5977018374732de4
---

# Ask

The `q` core stands: names, providers and defaults, `q.Derived` and `q.Fold`, snapshots and revisions, and the catalog check that refuses a start. The phase 0 note on the index model says the shape.

Every module after this one registers through it. Without it no name has one owner.

- - `go test ./...` from the root passes
- a case each refuses a catalog with a name twice, a missing default, and two active providers
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The package `src/q` holds the core, imported as `quackitect/src/q`. It takes the shape [[spec/design_output/model]] gives, and it imports no door and no other tree package.

| the part | what it holds |
|---|---|
| `Catalog` | the registrations, each with its name, type, default, kind, `Alt`, doc, deadline, and the file and line `runtime.Caller` reads |
| `q.Derived` | a name answered by a function of an input struct, whose fields carry `q:"<name>"` tags |
| `q.Fold` | a name answered by a state reduced over events, one event at a time |
| `q.Doc`, `q.Alt`, `q.Deadline` | the options a registration takes |
| `Store` | the values in memory at one revision: `Snapshot` reads names at one revision, and `Commit` lands a run's output and raises the revision |
| `Run` | one run of a derived name: fill the input struct off a snapshot, call the function, commit the output with the revision it read |
| `Check` | the catalog check, answering every fault at once, each naming its file and line |

The check refuses these faults:

- a name registered twice with the same `Alt`, naming both places
- a default missing: a nil pointer, map, slice or interface
- two providers active: with the key `providers.<name>` empty, every registration is active unless one plain registration stands
- a key picking an `Alt` nobody registers
- an input naming no name, and an input whose type differs from the name's
- a cycle among derived names

What else holds:

- the view row of the model's table waits for the views, per [[spec/design_output/views]]
- the index runs `Check` over the one catalog at start, and exits with the faults where any stands
- the catalog stands empty in this phase, so the index behaves as it did
- Go takes a list of options last alone, so `q.Derived(name, def, fn, opts...)` takes the function before them
- the design sketch puts the function after the options
- the scheduler waits for the index's work loop, which leaves one run pending on a change during a run
- a fold's state in the database waits for that loop too, and `Run` stays the one step it calls

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/index/main.go` `main`, which runs `q.Check` at start
- no other caller stands yet: every module after this one registers through the package

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/q/catalog_test.go` `TestANameTwiceRefusesTheStart`, deciding the second done line
- `src/q/catalog_test.go` `TestAMissingDefaultRefusesTheStart`, deciding the second done line
- `src/q/catalog_test.go` `TestTwoActiveProvidersRefuseTheStart`, deciding the second done line
- `src/q/catalog_test.go` `TestTheKeyPicksOneAlt`
- `src/q/catalog_test.go` `TestAnInputNamingNoNameRefuses`
- `src/q/catalog_test.go` `TestAnInputOfAnotherTypeRefuses`
- `src/q/catalog_test.go` `TestADerivedCycleRefuses`
- `src/q/store_test.go` `TestASnapshotReadsOneRevision`
- `src/q/store_test.go` `TestARunCommitsTheRevisionItRead`
- `src/q/store_test.go` `TestAFoldReducesEachEvent`
- `src/index/start_test.go` `TestABrokenCatalogRefusesTheStart`
- `go test ./...` from the root, deciding the first done line
- `./RUNME.sh check`, deciding the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the model note, the index model input and `src/index/main.go` stand opened
- a search for `q.` and `quackitect/src/q` names no caller beside the index start
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- start-check-runs-in-serve: Run `q.Check` in `Serve` in `src/index/door.go`. `main` runs for every command-line verb, not the start alone.
- serve-takes-a-catalog-seam: Give `Serve` a catalog seam so the broken-catalog test plants a fault. Update its callers in `door_test.go` and `serves`.
- catalog-holds-name-families: Hold a family such as `ops/<id>` once in the catalog. Check each name's lowercase segments, which `operations-and-leases-land` needs.
- check-reads-provider-keys: Name where `Check` reads the `providers.<name>` keys, since the `cfg/` topic stands nowhere yet.
- migration-names-the-q-package: Add a `src/q` row to the migration table, which gives the model to `src/index` alone.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
