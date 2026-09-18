---
kind: [[ticket]]
state: open
urgency: now
step: implement/reflect
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: settle-1
        does: decides between the step and the findings, and writes why
        by: anyone
        to: engine
        asks: "design/review failed back 2 times: A subject carries other ticket names past its prefix. `childrenWaiting` writes `because <children> stand open`, and `became` writes its successor. A guard reading the whole subject refuses a parent's commit. Name the prefix before the colon as what the guard reads.; `changedSince` reads `git status --porcelain` too. A sibling hand writes into the tree this hand shares. Those files stand under no subject, so the span keeps them. Then `formFault` refuses the hand-back for leaving them out. Say what the `read` field does with a file no commit carries yet."
        evidence:
          - name: answer
            form: text
            says: the decision, and why it stands
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: b743c4264990c3b6ed50c9fcc7ded1f61fad972b
    hash_after: b743c4264990c3b6ed50c9fcc7ded1f61fad972b
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-2
    hash_before: 425880b7dac0cbd15209f1c0c640a89a29f14f89
    hash_after: 425880b7dac0cbd15209f1c0c640a89a29f14f89
    returns: 1
    why: "`landed` stages `add -A`, so a sibling's hand-back commits the write this hand leaves in the tree. The range then touches the ticket in hand, and the approach refuses the case the ask passes. Say what the guard does with a hunk this hand wrote.; The verdict leaf takes `read` as form `files`, and `changedSince` spans the first `hash_before` to the tip. A sibling's commit puts its files in that span. Then `formFault` refuses the hand-back for leaving them out. Carry the approach to that guard too.; An empty range and a failed git call both answer no line. The approach gives the two opposite verdicts. Name the `ok` the git door answers as what tells them apart.; The approach refuses a range touching the ticket in hand alone. So this hand's commit under another path passes. The ask refuses this hand's own write, and names no path."
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 0b8adcd0d15827b6bd51c84bba35c2a9198ba457
    hash_after: 0b8adcd0d15827b6bd51c84bba35c2a9198ba457
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-4
    hash_before: f06612771bcc7303a27924495f95ec84c101c52a
    hash_after: f06612771bcc7303a27924495f95ec84c101c52a
    returns: 2
    why: A subject carries other ticket names past its prefix. `childrenWaiting` writes `because <children> stand open`, and `became` writes its successor. A guard reading the whole subject refuses a parent's commit. Name the prefix before the colon as what the guard reads.; `changedSince` reads `git status --porcelain` too. A sibling hand writes into the tree this hand shares. Those files stand under no subject, so the span keeps them. Then `formFault` refuses the hand-back for leaving them out. Say what the `read` field does with a file no commit carries yet.
  - step: design/settle-1
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 95b8552d6bd91c48a3cc832a4a02c69ead267651
    hash_after: 95b8552d6bd91c48a3cc832a4a02c69ead267651
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 4cf8b6e8a2082e2a3240ccf1e98e828d845298b9
    hash_after: 4cf8b6e8a2082e2a3240ccf1e98e828d845298b9
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-7
    hash_before: 914b6b999696d41682792fa1f64f979b656a38fb
    hash_after: 914b6b999696d41682792fa1f64f979b656a38fb
  - step: implement/tests-red
    hand: box dd2a59294365 · claude-code-remote
    hash_before: b9ad397db3b576b5ce3492f47cfb6cf85c20de0a
    hash_after: b9ad397db3b576b5ce3492f47cfb6cf85c20de0a
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 5d9ad496ab7960f23c2f435c23dfd59445e6c2b4
    hash_after: 5d9ad496ab7960f23c2f435c23dfd59445e6c2b4
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 443427ee3fe468668f330a4a3d9a937bd43d55c7
    hash_after: 443427ee3fe468668f330a4a3d9a937bd43d55c7
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 83 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box dd2a59294365 · claude-code-remote · helper-12
    hash_before: 43ddb3d4addd086171a0226ea74160cdef409248
    hash_after: 43ddb3d4addd086171a0226ea74160cdef409248
    returns: 1
    why: "`spec/design_output/pull.md`, under The hand rule, still says a verdict hand-back refuses where the tip moves. Write what `handFaults` reads.; `spec/design_output/pull.md`, the `files` row, still says the field holds every file the branch changes. Write the span `changedSince` answers.; Both rows point at `commitsFor`, under `src/scripts/pull-writes.js`, which owns the split.; What holds:; `handFaults` refuses this ticket's own commit, and takes a sibling's; the diff touches the files the ask names, a test file, and one prose line; `./RUNME.sh check` answers exit 0 on this commit; each rule the branch adds carries a case; a case feeds each rule something bad: this ticket's commit, and a failed log; `HANDOVER.md` carries no retro, and the `says` field carries what changes"
