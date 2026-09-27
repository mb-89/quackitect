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
group: the-cloud-works-its-queue
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 3a80df1de257d7830de164a1588646aaed4dc85e
    hash_after: 3a80df1de257d7830de164a1588646aaed4dc85e
    inputs:
      - name: ask
        hash: a2273d7db3871c84
        size: 1188
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 44a24eefed0ec2f7d97269e00994a7c28bd03e35
    hash_after: 44a24eefed0ec2f7d97269e00994a7c28bd03e35
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 73c915269fbb03e7
        size: 2317
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e093d924e2 · claude-code-remote · helper-4
    hash_before: 45d90f96344278d3751e986cd6bd55f77dff5988
    hash_after: 45d90f96344278d3751e986cd6bd55f77dff5988
    inputs:
      - name: design/draft
        hash: 73c915269fbb03e7
        size: 2317
      - name: design/tests-red
        hash: 8b4209e6b4a73d66
        size: 755
    def: dc4904ab364efa10
---

# Ask

A group ticket carrying `fix: true` reads as a fix group, and a fix group hands back no ticket for an agent. So a feature group's follow-ups go to one fix group, and a fix group's rest goes to a person. For the rule, see [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]. A ticket's hand reads off `waitsOnPerson` in `src/scripts/work-answer.js`, so no new field names it.

Without it a fix group files fixes of its own fixes, and each round opens the next with no end. The cloud then spends its runs on follow-ups of follow-ups.

- `spec/schemas/ticket.schema.yaml` carries `fix`, a boolean on a group ticket, which the dispatch writes
- `waitsOnPerson` stands exported as the one reader of a ticket's hand
- a case in `test/level0/work-done.test.js` finds `branch done` on a fix group refusing an agent ticket it leaves
- the refusal names each such ticket, and the mint line that turns it into a question ticket
- a case there lets `branch done` on a fix group pass where every ticket it leaves waits on a person
- a case there lets a feature group hand back an open agent ticket as it does today
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

The schema spec/schemas/ticket.schema.yaml gains fix, a boolean on a group ticket, which the dispatch writes. A new module src/scripts/work-fix.js holds fixLeaves(it, text), which answers the agent tickets a fix group leaves. It reads nothing where the group ticket lacks fix: true. Otherwise it lists the tickets the branch adds through git diff --name-only --diff-filter=A origin/main...HEAD -- spec/tickets. It keeps each one that stands open, names no group, is no group itself, and where waitsOnPerson answers false. finish in src/scripts/work.js calls it after childrenStand and before the retro read. Where it answers any ticket, done answers 1 and names each with the two lines turning it into a question ticket: ./RUNME.sh mint ticket spec/tickets/<name>-question.md --process=question, then ./RUNME.sh ticket pull <name> --became <name>-question. A feature group reads no fix field, so fixLeaves answers nothing and done hands back its loose agent tickets as it does today. waitsOnPerson stands exported from src/scripts/work-answer.js, as dispatch-prints-its-plan writes it, so the queue, the plan and this refusal read one rule.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/work.js: finish, which branch done runs, calls fixLeaves after childrenStand
- src/scripts/work-answer.js: the queue keeps reading waitsOnPerson, now an export
- src/scripts/work-fix.js: fixLeaves reads waitsOnPerson and the branch diff

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/work-done.test.js: done on a fix group refuses an agent ticket it leaves, and names the mint of a question ticket for it
- test/level0/work-done.test.js: done on a fix group passes where every ticket it leaves waits on a person
- test/level0/work-done.test.js: done on a feature group hands back an open agent ticket it adds, as it does today

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/schemas/ticket.schema.yaml
- src/scripts/work-fix.js
- src/scripts/work.js
- src/scripts/work-answer.js
- test/level0/work-done.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened work.js finish and childrenStand, work-answer.js waitsOnPerson, work-merge.js freeChildren and the schema, and each claim stands there
- the callers list names finish, the queue and the new reader
- each done_when line names its case under tests, the schema line names the schema file, and ./RUNME.sh check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-done.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/work-done.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The refusal case fails on its own assertion, since done closes a fix group today whatever it leaves. The two cases where done passes stand green already, as they should: the one on a feature group holds what done does today, and the one on a person ticket holds the road the fix leaves open. The fixture reuses the group at children with no retro, which the hash_after case uses, so no retro leaf holds done back.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line on done meets a case, the schema line meets the check reading ticket fronts, and ./RUNME.sh check decides the last
- the cases reach git and the disk through the fakes of work-doors.js alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- fix-schema-case-reads-fix: no red test decides the schema done_when line. The ticket front sets additionalProperties false, but no tracked ticket carries fix: true, so ./RUNME.sh check passes with or without the field. Add a case validating a group front carrying fix: true against spec/schemas/ticket.schema.yaml, or record the line as a checkpoint the implementer answers.

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
