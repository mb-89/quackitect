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
group: quack-verbs-land-in-shadow
depends_on: ["ticket-verbs-become-actions"]
record:
  - step: design/draft
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 830e4c43db498cbc3e04e505bf8423e4af122f48
    hash_after: 784586c7a2a42da50a79dfa2be4ba107421983bd
    inputs:
      - name: ask
        hash: 928b54ee00fca695
        size: 467
      - name: [[spec/tickets/the-need-list-lacks-verbs]]
        hash: 64d6c843b10759d8
        size: 2071
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 5bd8144377a489776c196566b2d7231c0bd683d2
    hash_after: 5bd8144377a489776c196566b2d7231c0bd683d2
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 99a930a70f1b4180
        size: 2813
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8509c02d5db · claude-code-remote · helper-3
    hash_before: f272fbdd6f0a2275d7b480d38ccf198ba717e445
    hash_after: f272fbdd6f0a2275d7b480d38ccf198ba717e445
    inputs:
      - name: design/draft
        hash: 99a930a70f1b4180
        size: 2813
      - name: design/tests-red
        hash: 079b49b2aba3501b
        size: 692
    def: dc4904ab364efa10
---

# Ask

The pull becomes an action answering within the wait its caller sets, in shadow against `cli.js`.

The hand-back is the longest road a hook waits on, and the wait frees it.

- `go test ./...` from the root passes
- `./RUNME.sh log --kind shadow` names each answer the two disagree on
- a case names `branch open` under `needs`, and the pull finds it among the registry's actions. [[spec/tickets/the-need-list-lacks-verbs]] shows the drift
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

The pull stands as the action `ticket/pull` already, which `ticket-verbs-become-actions` registers with no deadline, so a hook waits on it within its own wait. This ticket adds what that leaves: the needs of a leaf resolve against the registry's actions, in shadow beside the table `cli.js` keeps.

| what changes | where it stands | what it does |
|---|---|---|
| the shadow | a new `src/scripts/needs-shadow.js`, `needsShadow` | where `migration.verbs` reads shadow, runs `quack get index/actions`, builds a table of topic and verb off each name, and writes one shadow row a need the two tables answer apart |
| the table | `registryOf` in the same file | reads `branch/open` as the verb open of the topic branch, and takes `work` as a second name for `branch`, as `VERBS` does |
| the call | `pull-hand.js`, beside `shadowLeaf` | hands the leaf's needs to `shadowNeeds`, which runs `needsShadow` over the shadow doors and holds no answer back |
| the drift | `BRANCH` in `src/scripts/pull-route.js` | gains open and unblock, and drops new, so the table answers as `work` does |

What I weigh: `holdsVerb` runs sync on three roads, and a read of the index over a child process on each road costs every pull. The shadow runs once a hand-out, behind the answer, as the guidance slice does. The registry answers alone once `quack-verbs-switch-over` flips the slice, which a line under its Discussion names.

What I assume: the branch topic lands under `work-verbs-become-actions`, so a live index answers `branch/open`. The case over a fake registry holds the drift until then.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/pull-hand.js: the hand-out, which calls shadowNeeds beside shadowLeaf
- src/scripts/pull-route.js: BRANCH and VERBS, which the shadow reads as the old table
- src/scripts/pull-route.js: holdsVerb, which answers both tables
- src/scripts/work.js: the need check at line 310, which reads BRANCH through holdsVerb
- src/bridge/findings.js: shadowDoorsOf, which hands the shadow its doors

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/needs-shadow.test.js: the registry's actions answer branch open for a need naming it
- test/level0/needs-shadow.test.js: a need the two tables answer apart writes one shadow row
- test/level0/needs-shadow.test.js: a slice standing at old runs no quack and writes no row
- test/level0/needs-shadow.test.js: BRANCH holds open and unblock, and lacks new

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- pull-route.js, pull-hand.js, work.js, guidance-shadow.js, findings.js, catalog.go and cli.go stand opened, and each claim checked there
- the callers list names the hand-out, the two tables, the need check and the doors
- go test from the root meets the Go side unchanged, the shadow line meets the row case, the branch open line meets the registry case, and the check meets the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/needs-shadow.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/needs-shadow.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The registry table stands empty, the shadow writes no row, and BRANCH still lists new. Each fails on its own assertion. The case at old passes already, and guards the slice. What surprises: holdsVerb takes a table as its second word already, so the registry table plugs in with no change to it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the shadow line meets the row case, the branch open line meets the registry case, go test meets the Go side unchanged, and the check meets the check verb
- the cases read fake doors: a settings door, a stand-in quack answering action rows, and a log door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- branch-list-reads-work-table: the draft edits BRANCH by hand to match the doing table in work.js, which leaves two copies to drift again; the drift ticket asks BRANCH built off the table work answers, so one place owns the names, with a case holding the two together
- needs-shadow-callers-named-whole: the callers list names pull-hand.js once, but holdsVerb answers there at two sites, the hand-out filter at line 285 and the lacking check at line 426; the builder wires or leaves each on purpose
- needs-wait-on-branch-topic: the branch open done_when line rests on a fake registry, since src/modules/verbs/branch.go registers no action while work-verbs-become-actions stands at gate; depends_on names ticket-verbs-become-actions alone, so the live index answers branch/open only once that ticket lands

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

The draft's callers list names `pull-hand.js` once, and the implement step reads these rows in its place:

| the caller | what it does with a need |
|---|---|
| `takeable` in `src/scripts/pull-hand.js` | skips a leaf whose needs `holdsVerb` refuses |
| `admits` in `src/scripts/pull-hand.js` | names the needs this box lacks, and refuses the hand-out |
| `WORK_VERBS` in `src/scripts/work.js` | owns the branch verbs `VERBS` reads, since `branch-list-reads-work-table` took `BRANCH` away |

The shadow call rides `admits`, beside `shadowLeaf`, so it runs once a hand-out.
