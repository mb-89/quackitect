---
kind: [[ticket]]
state: open
step: design/tests-red
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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: read-topics-land-in-shadow
record:
  - step: design/draft
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 0b215d9bf05c04326157408ac53b371b543b7c99
    hash_after: 0d5d92809a3f13e355131ea2ecb7b06dfdcab324
    inputs:
      - name: ask
        hash: 87436c6106fbe7fb
        size: 278
    def: 71651f49796eeda4
---

# Ask

The `guidance/` topic answers the rules a step reads.

The guidance a step hands out then comes from one place.

- `go test ./...` from the root passes
- a golden file holds the rules the old path and the new one hand for every leaf of every process
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

The old reader keeps answering, and a guidance module runs beside it, the way the config slice runs. A new package src/modules/guidance holds the resolver readsFor in src/scripts/guidance-hand.js runs today, as pure Go. A note under a subfolder of spec/guidance carries a tag for each folder on its path and the tags its frontmatter names, and it reaches a leaf whose tags hold all of them. A note binding an env reaches every leaf where the env binds. A note at the top reaches no leaf by tag. The leaf's own reads follow the resolved notes, less any already there. The module registers the topic guidance/, one entry a leaf of every process under spec/processes, keyed as process:path, the key the guidance verb's --step flag reads. It derives the entries off the files the watch mirrors, and the env module answers the binding. quack guidance prints every entry as JSON. Where migration.guidance reads shadow, stepNotes in src/scripts/guidance-verb.js and the pull's hand-out in pull-hand.js run quack guidance once, and a new src/scripts/guidance-shadow.js writes one shadow row per leaf the two answer apart, naming the leaf and both lists. A missing binary writes nothing. The golden file src/quack/testdata/guidance.golden.json holds, for every leaf of every process in the tree, the notes each reader hands: the Go test owns the module section, and a node test owns the readsFor section. Both tests read the live tree, so a note or a process that moves reruns the writers, and the two sections meet leaf by leaf at the merge. Weighed: a frozen fixture drifts less, and the ask names every leaf of every process, which only the live tree holds. Assumed: the env the golden reads is empty, the one a desk box sees, and a case per env binding covers the rest.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/guidance-verb.js stepNotes, which gains the shadow call
- src/scripts/pull-hand.js the hand-out, which calls readsFor and gains the shadow call
- src/scripts/pull-route.js the held step's reads, through readsFor, unchanged
- src/scripts/pull-chapter.js the chapter rows, through readsFor, unchanged
- src/quack/main.go the modules map, which gains guidance, and the verb dispatch, which gains guidance
- src/modules/migration/migration.go GuidanceKey, which the shadow reads

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/guidance/guidance_test.go TestFolderTagsReachALeafHoldingThemAll
- src/modules/guidance/guidance_test.go TestAnEnvNoteReachesEveryLeafWhereItBinds
- src/modules/guidance/guidance_test.go TestATopNoteReachesNoLeaf
- src/modules/guidance/guidance_test.go TestOwnReadsFollowTheResolved
- src/quack/guidance_test.go TestGuidanceGoldenHoldsTheModule
- test/level0/guidance-golden.test.js the golden's old section holds what readsFor hands every leaf
- test/level0/guidance-shadow.test.js a leaf answered apart writes one shadow row
- test/level0/guidance-shadow.test.js the slice at old runs no quack

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft, no earlier review

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened guidance-verb.js stepNotes, guidance-hand.js readsFor, resolved, tagsOf and alwaysOn, config-shadow.js shadowRun, the holds and work modules, quack main.go and migration.go GuidanceKey, and checked each claim there
the callers list names every caller a grep finds of readsFor, and the two places the module joins
go test ./... passes: the module and golden Go tests; the golden holds both readers for every leaf: TestGuidanceGoldenHoldsTheModule and guidance-golden.test.js; check exits 0: ./RUNME.sh check

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