group: the-warnings-feed-a-refactorer
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A verdict hand keeps its pass while a sibling hand on the same box commits:

- one box runs a reader beside its own work, which is the shape a group branch takes
- the reading lands once, in place of once a sibling commit

<!-- breaks, as text: what breaks if it is never done -->

The guard reads the hold's tip against the branch tip, and a helper moves no tip of its own.

| what moves the tip | what the guard does |
|---|---|
| the hand's own write | refuses, which is the rule it holds |
| a sibling hand's commit | refuses, and the reading goes to waste |

The box then drops the hold, spawns a second hand, and pays the reading twice. This run paid it once, on [[spec/tickets/the-runtime-files-stand-apart]] at verdict. The guard stands in `handFaults`, under `src/scripts/pull-chapter.js`.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a case drives a verdict hand-back where a sibling commits, and the pull takes it
- a case drives one where the hand's own read moves, and the pull refuses it
- `./RUNME.sh check` answers 0

# design

## settle-1

<!-- decides between the step and the findings, and writes why -->

### answer

<!-- the decision, and why it stands -->

<!-- the form is text -->

Both findings stand, and the approach takes both.

| the finding | what the approach takes |
|---|---|
| a subject carries other ticket names past its prefix | the guard reads the prefix before the first colon, and nothing past it |
| a working-tree file stands under no subject | it enters the span where the hold's tip stands at the branch tip, and stands outside it where a sibling moves that tip |

**Why the prefix.** `landed` writes `${one.name}: ${changes}`, so the name
before the colon is the ticket the commit belongs to. What follows names
children and successors, which belong to other tickets.

**Why the tree turns on the tip.** A working tree names no hand. Two readings
stand, and each costs something:

| the reading | what it costs |
|---|---|
| the span keeps every tree file | a sibling's write refuses the reader, which is the bug the ask names |
| the span drops the tree where a sibling moves the tip | a file this hand reads stands outside the `read` field |

The first cost is the ask. The second costs a list one line, and the reader
names what it reads either way. So the span reads the commits alone once a
sibling stands on this box.

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Both guards read the commits, in place of the tip, and a commit naming the
ticket in hand is this hand's.

| guard | what it reads today | what it reads |
|---|---|---|
| `handFaults` | the hold's tip against the branch tip | the subjects between the two, refusing where one names this ticket |
| `changedSince` | every file the span touches | the files under the commits naming this ticket, and the working tree |

`landed` commits as `<ticket>: <what>`, so the name before the first colon says
whose commit it is. What follows names children and successors, and the guard
reads none of it. One function answers the prefix, beside `changedSince` in
`src/scripts/pull-writes.js`, and both guards call it.

The working tree names no hand, so it turns on the tip:

| where the tip stands | what the span takes |
|---|---|
| at the hold's tip | the commits naming this ticket, and the working tree |
| past it, which says a sibling writes here | the commits naming this ticket alone |

| the finding | what answers it |
|---|---|
| a sibling's `add -A` sweeps this hand's write in | that commit carries the sibling's subject, so the range names this ticket nowhere |
| the `read` field refuses on a sibling's commits | those files stand under a prefix this ticket names nowhere, so they leave the span |
| the `read` field refuses on a sibling's tree write | the span drops the tree once a sibling moves the tip, as the settle step decides |
| a subject naming a child or a successor | the guard reads the prefix, and nothing past it |
| an empty range reads as a failed call | the git door answers `ok`, and a call that fails refuses, as today |
| this hand's commit under another path | the subject names the ticket whatever path it carries |

**What stands outside it.** A hand committing past the verbs writes its own
subject, and the guard reads the subject alone. The verbs are the road the ask
names, and a hand off them stands outside this guard.

**The cases.**

