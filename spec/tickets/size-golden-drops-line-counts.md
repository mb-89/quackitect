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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: engine-verbs-hold
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 3083f7a5dfa2e32db313b919d1cfe5e24c2e6e57
    hash_after: 3083f7a5dfa2e32db313b919d1cfe5e24c2e6e57
    inputs:
      - name: ask
        hash: 1c3f36d653132a35
        size: 398
    def: 7883b3d10633c780
---

# Ask

A ticket or note edit moves no golden, so no commit stands only to count lines again.

Each edit to a file past the ceiling turns the check red until a hand counts the size golden again.

- `go test ./src/modules/check/` passes a case where a file past the ceiling grows a line and the golden holds.
- `./RUNME.sh branch test` runs every golden test the change touches.
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

The size golden holds rows the Go side alone reports, and every row names a prose or data file with its line count. sizeFaults in src/modules/check/textfaults.go sizes every path it meets, while its JavaScript twin sizeFaults in .claude/skills/level0/lib/size.js sizes code files alone. textFaults gates on sizedFile already, so the lint itself reads no prose file for size; only the twin walk in src/quack/check_twins_test.go goTwins feeds sizeFaults a ticket.

The fix moves the gate into sizeFaults: it answers nothing where sizedFile reads no code path, as the JavaScript twin does. textFaults keeps its own gate, so the lint reads the same rows. A rerun of go test ./src/quack -run TestTwinGoldens -twins then writes src/modules/check/testdata/size.golden.json with both sides empty. A ticket or note edit then moves no golden.

For the test verb: testVerb in src/branches/test.go adds the packages a changed golden's readers stand in. A new pure goldenReaders(changed []string, tests map[string]string) []string names, for each changed path under a testdata folder, the folder's own package and every package whose _test.go text names that folder past src/. testVerb builds the map off d.filesUnder("src") and d.read. twinsAt in src/quack/check_twins_test.go reads filepath.FromSlash("../modules/check/testdata"), so its text names the folder the reader looks for.

The gate meets the ask with less than the title names, since the counted rows stand through the twin walk alone. goldenReaders closes the test line, since today a changed golden maps to no package.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/check/textfaults.go textFaults (calls sizeFaults)
src/modules/check/export.go SizeFaults (exports sizeFaults)
src/quack/check_twins_test.go goTwins (calls check.SizeFaults)
src/quack/check_twins_test.go TestTwinGoldens (reads twinsAt)
src/branches/branch.go init table row test (runs testVerb)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/check/textfaults_test.go TestAProseFilePastTheCeilingGrowsALineAndTheSizeGoldenHolds
src/modules/check/textfaults_test.go TestACodeFilePastTheCeilingStillNamesItsCeiling
src/branches/test_test.go TestGoldenReadersNameEveryPackageReadingAChangedGolden

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/check/textfaults.go
src/modules/check/textfaults_test.go
src/modules/check/testdata/size.golden.json
src/quack/check_twins_test.go
src/branches/test.go
src/branches/test_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened textfaults.go (textFaults, sizeFaults, sizedFile), export.go SizeFaults, testdata/size.golden.json, quack/check_twins_test.go (goTwins, TestTwinGoldens, twinsAt), src/scripts/check-twins.js, .claude/skills/level0/lib/size.js sizeFaults, branches/test.go (testVerb, goPackagesOf, goTestNames), doors.go filesUnder, and port_f_testverb_test.go.
Callers came from a grep for SizeFaults and sizeFaults( across src, and from the branch verb table for testVerb.
The first done_when line meets TestAProseFilePastTheCeilingGrowsALineAndTheSizeGoldenHolds under go test ./src/modules/check/; the second meets TestGoldenReadersNameEveryPackageReadingAChangedGolden plus a run of ./RUNME.sh branch test at tests-green that lists src/quack and src/modules/check; ./RUNME.sh check stands as its own command.

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
