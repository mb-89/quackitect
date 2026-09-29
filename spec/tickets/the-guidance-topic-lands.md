---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
  - step: design/tests-red
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 9d92310f14dce1273190564aec8ad88a9fbc9be6
    hash_after: 9d92310f14dce1273190564aec8ad88a9fbc9be6
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 501499ab2049eff5
        size: 3483
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 1b4a7446b765741ac10a5f1e4d7c94ca57bb5c3a
    hash_after: 1b4a7446b765741ac10a5f1e4d7c94ca57bb5c3a
    inputs:
      - name: design/draft
        hash: 501499ab2049eff5
        size: 3483
      - name: design/tests-red
        hash: 993919719f37e3d2
        size: 1042
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: b7d8afac8cb8dff43fd60fd9868a9bd51dda9e4f
    hash_after: b7d8afac8cb8dff43fd60fd9868a9bd51dda9e4f
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 34b5900ad33525a31a70d0f743f5d5dffde9b8fe
    hash_after: 34b5900ad33525a31a70d0f743f5d5dffde9b8fe
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 3 file(s); green, src/modules/guidance passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 993919719f37e3d2
        size: 1042
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
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

./RUNME.sh test src/modules/guidance src/quack test/level0/guidance-golden.test.js test/level0/guidance-shadow.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/guidance/guidance_test.go
- src/quack/guidance_test.go
- test/level0/guidance-golden.test.js
- test/level0/guidance-shadow.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The module answers each leaf's notes with the envs a note binds, and the reader filters them by its own env through Notes. So the module reads files alone, and no env port joins the wiring, which the draft named. The golden reads the live tree on a box binding no env, the way a desk reads it. The guards for a slice at old and a missing binary pass on the stub, since the stub writes nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a red test: go test over the module and quack, the golden in TestGuidanceGoldenHoldsTheModule, TestGuidanceGoldenOldMeetsNew and guidance-golden.test.js, and the check at tests-green
the module cases seed files/ through qtest, and the shadow cases fake the quack process, the settings, the files and the log

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- guidance-shadow-wiring-tested: the draft wires guidanceShadow into stepNotes in src/scripts/guidance-verb.js and into the pull hand-out in src/scripts/pull-hand.js, and no test drives either caller, since test/level0/guidance-shadow.test.js calls guidanceShadow alone; add a case per caller that reads the shadow row off the fake log
- guidance-draft-matches-tests-red: the draft tests list leaves out TestGuidanceGoldenOldMeetsNew and the case a missing binary writes nothing, and its approach names an env port where tests-red carries each note env on Read.Env and filters it in Notes; write the answer under Discussion
- guidance-module-cases-cover-edges: guidanceText lets a work root stand over the method root notes, and namesUnder drops a note whose name opens with an underscore, and no module case covers either while the golden reads this tree alone

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/guidance src/quack/guidance.go src/scripts/guidance-shadow.js src/scripts/guidance-verb.js src/scripts/pull-hand.js src/scripts/guidance-golden.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the guidance module, quack guidance, the shadow and its callers, the golden and the wiring the draft names, and nothing past them.
The shadow and wiring cases meet fake settings, proc and log, and the module cases seed files through qtest.
The headers of src/modules/guidance/guidance.go and src/scripts/guidance-shadow.js name the approach.
The folder names stand once, as guidance.Guidance and guidance.Processes.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance-shadow.test.js test/level0/guidance-shadow-wiring.test.js test/level0/guidance-golden.test.js src/modules/guidance

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The guidance topic lands in shadow. The guidance module resolves every leaf the processes name to the notes it reads, off the folder tags, the frontmatter tags and the env a note names, and quack guidance prints them keyed process:path. Where migration.guidance reads shadow, stepNotes and the pull hand-out run quack guidance and write one shadow row a leaf the two readers answer apart, which ./RUNME.sh log --kind shadow names. The golden holds both answers for every leaf of this tree, and they agree today. TestGuidanceGoldenOldMeetsNew in src/quack passes under go test -run Guidance, while that folder also holds the log ticket red test.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the guidance readers alone.
The shadow and wiring cases meet fake doors.
The module header names the approach.
The folder names stand once in the module.

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

Tests-red settles two things the draft reads otherwise:

- the env binding: each read carries the env a note names on `Read.Env`, and `Notes` in src/modules/guidance/guidance.go keeps a read where that env stands set, with no env port
- the tests past the draft's list: `TestGuidanceGoldenOldMeetsNew` in src/quack/guidance_test.go, and the case a missing binary writes nothing in test/level0/guidance-shadow.test.js
