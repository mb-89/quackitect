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
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "The route strands: the reject round wires no input, and the route verb refuses the rewire. Do you rewire four inputs by hand, or does the engine fix land first?"
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["I rewire by hand", "the engine fix lands first"]
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: ["design/draft-2", "design/tests-red"]
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
    not: design/draft-2
    tags: ["review"]
    input: ["design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft-2", "gate"]
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
        input: design/tests-red-2
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 8ac6708a8e1ef2ee9c5b65e70efa7b64e168f0aa
    hash_after: 8ac6708a8e1ef2ee9c5b65e70efa7b64e168f0aa
    inputs:
      - name: ask
        hash: 51cba604bf4d0a4a
        size: 822
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: d8a6b89ab773213fb04e947113907f223cbe83fe
    hash_after: d8a6b89ab773213fb04e947113907f223cbe83fe
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 202c93b0d8e8b6f7
        size: 2365
    def: 08e16d07b0de477c
  - step: gate
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: 172fd0c19e906958617353edd36f0758fc0e6d66
    hash_after: 172fd0c19e906958617353edd36f0758fc0e6d66
    returns: 1
    why: "keptRed reads the wrong tree. `passed` in pull-writes.js writes `hash_after` as the tip before the pass commit, and `landed` stages the red tests of the hand into that pass commit, so `git ls-tree -r <hash_after>` holds no new red test and the keep never holds. The own red pass of this ticket shows it: d8a6b89ab lacks test/level0/pull-kept.test.js, and the pass commit f46fe8257 carries it. The red pass of the-retro-reads-the-backlog shows it too: 916443192 lacks retro-backlog.test.js and retro-route.test.js, and its pass commit f27f6c9fc carries them.; A whole-file blob check fails the case the ask names. implement/change 7c8c13970 appends cases to retro-mint.test.js and retro-backlog.test.js, so their blobs move while their red cases stand, and only the renamed route test keeps its blob 312a209. That ticket still strands at implement/tests-red. Pick a keep that survives an appended case, or take the other branch of the ask: a rerun at the recorded commit.; The replay case replays no real rewind. Its fake answers `git ls-tree -r <hash_after>` with the test present, and its record holds the red pass alone: no change pass, no stale review, no appended case. Build the fixture off the record of the-retro-reads-the-backlog, so the case fails on a keep that rescues nothing.; The keep also runs before the change lands. On the standard route a draft edit marks design/tests-red stale, `inputRead` puts the step there, and `advanced` keeps it, so a case the edited draft adds is never written red. Keep a red leaf only where a pass of a later leaf follows its red pass.; The callers list names `blessed` in pull-bless.js, which stands nowhere. The caller is `bless`, and `offer` in pull-hand.js calls `advanced`."
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: design/tests-red
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 0a66d07cd42e7e837b08ee7a608c10eeb7694089
    hash_after: 0a66d07cd42e7e837b08ee7a608c10eeb7694089
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: d6c724cf430b4044
        size: 2389
    def: 08e16d07b0de477c
  - step: design/person-1
    hand: box d7e124b659cd · claude-code-remote
    hash_before: cb283afbeb2e92103d450464c2457412c8865039
    hash_after: cb283afbeb2e92103d450464c2457412c8865039
    def: de8d3ba136f0aaf6
  - step: design/draft-2
    hand: box d7e124b659cd · claude-code-remote
    hash_before: a12f7b5fd431de985d6dbc43ded88f2dcec2e8aa
    hash_after: a12f7b5fd431de985d6dbc43ded88f2dcec2e8aa
    inputs:
      - name: ask
        hash: 51cba604bf4d0a4a
        size: 822
    def: 2fcb4abe3d77d8a2
  - step: design/tests-red-2
    hand: box d7e124b659cd · claude-code-remote
    hash_before: d934fbeb92967b7c43566ce77c881c6a85a8665c
    hash_after: d934fbeb92967b7c43566ce77c881c6a85a8665c
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft-2
        hash: 47e2a8aa183d46f9
        size: 4331
      - name: design/tests-red
        hash: 373bad37aa8acb37
        size: 672
    def: 5d2a6efe5d767d68
  - step: gate
    hand: box d7e2385398cd · claude-code-remote
    hash_before: a445e6fd42300f1f3775c0f98641fa0c5069edf3
    hash_after: a445e6fd42300f1f3775c0f98641fa0c5069edf3
    inputs:
      - name: design/draft-2
        hash: 47e2a8aa183d46f9
        size: 4331
      - name: design/tests-red-2
        hash: 894c4d79a61e9314
        size: 1231
    def: 4133e17eb1a59324
  - step: implement/change
    hand: box d7e2385398cd · claude-code-remote
    hash_before: cd04bfcb3286dc0e6e32d8f95f09635f88538472
    hash_after: cd04bfcb3286dc0e6e32d8f95f09635f88538472
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    def: f150b8c0dc20fe45
---

