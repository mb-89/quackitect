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
step: gate
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
record:
  - step: design/draft
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: dbd85cdf1921393f89549d642e0bdec066ff159c
    hash_after: dbd85cdf1921393f89549d642e0bdec066ff159c
    inputs:
      - name: ask
        hash: 2149c1e4d90b8c82
        size: 412
      - name: [[spec/design_output/model]]
        hash: 518103d9494e50d7
        size: 9128
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 4491deab5516ba3b6dab5f13dfb55b87512a995d
    hash_after: 4491deab5516ba3b6dab5f13dfb55b87512a995d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 6030b12e6317e462
        size: 1576
    def: 08e16d07b0de477c
---

# Ask

The index hands the `providers.*` keys to `Check` at start. So the alternative provider a key picks reaches the catalog check, per [[spec/design_output/model#the-provider-kinds]].

A key picking a provider changes nothing today, because the check reads no key.

- `go test ./...` from the root passes
- a case sets `providers.<name>`, and reads the pick in the catalog check's answer
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

q gains Catalog.Names, every name the catalog registers, one a group. The index gains providersOf(root, catalog), which asks config.Value for providers.<name> over each name, so the tracked file, the environment and the local file each reach the pick, and answers the keys that stand. Serve hands those keys to catalog.Check and to q.NewStore in place of nil, so the check reads the pick and the store runs the provider it picks. Weighed: a key read a name at a time over a walk of the providers map, since the layered reader answers a key and the environment layer lists no map. Assumed: a name carries no dot, since config splits a key on the dot, and every name the catalog holds today carries none.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/door.go: Serve, which calls Check and NewStore,src/q/check.go: Catalog.Check and pick, which read the keys,src/q/store.go: NewStore, which picks the active provider off the keys

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/index/start_test.go: TestAProviderKeyReachesTheCatalogCheck,src/index/start_test.go: TestAProviderKeyNamingNoAltRefusesTheStart,src/q/catalog_test.go: TestNamesListEveryGroupOnce

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/check.go,src/q/catalog_test.go,src/index/door.go,src/index/start_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened Serve in door.go, Check and pick in check.go, NewStore, and config.Value, and checked each claim there
the callers come off a grep for Check( and NewStore( over src, and the tests call both with keys already
the second done_when line meets TestAProviderKeyNamingNoAltRefusesTheStart, and go test and the check decide the rest

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/index

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/catalog_test.go,src/index/start_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The three cases fail on their assertions: Names answers nothing, providersOf answers no key, and the start refuses on two active providers where the key names t.none, so the refusal never names the key the owner set. The surprise: the refusal today already says providers.t/n, so the case pins the value t.none to tell the two apart.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the second done_when line meets TestAProviderKeyNamingNoAltRefusesTheStart, red on its assertion, and go test and the check decide the rest
the config door reads a local file under the temporary root the case plants, so no box config reaches the case

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
