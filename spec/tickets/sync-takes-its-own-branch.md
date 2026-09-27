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
group: the-engine-fixes-its-faults
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 3d1b5e98078a6929cb1e508ff7820d3ae42580a5
    hash_after: 3d1b5e98078a6929cb1e508ff7820d3ae42580a5
    inputs:
      - name: ask
        hash: 6badf2fef8cc2c49
        size: 930
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 0e3084f212ce2189d4f8ad3397be7c47079dd9f2
    hash_after: 0e3084f212ce2189d4f8ad3397be7c47079dd9f2
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 0e65d3bce77dde27
        size: 2352
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2385398cd · claude-code-remote
    hash_before: d07ee270beb53d317101f8f0bebae243043042e2
    hash_after: d07ee270beb53d317101f8f0bebae243043042e2
    inputs:
      - name: design/draft
        hash: 0e65d3bce77dde27
        size: 2352
      - name: design/tests-red
        hash: 2622c78095a29ba1
        size: 659
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Where the remote carries a commit the box lacks, `branch sync` on a work branch takes `origin/<the branch>` in first. It takes it with a plain merge, then takes `main`. So a box whose branch another hand pushed to keeps both sides and goes on, and asks nobody.

Without it the box meets a pull that suggests `git pull --rebase`, which level zero refuses, and stops. On 09-27 the box on `work/the-foundation-closes-its-gaps` held 14 unpushed commits past a commit the desk pushed. It asked the owner in the chat and stood there for hours, and every migration group waited behind it.

- a case in the sync tests merges a diverged `origin/<branch>` into the box's branch and keeps both sides' commits
- a case there leaves the branch alone where the remote carries nothing new
- a real conflict between the two sides stops with the files named, as the trunk merge does
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

On a work branch, `sync` takes the remote's copy of the branch in before trunk, through the merge and the settle trunk already uses.

| part | where | what it does |
|---|---|---|
| the own read | `ownIn(it, branch)` in `src/scripts/work-stands.js`, new | runs `git fetch origin <branch>`, then `git rev-list --count HEAD..origin/<branch>`, and answers the count, or zero where the remote holds no such branch |
| the own merge | the same function | where the count stands above zero, runs `git merge origin/<branch> --no-edit -m "<branch>: take origin/<branch> in"`, and on a refusal hands `settles` the branch, `from` as `origin/<branch>`, the count and the message |
| the order | `sync` | calls `ownIn` first on a work branch, stops on its answer of 1, prints `<branch> took N commit(s) from origin/<branch>.`, then runs the trunk step as it runs now |
| the note | `spec/design_output/work.md`, where trunk comes in first | names the own step ahead of trunk |

`settles` already names each file a hand must resolve, and settles a ticket front key by key, so a conflict with the remote stops as a trunk conflict does. A plain merge keeps both sides' commits, and rewrites nothing another hand pushed. On `main`, `sync` stands as it is.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/work.js`, the `sync` verb, which reads `sync(it) === 1`
- `src/scripts/work-stands.js`, `settles`, which the own merge now calls too
- the group route's `sync` step, which needs `branch sync`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/work-sync.test.js`, sync on a work branch merges a diverged remote branch and keeps both sides
- `test/level0/work-sync.test.js`, sync on a work branch leaves the branch alone where the remote carries nothing new
- `test/level0/work-sync.test.js`, a conflict with the remote branch stops and names the files

The done lines and the case deciding each:

- the diverged merge: the first case
- nothing new: the second case
- the conflict: the third case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/work-stands.js`
- `test/level0/work-sync.test.js`
- `spec/design_output/work.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `sync`, `settles`, `unmergedIn` and the `sync` verb in `work.js` stand opened, and each reads as the table says
- a search for `sync(` over `src/scripts` names the callers
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/work-sync.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/work-sync.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Two cases fail on their own assertion: the diverged merge, and the conflict with the remote branch. The case where the remote carries nothing new passes today, because it guards the side the change leaves alone. The fake git answers an unknown count with nothing, so the older cases read the remote branch as carrying nothing and stand as they are.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case: the diverged merge and the conflict fail red, and the nothing-new case guards the other side
- every git call reaches the fake git of work-doors.js

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

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