# Ask

A ticket whose design review goes stale after its change lands walks back to green, so the box that builds it closes its group.

A stale design review sends a ticket back to `implement/tests-red`, whose evidence expects a failing assertion. Once the change lands the tests pass, so no rerun passes the step and the ticket strands mid-route. `the-retro-reads-the-backlog` stands there: a rename moves its route test, rewrites the draft's test list, and marks `design/review` stale after `implement/change` passes.

- a rewind keeps a landed `tests-red` whole while its tests stand unmoved, or reruns it at its recorded commit. A case under `test/level0` decides it
- the case replays the rewind `the-retro-reads-the-backlog` meets, a rename moving a test the draft names
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

A red leaf is a leaf whose evidence holds a command field expecting `assertion`. The walk meets one that a pass in the record already carries. The walk reads every test its command names. Where the tree of that pass's `hash_after` holds each one's content too, the walk keeps the leaf and goes past it. The entry reads `{ step, skipped: true, kept: <hash_after>, why }`, so the progress counts it passed and the stale read reads the red pass behind it.

The check reads content, so a rename moving a test keeps the leaf. A test whose content moved hands the leaf out again, as today.

| part | where |
|---|---|
| `keptRed(it, text, leaf)` answers the check | `src/scripts/pull-kept.js`, new |
| the walk after a pass calls it beside the `when` condition | `stepOn` in `src/scripts/pull-writes.js` |
| the walk at a pull calls it, so a ticket already stranded walks on | `advanced` in `src/scripts/pull-hand.js` |
| the file hashes of the red commit | `git ls-tree -r <hash_after>` through the git door |
| the file hash of each working test | `git hash-object <path>` through the git door |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/pull-writes.js`, `stepOn`, which a pass runs
- `src/scripts/pull-bless.js`, `blessed`, which runs `stepOn`
- `src/scripts/pull-hand.js`, `advanced`, which a pull runs

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/pull-kept.test.js`, a rewound ticket walks past a red leaf whose tests stand as they stood red
- `test/level0/pull-kept.test.js`, a rename moving a test the draft names keeps the red leaf, the rewind the-retro-reads-the-backlog meets
- `test/level0/pull-kept.test.js`, a test whose content moved hands the red leaf out again
- `test/level0/pull-kept.test.js`, a pull meeting a ticket stranded at a red leaf walks it on

The done lines and the case deciding each:

- the rewind keeps a landed `tests-red`: the first case
- the replay of the rename: the second case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/pull-kept.js`
- `src/scripts/pull-writes.js`
- `src/scripts/pull-hand.js`
- `test/level0/pull-kept.test.js`
- `spec/design_output/pull.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `stepOn`, `advanced`, `inputRead` and `lastOf` stand opened. A skipped entry counts as passed in `passedSteps` of `src/tickets/tickets.go`
- the callers come off a search for `stepOn(` and `advanced(` over `src`
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/pull-kept.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/pull-kept.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The rerun meets the same four cases failing on their own assertion over the stub keptRed: the kept leaf, the rename, the rewound review walking past, and the stranded ticket walking on. The case where a test's content moves passes over the stub, because it guards the other side. The gate rejects the design these cases test, so tests-red-2 rewrites them over draft-2.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case above: the keep, the rename replay, and the check at tests-green
- the git door the cases reach answers through the fake git of pull-doors.js

## person-1

<!-- The route strands: the reject round wires no input, and the route verb refuses the rewire. Do you rewire four inputs by hand, or does the engine fix land first? -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is choice -->

I rewire by hand

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The keep reads the pass commit, follows renames, and holds only after the change lands. A red leaf is a leaf whose evidence holds a command field expecting `assertion`.

`keptRed(it, text, leaf)` answers a kept entry where all four hold, and null otherwise:

| read | how | the finding it answers |
|---|---|---|
| the red pass | the last entry of the leaf carrying `def`, with no `stale`, `skipped` or `returns` | |
| a later pass | an entry after it, of a leaf past the red leaf in route order, carrying `def` and no `returns` or `stale` | the keep runs before the change lands |
| the red commit | `git log --reverse --ancestry-path --format=%H%x09%s <hash_after>..HEAD`, the first subject reading `<ticket>: passes <leaf>` | keptRed reads the wrong tree |
| the red tests stand | `git show --name-status --format= <red commit>` names the test files the red pass lands. `git diff -M --name-status <red commit> HEAD` maps each through a rename. Each one stands at HEAD | a whole-file hash fails an appended case |

The entry reads `{ step, skipped: true, kept: <red commit>, why }`. `passedSteps` counts a skipped entry as passed, and `inputRead` passes over an entry with no `def`.

