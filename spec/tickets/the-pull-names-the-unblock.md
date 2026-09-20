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
step: implement/tests-red
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: adec70e31a69ba47cfa791dad14052d89937c8a5
    hash_after: adec70e31a69ba47cfa791dad14052d89937c8a5
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-20
    hash_before: 33d5ccdadcd43fdec697d400b391e98d615b7e3d
    hash_after: 33d5ccdadcd43fdec697d400b391e98d615b7e3d
    returns: 1
    why: The case the approach adds stands already in `test/level0/person-step.test.js`, at its first test.; That case seeds a group at `children` with one open child, on branch `work/one-group`.; So the objection naming a free ticket reads wrong, because `pull.js` takes the group off the branch name.; Name what the standing case lacks, or drop the case from the plan.; The `wait` row in `spec/design_output/pull.md` carries no pointer, so that change holds.
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: ab61e6dc3d7a9692c62920f8539faf4f109561b8
    hash_after: ab61e6dc3d7a9692c62920f8539faf4f109561b8
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-21
    hash_before: 8cc28a0f1696d0a5ebe8556dce5b7f1de018d0f0
    hash_after: 8cc28a0f1696d0a5ebe8556dce5b7f1de018d0f0
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A cloud box clears a person's wall itself, because the pull names the verb that clears it.

| where the rule stands | what it says |
|---|---|
| `spec/guidance/cloud.md` | hand a step wanting a person out of the branch, and stop for none |
| the pull's answers table | `wait`, with a reason per ticket it skips |

<!-- breaks, as text: what breaks if it is never done -->

- A group stands at `children`, and its one open child stands at a step under `by: person`.
- `branch pull` answers `wait`, naming the child and the step it waits on.
- The answer points at neither the cloud rule nor `branch unblock`.
- So the box walks the group's retro again, writes its window over the last box's, and leaves the wall standing.
- The record on [[spec/tickets/guidance-rides-the-step]] holds that walk once a box, and the branch grows a commit each time.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `branch pull` meeting a group whose every open step waits for a person names `branch unblock` and what it takes
- the answers table in `spec/design_output/pull.md` carries that wording, and `./RUNME.sh lint spec/design_output/pull.md` passes
- a case in `test/level0` drives a group at that shape and reads the answer, and `./RUNME.sh branch test` answers green
- `./RUNME.sh check` exits 0 on the commit

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The wait answer already names the unblock road, and a case already drives a group at `children`. So this ticket lands the answers table row.

| what stands | where |
|---|---|
| the prompt naming the mint, the open, the unblock and the done | `unblockPrompt` in `src/scripts/spawn.js` |
| the pull printing it where a person's step is all that stands | `handOut` in `src/scripts/pull-hand.js` |
| the case driving a group at `children` with one open child | the first case of `test/level0/person-step.test.js` |

That case seeds the group on branch `work/one-group`, and `pull.js` takes the group off the branch name. It asserts the mint, the open, the unblock and the done out of the answer.

What changes:

- the `wait` row of the answers table points at [[spec/design_output/work#a-person-step-leaves]]
- the row's own words stay, because the prompt keeps its wording in one place

The objection: the ask asks for a case, and this plan adds none. A second case over the same shape drives the same lines, and the standing one already holds them.

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

- This ticket names no group, so it stands in the pool on trunk.
- The owner's call stands: a cloud box blocks on no person. The wall a box meets is what the pull says at that moment.
- The retros on [[spec/tickets/guidance-rides-the-step]] name this finding once a box, each with its home.
- `./RUNME.sh branch unblock` clears the wall today, and a box runs it by hand.
- Trunk carries this change. `unblockPrompt` under `src/scripts/spawn.js` words it, the wait answer prints it, and `test/level0/person-step.test.js` covers it. A hand taking this ticket reads the diff and closes it, or names what it misses.
