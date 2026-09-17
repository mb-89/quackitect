---
kind: [[ticket]]
state: open
urgency: soon
group: the-hand-carries-a-step
step: design/draft
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
    needs: ["work test"]
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
process: [[standard]]
process_hash: d1fd9cd113889f29
depends_on: ["the-hand-carries-the-session"]
record:
  - step: design/draft
    hand: box 3d4c068755ec · claude-code-remote
    hash_before: 0136ef0a04d0a335b1fe7ab2daf81192844f227b
    hash_after: 0136ef0a04d0a335b1fe7ab2daf81192844f227b
  - step: design/review
    hand: box 3d4c068755ec · claude-code-remote · helper-2
    hash_before: 2634a66b131692e6427ba61c539952d2478797fa
    hash_after: 2634a66b131692e6427ba61c539952d2478797fa
    returns: 1
    why: "A leaf under `by: helper` reaches no spawn. `admits` answers a why and no `other`, so the leaf parks.; A hand under `--as` reads that same leaf as untakeable, because `takeable` refuses the word `helper`.; The ask names the excluding field `by`, and the design output names it `not`. Name one, and make the other follow.; The spawn answer names one taker, the hand it asks for. The ask's fourth line names a person too.; The helper's hand-back stands as a case already. Add the assertion it lacks, that another hold stands untouched.; The wrapper's spawn wants the case the draft names, and the guidance rides the helper's pull.; `./RUNME.sh check` answers 1 over faults the whole tree carries, and this leaf adds none."
---

# Ask

When the next step's `by` excludes the hand that pulls, nobody takes it. The approach stands in [[spec/design_output/pull#a-hand-of-its-own]]. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#hands]]. A person reads the design phase here, because the group behind it waited on one. Done is four things:

- a `by` that excludes the hand makes the pull answer `spawn`, with a helper's name and a prompt
- the engine writes that prompt from the ticket and the step's guidance, and the plugin wrapper spawns the hand
- the spawned hand pulls under `--as <name>` and works that one leaf. Its hand-back answers `done` and touches no other hold.
- on a box with no plugin, the shell pull moves nothing. It leaves the step parked for a person or a spawned hand, and says so.

| the piece | where | proves it |
|---|---|---|
| the spawn for a step | the plugin wrapper under `.claude/skills/level1` | a `by` that excludes the hand spawns one, with a prompt the engine writes |
| the spawned hand's road back | `src/scripts/pull.js` | its pull answers `done` after its hand-back, and touches no other hold |
| the shell off a plugin | `src/scripts/pull.js` | the answer says the step waits for a person or a spawned hand |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The road stands, and the note that holds it is
[[spec/design_output/pull#a-hand-of-its-own]]. Four of the ask's lines answer in
the tree today:

| the ask's line | where it stands | what proves it |
|---|---|---|
| a `by` outside the hand answers `spawn` | `spawnAnswer` in `src/scripts/pull.js` | `test/level0/pull.test.js` drives a leaf the only hand stands outside |
| the wrapper spawns the hand | the hook under `.claude/skills/level1` | `test/level0/level1.test.js` reads the prompt out of a spawn answer |
| a hand under `--as` takes one leaf | `onward` in `src/scripts/pull.js` | `test/level0/pull.test.js` answers done after that hand-back |
| off a plugin the shell moves nothing | the lines the spawn answer prints | the same case reads them back |

So one difference stands between the ask and the tree, and it is the guidance.
`spawnPrompt` writes the ticket, the leaf and three commands. The guidance
reaches the helper at its own pull, under its own hand.

| the road | what the helper reads | what it costs |
|---|---|---|
| the prompt carries the guidance | the rules twice, once in the prompt and once at the pull | a second copy of every rule |
| the pull carries it, as today | the rules once, with the fields beside them | one more call before the work |

This ticket takes the second road, because a rule read twice is a rule that
drifts. So the change is the proof, and no line of the pull moves:

- a case drives the wrapper over a spawn answer, and reads the hand it makes
- a case drives a helper's hand-back, and reads `done` with no other hold touched
- the note takes one line saying the guidance rides the helper's pull

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- A leaf under `by: helper` reaches no spawn. `admits` answers a why and no `other`, so the leaf parks.
- A hand under `--as` reads that same leaf as untakeable, because `takeable` refuses the word `helper`.
- The ask names the excluding field `by`, and the design output names it `not`. Name one, and make the other follow.
- The spawn answer names one taker, the hand it asks for. The ask's fourth line names a person too.
- The helper's hand-back stands as a case already. Add the assertion it lacks, that another hold stands untouched.
- The wrapper's spawn wants the case the draft names, and the guidance rides the helper's pull.
- `./RUNME.sh check` answers 1 over faults the whole tree carries, and this leaf adds none.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

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

<!-- what anybody adds, at any time, on this ticket -->

- this ticket splits off [[spec/tickets/step-changes-hands]], which waited at a person step. The branch behind it closes, and the branches waiting on it move.
- the rule to hold: a role is a property of a step, and no agent holds one for life
