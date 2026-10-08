---
kind: [[ticket]]
state: open
step: implement/change
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
group: javascript-leaves
depends_on: ["test-lines-stay-under-code"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: e52d8ac06acd3006833d258d8295ef7a6fd67ca0
    hash_after: e52d8ac06acd3006833d258d8295ef7a6fd67ca0
    inputs:
      - name: ask
        hash: 6bdac60bf84e4f30
        size: 320
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 468891e6441505ac30fda7fe5ffbdb7605532e6c
    hash_after: 468891e6441505ac30fda7fe5ffbdb7605532e6c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: d6da24a88bf0ad7e
        size: 3927
    def: 08e16d07b0de477c
  - step: gate
    hand: box b1ba21c2e626 · claude-code-remote · helper-4
    hash_before: d93f667087750d0ec8148d5660eb98ea32eadd56
    hash_after: d93f667087750d0ec8148d5660eb98ea32eadd56
    inputs:
      - name: design/draft
        hash: d6da24a88bf0ad7e
        size: 3927
      - name: design/tests-red
        hash: feffe0d6fd4febe4
        size: 774
    def: dc4904ab364efa10
---

# Ask

The doors design note lists each JavaScript file that stays, with its reason, and a check compares the list to the tree.

JavaScript grows back with nobody saying why it stands.

- `go test ./src/quack/...` passes a test that refuses a tracked JavaScript file the list leaves out
- `./RUNME.sh check` exits 0

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

A new chapter in spec/design_output/doors.md, `# The JavaScript that stays`, holds a two-column table: `| files | reason |`. A cell ending in `/` covers every file under that folder, and any other cell names one file. The rows are as follows. `src/extension/` is the VS Code extension, which VS Code loads as JavaScript. `.claude/skills/level0/hooks/` holds the level zero function hooks Claude Code loads as JavaScript modules. `src/stub/.claude/skills/level0/hooks/` holds the same hooks as the stub a project takes. `.claude/skills/level0/lib/vale.js`, `src/scripts/styles.js` and `src/engine/tools.js` are the Vale scripts the lint-without-vale group owns, which this group leaves standing per its ask. `src/doors/` holds the doors and fakes that the extension's tests, the hooks' tests and the Vale scripts drive. `test/` holds the tests of the code that stays, and the reporter the check runs them under. `prototype/trace-view/` is the prototype that spec/funnel/the-editor-draws-the-trace cites as evidence; it runs in no product, as the group's inventory decides.

A new check part named `javascript` sits in partsOf in src/quack/check.go, beside `lines`, and runs javascriptListed(d) in a new src/quack/check_javascript.go. That function reads the doors note through d.text and takes the table under that heading. It lists files through d.git("ls-files", "-z", "--cached", "--others", "--exclude-standard"), the same call linesHold makes, and keeps the paths whose extension is a JavaScript one in lineLanguages, so both parts read one list of extensions. It answers 1 and names each file no row covers, with the line: add a row with its reason to the doors note, or delete the file. It also answers 1 for a row covering no tracked file, so the list can't keep a stale reason. A missing heading or an empty table answers 1 too, so a renamed chapter can't pass silently. Each new part takes its own name, so a red run says which list fell out of step.

Weighed: putting the check into linesHold would save a part, but it would mix two refusals under one name. A separate part costs one more line in the battery table. Assumed: the reasons stand at folder grain, not per file, because the owner's words name the reasons by kind (the extension, the hooks), and a per-file list would grow with each extension file and repeat one reason dozens of times.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go partsOf, which runs the new part
- src/quack/check_javascript.go javascriptListed, called by partsOf alone
- src/quack/check_lines.go lineLanguages, read by javascriptListed for the JavaScript extensions

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_javascript_test.go TestTheJavaScriptPartRefusesAFileTheListLeavesOut
- src/quack/check_javascript_test.go TestTheJavaScriptPartRefusesARowCoveringNoFile
- src/quack/check_javascript_test.go TestTheJavaScriptPartPassesWhereEveryFileStandsListed

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/design_output/doors.md
- src/quack/check.go
- src/quack/check_javascript.go
- src/quack/check_javascript_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened each file the approach names: partsOf and checkDoors in src/quack/check.go, linesHold and lineLanguages in src/quack/check_lines.go, the linesDoors fake in src/quack/check_lines_test.go (which the new tests copy for their git and root), the doors note's chapters, and the group's inventory, which keeps prototype/trace-view. Every remaining tracked JavaScript file was listed by git ls-files, and its importers were traced with git grep; the extension and hooks import nothing outside their own folders.
The callers list names partsOf, the new function and the lineLanguages it reads. No other code calls into the new part.
The first done_when line is decided by TestTheJavaScriptPartRefusesAFileTheListLeavesOut. The second, ./RUNME.sh check exiting 0, is decided by the check run itself, where the new part reads the real tree.
The approach adds no config key.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_javascript_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three cases fail on their own assertion: a file no row covers, a row covering no file, and a note with no list. Each one answers 0 where it wants 1. The passing case passes on the stub. The draft named three test functions, and they stand here as cases of one table test, so the test lines stay low.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The first done_when line meets the case a JavaScript file no row covers refuses, which fails now. The second, the check exiting 0, is a checkpoint the check run answers once tests-green lands the list in the doors note.
The tests reach the git and root doors through linesDoors, which fakes git ls-files and writes a temp root, so every door they reach has a fake.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- doors-move-beside-their-users: the group inventory in spec/tickets/javascript-leaves.md marks src/doors/disk.js, proc.js, wire.js and fake/behaves.js, fake/disk.js, fake/proc.js, fake/vscode.js as moves under this ticket, each leaving src/doors for a home beside its user, and the approach keeps src/doors/ standing instead. git grep finds no product file importing disk.js, proc.js or wire.js, only their own tests under test/contract, so the reason "the doors the extension's tests, the hooks' tests and the Vale scripts drive" holds for vale.js and the fakes alone. Move or delete each and point its inventory row at the result.
- javascript-rows-name-each-file: the src/doors/ and test/ rows cover a folder, so a new JavaScript file there passes the part with no reason of its own, which is the regrowth the ask names. The builder narrows those two rows to one file a row, or one reason a test subfolder that holds only tests of code that stays, while it writes the table. The rows otherwise cover every file git ls-files lists today, and the reasons for src/extension/, both hook folders, the Vale scripts and prototype/trace-view/ match the group ask and its inventory.

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
