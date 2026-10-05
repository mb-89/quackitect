---
kind: [[ticket]]
state: closed
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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: window-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 596929a46c161d234f228479867efc0f08b06e13
    hash_after: 596929a46c161d234f228479867efc0f08b06e13
    inputs:
      - name: ask
        hash: c34b8cca3b5d4090
        size: 507
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 1751eccca2635e4b6b5aa1cb8cc1c959c38ac34a
    hash_after: 1751eccca2635e4b6b5aa1cb8cc1c959c38ac34a
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 6cde03ecb0edb0c3
        size: 1602
    def: 08e16d07b0de477c
  - step: gate
    hand: box 1d64c60aa6ea · claude-code-remote · helper-4
    hash_before: 0f78ed0f87b7b7fbc7423021352eb223573b287f
    hash_after: 0f78ed0f87b7b7fbc7423021352eb223573b287f
    inputs:
      - name: design/draft
        hash: 6cde03ecb0edb0c3
        size: 1602
      - name: design/tests-red
        hash: d45bcffc41ac6b22
        size: 617
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 7bdaffc9969ab684e4d5b02835026ae3c023ef8a
    hash_after: deaab9b4200548e393269fde669af6d2d3be58c3
    answered:
      - name: lint
        exit: 0
        said: "src/voice/voice.go:653:43: MagicNumber: 64 carries a meaning here. Name it in the constants block at the top of this fil"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 8254dc7256bcacbcfd4c12dabbbcaad3a7cef2f5
    hash_after: 8254dc7256bcacbcfd4c12dabbbcaad3a7cef2f5
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    3.6  test/contract/runme-road.test.js ./RUNME.sh hands config to its program, which names the verbs slice at its bui"
    inputs:
      - name: design/tests-red
        hash: d45bcffc41ac6b22
        size: 617
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

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

`src/scripts/log-read.js` and its test leave the tree, and the log design names the Go read `tui --plain` runs. The group then meets its own done_when, and a reader of the design finds the read that runs.

Without it, a module no program imports stands in the tree. The design note then points a reader at a read nothing calls.

- a search of `src` and `test` names no `log-read.js`
- `spec/design_output/log.md` names the read in `src/quack/tui_verb.go`
- `./RUNME.sh check` exits 0

view: none

from: none

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

Delete src/scripts/log-read.js and test/level0/log-read.test.js, since no program imports the module once tui.js left. tuiFilesFor in src/quack/tui_verb.go repeats what logFiles in src/quack/verb_log.go answers over no span, so tuiPlainRows calls logFiles(root, "", now) and tuiFilesFor leaves, with the constants only it reads. The tree then holds one read of the log files. The paragraph of spec/design_output/log.md naming log-read.js names logFiles and logLinesOf in src/quack/verb_log.go, which tui --plain calls too. verb_log.go stands unchanged, so no line the read group owns moves.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/tui_verb.go tuiPlainRows, which calls tuiFilesFor
- test/level0/log-read.test.js, the only importer of log-read.js
- spec/design_output/log.md, the paragraph under the flag table

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- no new test: TestLogVerb in src/quack/verb_log_test.go holds the span and torn-line cases log-read.test.js held
- the rotated-file case of src/quack/tui_verb_test.go holds the tui read over logFiles

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/log-read.js, deleted
- test/level0/log-read.test.js, deleted
- src/quack/tui_verb.go
- spec/design_output/log.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened tui_verb.go tuiFilesFor and tuiPlainRows, verb_log.go logFiles and logLinesOf, log-read.test.js and verb_log_test.go TestLogVerb, and read each claim there
- a search of src, test, .claude, .github and spec/design_output for log-read.js names only the three callers listed
- the search line decides the first done_when line, a read of log.md the second, and ./RUNME.sh check the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/log-read-leaves.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/log-read-leaves.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion: the module stands, and the search finds it named in src/quack/tui_verb.go, test/level0/log-read.test.js and spec/design_output/log.md. The search skips src/quack/testdata, since a golden holds old ticket asks as they stood.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the search case decides the first done_when line and reads log.md for the second, and ./RUNME.sh check decides the third
- the test reads the real disk door, which test/contract drives as its contract

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- log-md-names-tui-rows: the draft says log.md names logFiles and logLinesOf in src/quack/verb_log.go, which tui --plain calls too, but tuiPlainRows reads its rows through tuiRowsIn in src/quack/tui_verb.go and never calls logLinesOf. The builder writes that log.md names logFiles in src/quack/verb_log.go for the files and tuiRowsIn in src/quack/tui_verb.go for the rows tui --plain prints. The note then meets the second done_when line as the ask words it.
- log-read-leaves-asserts-the-design: test/contract/log-read-leaves.test.js only checks that log.md no longer names log-read.js. Nothing in it checks that log.md names src/quack/tui_verb.go, although the tests-red checked line says it reads log.md for the second done_when line. The builder adds an assertion that spec/design_output/log.md names src/quack/tui_verb.go, so a red test decides that line.
- log-md-flag-owners-stale: under the same heading the builder edits, the flag table names spanOf under src/scripts/group.js, and the paragraph after it says the verb runs in node. The log verb runs in Go: register("log") stands in src/quack/verb_log.go, and spanOf, timeOf and logFiles stand there. The builder points those lines at src/quack/verb_log.go while the paragraph is open.
Checked and holding: tuiFilesFor has one caller, tuiPlainRows. logFiles(root, "", now) answers the same list, since spanOf("") reads 0. tuiOldFolder and tuiLogEnd are read by tuiFilesFor alone, while tuiLogFolder stays for tuiOpens. test/level0/log-read.test.js is the only importer of log-read.js. TestLogVerb holds the span and torn-line cases, and TestTuiPlainAllReadsTheRotatedFilesFirst holds the tui read. The size lists every file the ask needs, and the tui_verb.go change stays inside the one read the ask asks for.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the four files the size names, the new contract test, and the comment of the tui case the read drives
- the change reaches the disk through logFiles, which TestLogVerb drives over a temp tree, and adds no door
- the tui call and the test comment name the ticket, and log.md names the Go owners
- log.md points at verb_log.go and tui_verb.go for the read, and states no owner twice

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/log-read-leaves.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/scripts/log-read.js and its level0 test leave the tree, since no program imported the module once tui.js left. tui --plain --all reads its files through logFiles in src/quack/verb_log.go, so the tree holds one read of the log files. spec/design_output/log.md names the Go owners of each flag and of the read, and drops the line saying the log verb runs in node. test/contract/log-read-leaves.test.js holds both.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests touch the one contract file the draft names, and no other
- the contract test reads the real disk door, which test/contract drives
- the test header names the ticket it decides
- each Go owner stands once in log.md, and the test points at the note

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
