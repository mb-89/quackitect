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
step: design/tests-red
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
record:
  - step: design/draft
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: bfd961e3a1a115624ec4e332bf6fce7f032e00f7
    hash_after: bfd961e3a1a115624ec4e332bf6fce7f032e00f7
    inputs:
      - name: ask
        hash: 1c990e737b4c9045
        size: 442
      - name: [[spec/rationales/git-stays-the-archive]]
        hash: 313be7c0f847c084
        size: 1574
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: c938df9cee1071e3c8e0a9cab462ece048f70785
    hash_after: c938df9cee1071e3c8e0a9cab462ece048f70785
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: f5a11fbea75be2a5
        size: 1778
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: [[spec/rationales/git-stays-the-archive]]
  - step: design/draft
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 621f88114f824f3e682476ef3069dc071c6d533c
    hash_after: 621f88114f824f3e682476ef3069dc071c6d533c
    inputs:
      - name: ask
        hash: 1c990e737b4c9045
        size: 442
      - name: [[spec/rationales/git-stays-the-archive]]
        hash: 2bf04f9d82d2183d
        size: 1605
    def: 7883b3d10633c780
---

# Ask

The queue reads `cloud: true` on a group ticket for the group's place in the cloud, and reads no git ref for it. [[spec/rationales/git-stays-the-archive]] argues it.

The marker exists so the queue reads files alone. Until the queue reads it, every count still reads git.

- a case with a marked group and no branch reads the group as the cloud's
- a case with a branch and no marker reads the group as the desk's
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

work-answer.js fills cloudsIn(all): it answers the names the cloud holds off the tickets alone, each group whose ticket carries cloud: true (read by CLOUD_MARK from work-merge.js) and each ticket whose group field names one of them. placesIn sets onCloud to cloudsIn(all), in place of the inline marked set that marked-groups-stay-cloud added and the union with the unmerged branches of read.stand. So a branch with no marker stays on the desk, and a marker with no branch goes to the cloud. read.stand still feeds ticketsIn, since a branch carries its own tickets. Weighed: the marker key lives in work-merge.js, so the reader imports it and spells no second key; the rationale change that staled this draft renames the git door to the git IO module and leaves the marker rows as they stand, so the approach holds. Assumed: a closed ticket leaves the cloud as it does today, and the state check stays beside the set.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/work-answer.js: placesIn, which builds onCloud,src/scripts/work-answer.js: answerOf, which calls placesIn,src/scripts/work-list.js: queueOnly, which reads CLOUD_PLACE off answerOf,src/scripts/ticket-yours.js: queueIn, which reads CLOUD_PLACE,src/tui/work/workplaces.go: countTakeable and Placed, which read the place off the answer,src/plan/golden_test.go: the golden replay, which reads the places placesIn captures,test/level0/work-answer-cloud.test.js: both cases, which plant a marker and keep passing,test/level0/work-marked.test.js: both cases, which plant a marker and keep passing

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/queue-cloud.test.js: a marked group with no branch reads as the cloud's, and its child with it,test/level0/queue-cloud.test.js: a group with a branch and no marker reads as the desk's

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first: no review has read this draft; the engine staled it on the rationale change alone

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/scripts/work-answer.js,test/level0/queue-cloud.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened placesIn, cloudsIn, ownTickets, ticketsIn and answerOf in work-answer.js, CLOUD_MARK in work-merge.js, and the readers of CLOUD_PLACE, and checked each claim there
the callers come off a grep for placesIn and CLOUD_PLACE over src and test, the marker tests among them
the first two done_when lines meet the two queue-cloud cases, and the check decides the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/queue-cloud.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/queue-cloud.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The marked-group case fails on its assertion, since cloudsIn stands as a stub answering no name. The branch-and-no-marker case passes already, since it asks for no name, and it holds the desk side once placesIn reads the marker. The surprise: the cloud set lived inside placesIn, so no case ever reached it without a git read.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets the marked-group case, red on its assertion, the second meets the no-marker case, and the check decides the third
cloudsIn reads the ticket texts a case plants, so no door stands in the case

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
