---
kind: [[ticket]]
state: closed
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 8cc8301e3ca3ba8d
group: the-bridgehead-imports-its-vehicle
step: implement/tests-red
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 8284697262ac902b1d5a5fcf477be632e0b81c12
    hash_after: 8284697262ac902b1d5a5fcf477be632e0b81c12
  - step: design/review
    hand: box d42624a67d18a8 · helper-2
    hash_before: fb943ac658bbd74dd0dd6316fc62b3e36bff576a
    hash_after: fb943ac658bbd74dd0dd6316fc62b3e36bff576a
  - step: implement/tests-red
    hand: box d42624a67d18a8
    hash_before: c87b1c2501a7f577189321a559eabd6bfc873138
    hash_after: c87b1c2501a7f577189321a559eabd6bfc873138
reason: became
successors: [bridgehead-probe-lands]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Proof that a stub can carry a small plugin of its own and still run the vehicle's hooks. Without it the bridgehead has no road, and the stub design falls back to a copy.

<!-- breaks, as text: what breaks if it is never done -->
Every stub branch builds on a guess, and the first cloud run finds out the hard way.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a probe plugin under a fixture folder imports a hooks module from a path it reads at session start
- the probe forwards session.start, tool.call and turn.complete to that module
- `claude plugin validate` passes on the probe
- the answer says which import shape the client admits: a dynamic import, a re-export, or neither
- a headless session in the fixture answers the canary with the imported module's numbers, read off the log
- spec/design_output/level0.md carries a chapter naming the shape that holds and the one that fails

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The probe stands under test/fixtures/bridgehead, a plugin of its own. Its one module reads the vehicle file at session start, imports the module it names, and hands every event on. Four import shapes go through `claude plugin validate` and one headless turn each. A chapter of the design output names the one that holds. For details, see [[spec/design_output/level0#a-bridgehead-imports-a-copy]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass
- The approach covers every line of done_when.
- The probe reads the vehicle file at session start and forwards session.start, tool.call and turn.complete.
- The chapter names the shape that holds, a relative path to a copy, and three that fail.
- The chapter says the plugin check passes on all four shapes, and the client admits one.
- The test proves the forwarding on a fake harness, and its five tests pass.
- The chapter notes a tool answers under the plugin name, which the stub design takes up.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

# Discussion

Nothing stands here yet.