A red pass landing no test file keeps nothing, and a private ticket keeps nothing, since its `hash_after` stands empty. Either hands the leaf out as today.

| part | where |
|---|---|
| `keptRed` answers the four reads | `src/scripts/pull-kept.js`, the stub today |
| the walk after a pass writes the kept entry and goes on | `stepOn` in `src/scripts/pull-writes.js`, beside the `when` read |
| the walk at a pull does the same, so a stranded ticket walks on | `advanced` in `src/scripts/pull-hand.js`, beside the `when` read |
| the design note gains the kept leaf | `spec/design_output/pull.md`, under the stale read |

The cost: once the change lands, a case a later draft appends to a standing red file runs green, never red. A red run at that point proves nothing, because the change it guards already stands.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/pull-writes.js`, `passed`, which runs `stepOn`
- `src/scripts/pull-bless.js`, `bless`, which runs `stepOn`
- `src/scripts/pull-hand.js`, `offer`, which runs `advanced`
- `src/scripts/pull-kept.js`, `keptRed`, which `stepOn` and `advanced` call

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/pull-kept.test.js`, a red leaf whose tests land in its pass commit, and stand there, is kept once the change passes
- `test/level0/pull-kept.test.js`, the rewind the-retro-reads-the-backlog meets keeps its red leaf: red commit f27f6c9fc, cases appended at 7c8c13970, the route test renamed, and the review going stale
- `test/level0/pull-kept.test.js`, a red test deleted with no rename hands the red leaf out again
- `test/level0/pull-kept.test.js`, a red leaf rewound before a later leaf passes hands out again, so a case the edited draft adds runs red
- `test/level0/pull-kept.test.js`, a pull meeting a ticket stranded at its red leaf walks it on to the change

The done lines and the case deciding each:

- the rewind keeps a landed `tests-red`: the first case
- the replay of the rename: the second case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- keptRed reads the wrong tree: the keep reads the pass commit, found as the first commit after `hash_after` whose subject passes the leaf
- a whole-file hash fails an appended case: the keep asks that each red test file stand at HEAD, through a rename, and reads no content
- the replay replays no real rewind: the second case carries the record and commits of the-retro-reads-the-backlog, so a keep answering null fails it
- the keep runs before the change lands: a later leaf's pass must follow the red pass, and the fourth case holds it
- the callers list names `blessed`: it names `bless` in `pull-bless.js` and `offer` in `pull-hand.js`

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/pull-kept.js`
- `src/scripts/pull-writes.js`
- `src/scripts/pull-hand.js`
- `test/level0/pull-kept.test.js`
- `spec/design_output/pull.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `stepOn`, `passed`, `bless`, `offer`, `advanced`, `inputRead` and the record of the-retro-reads-the-backlog stand opened. `f27f6c9fc` is the child of its recorded `hash_after` and lands its three red tests
- the callers come off a search for `stepOn(` and `advanced(` over `src/scripts`
- each done line names the case deciding it

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/pull-kept.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/pull-kept.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Over the stub keptRed, three cases fail on their own assertion: the keep off the pass commit, the backlog replay, and the stranded ticket at a pull. Two cases pass over the stub, because they guard the other side: a deleted red test, and a rewind before the change passes.

| the case | the class of fault it guards |
|---|---|
| a red test landing in its pass commit | a keep reading `hash_after`, the tree before the red tests land |
| the backlog replay | a keep failing on appended cases or a rename |
| a deleted red test | a keep passing over a test that no longer stands |
| a rewind before the change passes | a keep skipping the red run a new case needs |
| a stranded ticket at a pull | a ticket stranded today stays stranded |

The real git answers the replay copies: `f27f6c9fc` is the first commit after `916443192` passing the red leaf, and `diff -M` reads `R100` for the route test.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a failing case: the keep off the pass commit, the backlog replay, and the check at tests-green
- the git reads reach the fake git of pull-doors.js, keyed by the argv keptRed runs

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- kept-red-subject-matches-whole: the red commit search matches the whole change `passes <leaf>`, since `passes design/tests-red` is a prefix of `passes design/tests-red-2` on this very route, and a startsWith read takes the wrong commit
- kept-red-reads-red-list: the keep reads the test files off the leaf's `red` evidence, since the red pass commit also lands the ticket file and a path filter guesses

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

- the change touches the files of the size list and three more. The file ceiling moves `childrenSay` into `src/scripts/pull-children.js`, with its own test, and `src/scripts/pull.js` exports it
- the keep reaches git through `it.git` alone, and the fake git of `pull-doors.js` answers every case
- `pull-kept.js`, `stepOn` and `advanced` point at `spec/design_output/pull#kept-red-leaves`
- the reads stand once, under Kept red leaves in `pull.md`, and the code points there
- the gate point kept-red-subject-matches-whole lands here. The search reads the ticket name and each whole change

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
