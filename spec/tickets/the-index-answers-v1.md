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
    hash_before: 716bca3afa186597b44a458cdd0174475a43b04a
    hash_after: 68b96490bf77f4ca010ecaa9f22ae146908ced3d
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 4c5ddb62b84b3a2766d520e8343244f69d7f696a
    hash_after: 4c5ddb62b84b3a2766d520e8343244f69d7f696a
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 085fd8b4f85f6e5c5299d0a4e6487d4440231d65
    hash_after: 085fd8b4f85f6e5c5299d0a4e6487d4440231d65
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 420cd9926b42d96d4feaf647c4a006fea046c556
    hash_after: 420cd9926b42d96d4feaf647c4a006fea046c556
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-index-answers-v1.md:196:1: CodeSpans: A sentence holds 4 code spans, and this one holds 5. Carry the re"
  - step: implement/tests-green
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 601674c6049eb8ecc99188a6f547d4edc8bf0f34
    hash_after: 601674c6049eb8ecc99188a6f547d4edc8bf0f34
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/the-index-answers-v1.md:204:1: CodeSpans: A sentence holds 4 code spans, and this one holds 5. Carry the re"
reason: done
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

The door puts up a second listener, and Huma answers `/v1` on it off the store the files topic gives the door. The old API stands on its own port, unchanged. The routes stand in [[spec/design_output/model#surfaces]].

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

pass with findings

- serve-callers-take-the-listener: `start_test.go`, `topic_test.go` and `ops_test.go` under `src/index` call `Serve` too. Each takes the second listener the change adds.
- v1-values-read-stale: `Snapshot.Stale` stands now. So `GET /v1/values` answers `stale since <time>` beside the value, per [[spec/design_output/model#a-stale-mark]].

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test src/index

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The three door cases meet a `404` from a listener holding no route, and the stale case meets an empty value. `Serve` keeps its signature: the standing file names the port of `/v1`, and `stop` closes both listeners. So no caller of `Serve` changes, which answers [[spec/tickets/serve-callers-take-the-listener]]. `TestV1ReadsAStaleName` answers [[spec/tickets/v1-values-read-stale]].

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch `src/index`, `go.mod` and `go.sum`, which the draft names
- the door tests run a real door, and the stale case a store of its own
- each file opens on a comment pointing at the surfaces note
- the routes stand in the surfaces note, and the code points there
- both review rows stand answered

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/index`, `go.mod` and `go.sum`, which the draft names
- the door tests run a real door, and the stale case a store of its own
- `v1.go` opens on a comment pointing at the surfaces note
- the routes stand in the surfaces note, and the code points there
- both review rows stand fixed, one of them by keeping the signature of `Serve`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test src/index

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The index answers `/v1` through Huma, on a port of its own, beside the old API.

| the route | what it answers |
|---|---|
| `GET /v1/values/{name...}` | the name, its value, the revision, and its stale mark where one stands |
| a name the catalog lacks | a `404` problem answer naming it |
| `/v1/openapi.json` | the document Huma writes off the routes |
| `/v1/docs` | the pages Huma draws off that document |

The standing file names the port under `v1`, and `stop` closes both listeners.

What I assume, for the reader at the merge:

- The docs stand under the prefix, at `/v1/docs`, beside the document they read.
- `Serve` keeps its signature, so every caller stands as it is.
- The value answers typed `any` until the registry gives each name its type.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft names
- the door tests run a real door, and the stale case a store of its own
- `v1.go` opens on a comment pointing at the surfaces note
- the routes stand in the surfaces note alone
- both review rows stand fixed, and `says` names each assumption

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
