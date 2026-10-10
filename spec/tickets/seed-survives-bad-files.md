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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process: [[spec/processes/standard]]
process_hash: c671f20a6ae2a4a6
group: edits-and-files-hold
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a5167492d95e · claude-code-remote
    hash_before: 00979d2d29da2fb082d0ee6784a2f8b7406f9835
    hash_after: 00979d2d29da2fb082d0ee6784a2f8b7406f9835
    inputs:
      - name: ask
        hash: cdba6b0cba744e65
        size: 492
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: fc202c319681f16b7c2fb15643fe0d38f3caa54e
    hash_after: fc202c319681f16b7c2fb15643fe0d38f3caa54e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/files fails
    inputs:
      - name: design/draft
        hash: d6c7321fe6b7c103
        size: 1376
    def: 08e16d07b0de477c
  - step: gate
    hand: box a5167492d95e · claude-code-remote · helper-7
    hash_before: 2c3c36b6ce49ce909b2de0ad7cafe375ef21d99b
    hash_after: 2c3c36b6ce49ce909b2de0ad7cafe375ef21d99b
    inputs:
      - name: design/draft
        hash: d6c7321fe6b7c103
        size: 1376
      - name: design/tests-red
        hash: 75c3daf71d1621ba
        size: 657
    def: dc4904ab364efa10
---

# Ask

One oversized file, or a folder that vanishes or refuses a read, costs its own entry, and the files watch still starts.

Any walk error or one file past the bus cap stops the seed before the watch starts, so the files family gets nothing for the life of the index.

- `./RUNME.sh branch test src/modules/files` passes a case where a file past the cap is skipped and the rest seed and the watch starts
- the same suite passes a case where Standing walks past a folder that vanishes

none

none

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

Standing takes its walk errors through a pure walkPast(root, at, err). An error at the root still ends the walk and reaches the seed, since a missing root seeds nothing. An error under the root, a folder gone or refusing its read among them, costs that path alone, and the walk goes on. In seedsIn, a batch the commit refuses commits again a file at a time, and a file the commit refuses alone drops out of the seed. The watch then starts whatever the seed met, so the live changes still flow. The seed reads no new size limit, since the commit's own refusal names the file past the bus cap.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/files/watch.go seedsIn, through Standing
- src/modules/files/watch.go Seeds, which src/quack/modules.go starts as the files module

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/files/files_test.go, the case where the commit refuses one file and the rest seed and the watch starts
- src/modules/files/files_test.go, the case where walkPast lets the walk go on past a nested path and ends it at the root

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/files/watch.go
- src/modules/files/files_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: Standing, seedsIn, Seeds and Start stand as the approach reads them
- callers: Standing has the seed as its one caller, and Seeds has the module wiring
- done_when: the two cases decide the two lines
- config: the approach adds no key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/files

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/files/files_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertions. The seed answers the refusal of the one file and returns before the watch starts, so the live change after it lands nowhere. The walk answers the error of a nested path it cannot read and ends. The walkPast seam stands with today's answer, so the case meets its assertion and no missing name.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: each line meets its own case, red today
- doors: the seed case walks a temp root through the real disk and commits to a store in memory over FakeWatch, and the walk case reaches no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- watch-adds-skip-bad-folders: The ask says the files watch still starts past a folder that refuses a read, and the approach changes the seed's walk alone. watch.adds in src/modules/files/watch.go returns every WalkDir error and every eyes.Add error, so Changes fails, Seeds returns that error after the seed commits, and a folder the seed walks past still stops the watch. Route the errors under the root in watch.adds through walkPast, let an Add refused under the root cost that folder alone, name Changes and hears as callers, and add a red case over the adder seam where a folder refuses its Add and the watch still starts.

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
