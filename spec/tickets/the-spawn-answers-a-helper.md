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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 6895aca948d260403eb59cc9325a61c45499a508
    hash_after: 6895aca948d260403eb59cc9325a61c45499a508
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

A helper leaf gates on the box, the way an agent step gates, and the helper is its one taker.

| the finding | where it lands |
|---|---|
| the gate | `takeable` in `src/scripts/pull.js` |
| the taker | the spawn row of [[spec/design_output/pull#a-hand-of-its-own]] |
| the case | `test/level0/pull.test.js` |
| the count | [[spec/tickets/the-spawn-takes-a-step]], which reads three |

**The gate.** `takeable` parks a helper leaf on every box, because it names `helper` beside `person` and `children`. An agent step reads one line below it, and that line gates on the box. The helper leaf moves to that shape:

| the box | what the leaf reads |
|---|---|
| carrying a harness | takeable, because the session spawns the hand |
| off a harness | parked, because the shell moves nothing |

`branch done` then holds the group open where a spawn stands, and closes it where none does. That is the wall the ask names, with one side answering on each box.

**The taker.** The design row reads "parked for a person or a spawned hand". A leaf under `by: helper` admits one taker, so the row names the helper alone. `takeable` already refuses a person there, and the row now says the same.

**The case.** The ask's third row wants the shell answer proven. Two cases in `pull.test.js` drive one group whose only open leaf reads `by: helper`:

| the box the case builds | what it reads |
|---|---|
| carrying no harness | the shell's own answer, which moves nothing |
| carrying a harness | `spawn`, the helper name, and the prompt |

**The count.** The prompt `spawnPrompt` writes carries four steps, and two of them carry a command. `the-spawn-takes-a-step` reads three. That note takes the correction, and names `spawnPrompt` as what answers it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