- a sibling's commit moves the tip, and the pull takes the verdict
- a commit naming this ticket moves it, and the pull refuses
- the tip stands where the hold left it, and the pull takes the verdict
- the git call fails, and the pull refuses
- the `read` field names the files under this ticket's commits, and passes
- a sibling's files stand outside that list, and the field passes without them
- a subject naming a child past its prefix reads as this ticket's own commit
- a sibling moves the tip, and a file standing in the tree alone leaves the span

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The guard reads the prefix before the first colon, which is the name `landed` writes.
- A subject naming a child or a successor past the prefix reads as this hand's commit.
- The `read` field spans the commits whose prefix names this ticket.
- It holds the working tree where the hold's tip stands at the branch tip, as design/settle-1 decides.
- A sibling's `add -A` lands under the sibling's prefix, so the range names this ticket nowhere.
- The git door answers `ok`, which tells an empty range from a failed call.
- The prefix names the ticket whatever path a commit carries, so this hand's own write refuses.
- Each done_when case stands in the case list, so the implement leaf has a test for each.
- The approach puts a commit made past the verbs outside the guard, and says so.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Eight cases stand in `test/level0/verdict-guard.test.js`, and four fail on their
own assertion. The four that pass read what the guard does today.

| the case | why it fails |
|---|---|
| the prefix names the ticket | `commitsFor` answers a stub, so the split reads empty |
| a sibling's commit moves the tip | the guard refuses, which is the bug |
| the span leaves a sibling's files | the span keeps them |
| the span takes the tree where the tip stands still | the span answers the old list |

**What surprises me.** The fake process door keys its table on the whole argv,
`git` and all. A key leaving it out falls back to the `git` row, so every call
answers an empty string and a case fails for the wrong reason.

The git door trims what it answers, so a log of one line and a log of none read
alike. The `ok` flag tells them apart, which is why the case for a failed call
drives the exit code.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch the two files the ask names, and one test file of their own
- the git door has a fake, and every case teaches it the calls the guard runs
- the file's own comment names the approach, and each case points at this ticket

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint src/scripts/pull-writes.js src/scripts/pull-chapter.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two files the ask names, and no other
- the git door has a fake, and the cases teach it every call the guards run
- a comment beside `commitsFor` names the approach, and points at this ticket

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A verdict hand keeps its pass while a sibling hand commits beside it. Both
guards read the commits between the hold's tip and the branch tip, in place of
the tip alone.

| the guard | what it reads |
|---|---|
| `handFaults`, on a verdict leaf | it refuses where a commit in that range names this ticket |
| `changedSince`, under the `read` field | it takes the files under this ticket's commits |

`commitsFor` in `src/scripts/pull-writes.js` answers the split. `landed` commits
as `<ticket>: <what>`, so the name before the first colon says whose commit it
is, and what follows names children and successors.

**What the working tree does.** A tree names no hand, and a sibling writes into
the one this hand shares.

| where the tip stands | what the span takes |
|---|---|
| at the hold's tip | this ticket's commits, and the tree |
| past it, which says a sibling writes here | this ticket's commits alone |

**What stands outside it.** A hand committing past the verbs writes its own
subject, and the guard reads the subject alone. A log the git door fails to read
answers `read: false`, which every caller takes as a move, so a failure refuses
as it does today.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two files the ask names, and one test file of its own
- the git door has a fake, and the cases teach it every call the guards run
- a comment beside `commitsFor` names the approach, and points at this ticket

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- HANDOVER.md
- spec/design_input/the-agent-pulls-tickets.md
- spec/design_output/pull.md
- spec/guidance/review/reviewing.md
- spec/tickets/the-verdict-guard-reads-tips.md
- src/scripts/pull-chapter.js
- src/scripts/pull-writes.js
- src/scripts/test-verb.js
- test/level0/verdict-guard.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- `spec/design_output/pull.md`, under The hand rule, still says a verdict hand-back refuses where the tip moves. Write what `handFaults` reads.
- `spec/design_output/pull.md`, the `files` row, still says the field holds every file the branch changes. Write the span `changedSince` answers.
- Both rows point at `commitsFor`, under `src/scripts/pull-writes.js`, which owns the split.

What holds:

- `handFaults` refuses this ticket's own commit, and takes a sibling's
- the diff touches the files the ask names, a test file, and one prose line
- `./RUNME.sh check` answers exit 0 on this commit
- each rule the branch adds carries a case
- a case feeds each rule something bad: this ticket's commit, and a failed log
- `HANDOVER.md` carries no retro, and the `says` field carries what changes

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the code states the fact once, beside `commitsFor`, and each comment points here. The rows the findings name still state the fact it replaces.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
