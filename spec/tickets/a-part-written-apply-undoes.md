---
kind: [[ticket]]
state: open
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
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "a-part-written-apply-undoes cannot pass tests-green: the edits package stays red on the cases of journal-names-stay-unique and regex-replacements-read-js-groups, the ratio guard fails on src/modules/files until the files tickets write their code, and the queue binds the box to this ticket. Narrow its tests to its own case and baseline the files ratio until the group's code lands, or unbind the queue so the box takes every implement step first?"
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a5167492d95e · claude-code-remote
    hash_before: be4d886ae694aac2dbe0215084a893737c5815c0
    hash_after: dc12a995d711ec6678285f29bcd50fae13db35ba
    inputs:
      - name: ask
        hash: 899317d2c93210e8
        size: 426
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: b19049a0d791da6ced29abeeda29b072bbeed36e
    hash_after: b19049a0d791da6ced29abeeda29b072bbeed36e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/edits fails
    inputs:
      - name: design/draft
        hash: a98648b614bc9a9a
        size: 1144
    def: 08e16d07b0de477c
  - step: gate
    hand: box a5167492d95e · claude-code-remote · helper-4
    hash_before: 916e6b834a81f4320b00e2b174c99c04d8fb701b
    hash_after: 916e6b834a81f4320b00e2b174c99c04d8fb701b
    inputs:
      - name: design/draft
        hash: a98648b614bc9a9a
        size: 1144
      - name: design/tests-red
        hash: d4bc9252842d46cd
        size: 671
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a5167492d95e · claude-code-remote
    hash_before: 6748abb663c14316819635b2236a0cc6f4468b77
    hash_after: 6748abb663c14316819635b2236a0cc6f4468b77
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box a5167492d95e · claude-code-remote
    hash_before: 8365efe776f73bdf126a4905a3a2aba59e578f75
    hash_after: 8365efe776f73bdf126a4905a3a2aba59e578f75
    returns: 1
    why: the case this ticket wrote passes, and the edits package stays red on the cases journal-names-stay-unique and regex-replacements-read-js-groups own, which stand at their gates. The ratio guard reads src/modules/files past one to one until the files tickets write their code. Green waits on those siblings.
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/edits fails
      - name: check
        exit: 1
        said: "   78.5  in all"
  - step: implement/person-1
    hand: box a5167492d95e · claude-code-remote
    hash_before: b329e24f5c5a3016ea1ee217e799607431a71098
    hash_after: b329e24f5c5a3016ea1ee217e799607431a71098
    def: 6c4270b49c40b30a
group: edits-and-files-hold
---

# Ask

When an apply fails partway through its writes, the undo its error recommends puts the tree back.

The journal lists every file as written, so undo reads an unwritten file as moved since the apply and refuses. The tree stays part written, and no tool puts it back.

- `./RUNME.sh branch test src/modules/edits` passes a case that fails the second of three puts, runs undo, and finds every file back at its old text

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

When a put fails after another put lands, writes() rewrites the journal entry to the files the disk now holds from this apply. It keeps each file in `wrote` as it stands. It keeps the failing file only where it stands on disk, with Made set to the text read back, because a truncated WriteFile leaves neither half. It drops every file the batch did not reach. Restores then passes every listed file, so undo puts Was back and removes the files the apply made. Restores and undoes stay as they are.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/edits/edits.go patches, through writes
- src/modules/edits/edits.go the replace sweep, through writes
- src/modules/edits/edits.go the mint, through writes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/edits/edits_test.go, the part-written case

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/edits/edits.go
- src/modules/edits/edits_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: writes, undoes, Restores, JournalOf and put stand as the approach reads them
- callers: writes is the one door every apply reaches, so every caller is in the list
- done_when: the part-written case decides the one line
- config: the approach adds no key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/edits

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/edits/edits_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its own assertion, with the refusal the finding names: undo refused, d.txt moves since the apply. The batch writes a.txt, fails to make the folder for b/c.txt, and never reaches d.txt. What surprises me: the born file that failed leaves nothing on disk, so the only refusal comes from the file the batch did not reach.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the part-written case fails on its assertion, and the same case decides the line
- doors: the case runs on a temp folder through Outside, the module's own disk door, as the standing edits cases do

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask: writes() in src/modules/edits/edits.go rewrites the journal entry, after a put fails past the first, to the files that apply left on disk, so Restores in journal.go meets no unreached file and undo puts Was back. The red case TestAPartWrittenApplyUndoes in src/modules/edits/edits_test.go fails the second of three puts (b/c.txt, under a file named b), runs undo, and reads every file back at its old text, so it decides the one done_when line. The callers list holds: patches, the replace sweep and mints each reach writes through lands. The size names the two files the ask touches.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/edits/edits.go src/modules/edits/edits_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: the change touches src/modules/edits/edits.go alone, and the test stands in edits_test.go from tests-red
- doors: the change reaches the disk through the Outside root, and the case runs it over a temp root of its own
- comment: reached carries a line pointing at this ticket
- one place: the rule for which files a part-written apply keeps stands in reached alone

## person-1

<!-- a-part-written-apply-undoes cannot pass tests-green: the edits package stays red on the cases of journal-names-stay-unique and regex-replacements-read-js-groups, the ratio guard fails on src/modules/files until the files tickets write their code, and the queue binds the box to this ticket. Narrow its tests to its own case and baseline the files ratio until the group's code lands, or unbind the queue so the box takes every implement step first? -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

Neither road. The tests and the ratio guard stay as they stand. A helper pull takes the ticket the plan names, so the box pins the plan to each sibling in turn and works its implement/change through a helper hold. Once the edits and files code lands, the edits package and the files ratio turn green, and this tests-green runs again unchanged.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: the answer changes no file
- doors: the answer reaches no door
- comment: reached keeps its pointer at this ticket
- one place: the road stands in this answer and in the group Discussion

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/edits

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

An apply that fails past its first put now rewrites its journal entry to the files it left on disk. The entry keeps every file written before the failure. It keeps the failing file only where it stands on disk, with the text read back. It drops every file the batch did not reach. Undo then puts each listed file back and refuses none, so the undo the error names restores the tree.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: src/modules/edits/edits.go alone, beside the case in edits_test.go
- doors: the change reaches the disk through the Outside root, and the case runs it over a temp root
- comment: reached points at this ticket
- one place: reached alone holds which files a part-written apply keeps

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
