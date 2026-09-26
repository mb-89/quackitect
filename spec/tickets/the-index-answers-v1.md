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
step: design/draft
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
depends_on: [the-q-core-holds-names]
---

# Ask

The index answers `/v1` over HTTP through Huma, on its own port, beside the API it answers today, with `openapi.json` and `/docs`. [[spec/design_input/the-index-holds-the-model#the-registry-builds-each-surface]] asks it.

Every surface after this one reads names over `/v1`. The old API stays, so nothing that reads it today breaks.

- - `go test ./...` from the root passes
- a case reads a name over `/v1` and over the old API from one running index
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The door puts up a second listener, and Huma answers `/v1` on it off the store the files topic gives the door. The old API stands on its own port, unchanged. The routes stand in [[spec/design_output/surfaces]].

| the part | what it holds |
|---|---|
| the module | `github.com/danielgtaylor/huma/v2` at `v2.36.0`, the last release whose `go` line reads Go 1.24 |
| the adapter | `humago`, over the router `net/http` holds, with the prefix `/v1` |
| `GET /v1/values/{name...}` | the value of a name at the latest revision, with that revision, or a problem answer where the catalog lacks the name |
| `/v1/openapi.json` and `/docs` | what Huma writes off the routes |
| the standing file | a field `v1` beside `port`, naming the new port |

- A scratch module builds Huma `v2.36.0` on Go 1.24 here, and serves `/v1/values/files/a/b.md` and `/v1/openapi.json`.
- The value answers as JSON, typed `any` in this slice. A typed schema per name waits for the registry, since a name's type stands in the catalog alone.
- The actions and the watch stream wait for `q.Action` and the SSE door.
- `Serve` answers the second listener beside the first, and `stop` closes both.

This ticket stands on `files-topic-reads-the-rows`, which puts the store in the door.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/index/door.go` `Serve`, which puts up the second listener
- `src/index/door.go` `stands`, which writes the field `v1`
- `src/index/main.go` `Standing`, which gains `V1`
- `src/index/main.go` `serves`, which reads what `Serve` answers
- `src/index/door_test.go`, each case calling `Serve`
- `go.mod` and `go.sum`, which gain Huma

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/index/v1_test.go` `TestOneIndexAnswersAFileOverV1AndTheOldAPI`, deciding the second done line
- `src/index/v1_test.go` `TestV1AnswersANameTheCatalogLacksWithAProblem`
- `src/index/v1_test.go` `TestV1WritesItsOpenAPIDocument`
- `go test ./...` from the root, deciding the first done line
- `./RUNME.sh check`, deciding the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- `Serve`, `stands`, `Standing` and `serves` stand opened, and a scratch module proves the Huma release
- a search for `Serve(` and `Standing{` names no caller beyond the list
- each done line names its test in the tests list

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
