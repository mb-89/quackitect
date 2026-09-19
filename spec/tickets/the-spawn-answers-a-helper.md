---
kind: [[ticket]]
state: open
urgent: true
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/change
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 6895aca948d260403eb59cc9325a61c45499a508
    hash_after: 6895aca948d260403eb59cc9325a61c45499a508
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 60a78552c6259007bde5c3aec1e0241840908d7c
    hash_after: 60a78552c6259007bde5c3aec1e0241840908d7c
    returns: 1
    why: "`takeable` stands in `src/scripts/pull-hand.js`, and `src/scripts/pull.js` re-exports it; the gate naming `helper` beside `person` and `children` stands in `writesHere`; that function stands under `.claude/skills/level0/lib/ticket.js`, so the change lands there; in that function the agent line stands above the helper line, so name it above; the gate reads the box off the hand `handRule` builds, so name the field it gains there; `the-spawn-takes-a-step` stands closed, and a hand writes under `Discussion` alone there [[spec/guidance/tickets]]; that line drops its count, because a command answers it [[spec/guidance/voice]]"
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 9e40a26457e2993b848dcd0d239c13e1ee4f9819
    hash_after: 9e40a26457e2993b848dcd0d239c13e1ee4f9819
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-4
    hash_before: 87ba6fe294419f8415350cf9ef6bdb83fea7fd5f
    hash_after: 87ba6fe294419f8415350cf9ef6bdb83fea7fd5f
    returns: 2
    why: "`writes: true` on a helper leaf hands it to this session, because `handOut` returns `handed` first; say where the spawn fires: `admits` answers `other` today off `excludes` alone; `handRule` gains no field, so the gate cannot tell the helper under `--as` from the session; name the two places `the-spawn-takes-a-step` names: `admits`, and `admits` under `--as`; the count stands in a step chapter of that closed ticket, which a `Discussion` line leaves standing"
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 76c3a09858d563f7a73aaa99fe1d87e8dec15d98
    hash_after: 76c3a09858d563f7a73aaa99fe1d87e8dec15d98
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-6
    hash_before: dffe1e5723e27b0b4f697ee5871a543751d8c390
    hash_after: dffe1e5723e27b0b4f697ee5871a543751d8c390
    returns: 3
    why: "`branch done` refuses while `takeable` answers a path, so a parked leaf lets the box leave; the approach reads that backwards, saying a parked leaf holds the group open; `who.oneStep` carries a flag off `--as`, and carries no name; `handRule` takes no `who` at either call site, so name the argument it gains; the ticket door refuses a hand's write to a step chapter of a closed ticket; say which hand drops the count there, because a `Discussion` line leaves it standing; name the taker per road, because a spawn off `not:` admits a person too"
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: a28e7874652cdbbff9e7787b127aed02bb6ed328
    hash_after: a28e7874652cdbbff9e7787b127aed02bb6ed328
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-8
    hash_before: 34e8b8a756c0d14c9a6332b48ea9d42715274670
    hash_after: 34e8b8a756c0d14c9a6332b48ea9d42715274670
  - step: implement/tests-red
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 02f87cca866e6dc072b076e7acfe23b7d0635e54
    hash_after: 02f87cca866e6dc072b076e7acfe23b7d0635e54
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A step wanting a helper reaches the hand that takes it. The group behind it closes on a box that spawns, and parks on a box that cannot.

<!-- breaks, as text: what breaks if it is never done -->
A leaf `by: helper` parks today. The spawn answer passes it, a hand under `--as` reads it as no work, and the group holds open. Reading that leaf as work on every box is the same wall on the other side. A box off a harness then holds the group open for good.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the answer says how `takeable` gates a helper leaf on the box, the way it gates an agent step
- the answer names the taker of a spawn off a plugin: a person, a helper, or both
- a case proves the shell answer off a plugin, which the ask's third row names
- the count of commands in the spawn prompt reads true, in the note and in the prompt
- `./RUNME.sh branch test test/level0/pull.test.js test/level0/level1.test.js` answers green

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The gate reads one field, and each caller answers it for the road it stands on.

| the answer | where it lands |
|---|---|
| the gate | `writesHere`, under `.claude/skills/level0/lib/ticket.js` |
| the field | `handRule` in `src/scripts/pull-hand.js`, which gains an argument for it |
| the spawn | `admits` in that same file |
| the taker, per road | the spawn row of [[spec/design_output/pull#a-hand-of-its-own]] |
| the case | `test/level0/pull.test.js` |
| the count | the `Discussion` of [[spec/tickets/the-spawn-takes-a-step]] |

The gate line reads `by: helper` and asks one question: does this hand take a helper leaf? `handRule` takes that answer as an argument, because neither call site reads it off `it`.

| the caller | what it hands in | what the box then does |
|---|---|---|
| `admits`, the pull's hand-out | the flag `who.oneStep` carries off `--as` | the spawned hand takes the leaf, and the session reads the spawn answer |
| `takeable`, which `standsOpen` reads | the harness on the box | `branch done` refuses on a harness box, and leaves on one off it |

So a box carrying a harness holds the group until the helper lands, and a box off one leaves the group open behind it.

- `admits` answers `other` for a helper leaf on a harness box, so `handOut` prints the spawn prompt
- the spawn row names a helper as the taker of a leaf under `by: helper`
- the same row names a person or a helper for a leaf the `not:` rule excludes
- the cases drive a group whose only open leaf reads `by: helper`, one box a side

A box off a harness reads the shell's own answer. A box carrying one reads `spawn`, the helper name and the prompt. A pull under `--as` takes the leaf.

The count stands in a step chapter of a closed ticket, and the ticket door refuses a hand's write there. So the `Discussion` line carries the correction, and names `spawnPrompt` as what answers the count. A reader of that chapter alone still reads the stale number, which is what the door costs.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The spawn case and the `--as` case stand red. The parking case stands green already, because `writesHere` refuses a helper leaf on every box.

What surprises: the ask reads the park as the fault, and the park is the half that holds. The fault stands on the other side, where a harness box parks the leaf too and the group holds open.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases stand in `test/level0/pull.test.js`, which the ask's last row names
- the cases drive `doors` in `pull-doors.js`, so git and the disk stand fake
- a comment over the fixture names this ticket, and every case points at it

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion


- [[spec/tickets/the-spawn-takes-a-step]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times: takeable takes a leaf wanting a helper as work on every box. A box off a harness leaves that leaf parked, and branch done holds the group open. Gate it as a step for an agent gates on the box.
  - The change to the spawn answer carries no case. The ask third row wants the shell answer proven, so add a fifth case over it.
  - The prompt the engine writes carries two commands, not three. Say what stands.
  - The design output row for a spawn off a plugin parks the step for a person or a helper. A leaf wanting a helper admits one taker, the helper. Say which the row means.
  - ./RUNME.sh check answers 1 over faults the whole tree carries, and this leaf adds none.
