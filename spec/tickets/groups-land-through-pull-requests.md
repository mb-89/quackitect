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
depends_on: [the-skills-start-the-workers, groups-hold-groups]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: c1e6be7fe17b7d12eec357b5ca71cd8aceb2bd88
    hash_after: c1e6be7fe17b7d12eec357b5ca71cd8aceb2bd88
    inputs:
      - name: ask
        hash: 349760fba59859ea
        size: 1911
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: ce4c9b7a3dad50f68331a9b0d4602eebe5e680d0
    hash_after: ce4c9b7a3dad50f68331a9b0d4602eebe5e680d0
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 90735f2272a798bc
        size: 3526
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2326ed644e · claude-code-remote · helper-4
    hash_before: ddc4218d9ec5d09755c47414596ca9b0a5808206
    hash_after: ddc4218d9ec5d09755c47414596ca9b0a5808206
    inputs:
      - name: design/draft
        hash: 90735f2272a798bc
        size: 3526
      - name: design/tests-red
        hash: 446e87edebf6c435
        size: 880
    def: dc4904ab364efa10
---

# Ask

A worker hands its group over as a pull request, per [[spec/design_input/the-cloud-runs-itself#the-hand-over]]. `branch done` writes the close on the branch. The group ticket closes, every open child moves to the parent or stands loose, and the cloud marker drops.

The work skill then opens a pull request over `work/<name>` against `main` through the GitHub connector, with auto-merge on. The merge lands once the check stands green on Linux and Windows. A group at done whose branch stands behind `main`, or past `work.staleAfter`, counts as open work. `branch take` hands it to a worker to sync or fix.

Without it every landing waits for a desk running `branch merge`, and a phone lands nothing. The branches pile up on origin, since a cloud session meets a refusal on a branch delete.

- a case in `test/level0/work-done.test.js` finds `branch done` writing the close on the branch alone
- that case finds the open children moved and the cloud marker dropped, and `main` untouched
- the work skill ends on the pull request with auto-merge on
- the dispatch skill opens its write branch's pull request the same way
- `.github/workflows/check.yml` runs on a pull request against `main`, beside a push
- a case in `test/contract/check-workflow.test.js` reads both triggers
- a case in `test/level0/work.test.js` finds `branch take` handing out a stuck hand-over first
- that case finds the ask printed: sync, check and push
- a case in `test/level0/work-merge-cloud.test.js` finds `branch merge` refusing a branch a pull request carries
- the refusal reads a `refs/pull/<n>/head` on origin at the branch tip, and names the pull request
- `spec/design_output/work.md` carries the new round trip
- `AGENTS.md` and `spec/guidance/cloud/cloud.md` say the work skill opens the pull request
- `spec/funnel/work-lands-through-pull-requests.md` leaves
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

A worker lands its group through a pull request, and the verbs keep main untouched. Each part reuses a function standing already.

1. The close. `leaves` in `src/scripts/work.js` drops the cloud marker on the branch copy through `marks(it, name, false)` from `src/scripts/work-merge.js`, in the same commit as the close. `ready` refuses a branch behind main, so the branch copy carries the marker main wrote. The filing of open children stands from groups-hold-groups. The verb pushes the branch alone.
2. The skills. `.claude/skills/work/SKILL.md` ends on the pull request with auto-merge on, and `.claude/skills/dispatch/SKILL.md` opens its write branch the same way. Both stand from the-skills-start-the-workers, so this ticket checks them and adds nothing.
3. The workflow. `.github/workflows/check.yml` takes `pull_request` on `main` beside `push`, and `test/contract/check-workflow.test.js` reads both triggers.
4. The take. `stuckWhy` moves from `src/scripts/dispatch.js` into `src/scripts/work-free.js` as `stuckIn`, and the dispatch imports it. `take` in `src/scripts/work.js` reads each branch at done first. Where `stuckIn` answers behind or stale, it moves onto that branch through `onBranch`, and prints the ask: run `./RUNME.sh branch sync`, then `./RUNME.sh check`, then push. It writes no record, because the group stands closed.
5. The refusal. `merge` in `src/scripts/work-merge.js` reads `git ls-remote origin refs/pull/*/head` once. Where a row carries the tip of `origin/work/<name>`, it refuses and names the pull request by its number.
6. The notes. `spec/design_output/work.md` gives the round trip its pull request step. `AGENTS.md` and rule 13 of `spec/guidance/cloud/cloud.md` say the work skill opens the pull request. `spec/funnel/work-lands-through-pull-requests.md` leaves.

I assume two boxes taking one stuck branch at once cost a duplicate sync and nothing more, because a sync is idempotent. A claim on a closed group reopens it, so the take writes none.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/work.js leaves: drops the marker
- src/scripts/work.js take: hands a stuck branch first
- src/scripts/dispatch.js planned: imports stuckIn in place of stuckWhy
- src/scripts/work-merge.js merge: reads the pull refs
- src/scripts/work-merge.js marks: called by leaves

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/work-done.test.js: branch done closes on the branch alone, files the children and drops the marker
- test/contract/check-workflow.test.js: the check runs on a push and on a pull request against main
- test/level0/work.test.js: branch take hands out a stuck hand-over first, and prints sync, check and push
- test/level0/work-merge-cloud.test.js: branch merge refuses a branch a pull request carries, and names it

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/work.js
- src/scripts/work-free.js
- src/scripts/dispatch.js
- src/scripts/work-merge.js
- .github/workflows/check.yml
- spec/design_output/work.md
- AGENTS.md
- spec/guidance/cloud/cloud.md
- spec/funnel/work-lands-through-pull-requests.md
- test/level0/work-done.test.js
- test/contract/check-workflow.test.js
- test/level0/work.test.js
- test/level0/work-merge-cloud.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened leaves, ready and take in work.js, marks and merge in work-merge.js, stuckWhy in dispatch.js, check.yml and both skills
- the callers list names every caller of stuckWhy, marks, leaves, take and merge
- each done_when line maps to a case in the tests list, the skill lines stand met, and the notes and the check stand as checkpoints

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-done.test.js test/contract/check-workflow.test.js test/level0/work.test.js test/level0/work-merge-cloud.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/work-done.test.js
- test/contract/check-workflow.test.js
- test/level0/work.test.js
- test/level0/work-merge-cloud.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion, and every earlier case in the four files passes.

- the done case reads the marker still standing on the branch
- the merge case reads the merge going ahead over a branch a pull request carries
- the take case reads the take claiming the free group before the stuck one

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line on code meets a failing case, and the skill lines, the notes and the check stand as checkpoints
- git and the disk take the fakes the earlier cases use, and the workflow case reads the real file under test/contract

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- done-points-at-the-pull: leaves in src/scripts/work.js ends on "Run ./RUNME.sh branch merge <name> from main", and the approach leaves that line; point it at the pull request the work skill opens
- take-hands-a-stale-handover: the take case covers a branch behind main alone; add a case whose tip stands past work.staleAfter, and hand stuckIn a clock time, since take calls readFree(it) with no now
- merge-reads-open-pulls: refs/pull/<n>/head stays on origin after a pull request closes unmerged, so the refusal holds a closed pull's branch until a new commit; give the refusal a road past a closed pull
- agents-keeps-the-desk-rule: AGENTS.md says a session opens no pull request; the edit keeps that for a desk and names the work skill as the one road opening one, so the two lines agree
- take-case-asserts-the-switch: the take case's /push/ match passes on any line naming push; assert the switch onto work/landing and the full push line

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
