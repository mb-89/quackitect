---
kind: [[ticket]]
state: open
urgency: soon
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
group: the-shim-resolves-the-vehicle
step: implement/tests-red
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 66d833b60fbfb8ba36127ea23f63a38a1007a20a
    hash_after: 66d833b60fbfb8ba36127ea23f63a38a1007a20a
  - step: design/review
    hand: box d42624a67d18a8 · helper-2
    hash_before: fbab99b6e5e862dea1de4c6602235be3f5fb97b9
    hash_after: fbab99b6e5e862dea1de4c6602235be3f5fb97b9
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Every verb the vehicle holds works inside a stub: check, lint, tickets, branches. The person and the agent type the same command in both trees.

<!-- breaks, as text: what breaks if it is never done -->
A stub is a folder of files and no tool reaches it, so nothing in it meets a rule.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the shim reads vehicle.json, asks ~/.se/registry.json for the vehicle's method root, and execs the vehicle's RUNME.sh with SE_WORK_ROOT set to the stub
- a register holding no such vehicle answers one line naming vehicle.json's upstream and the install road, and exits 1
- a test drives the shim over a fixture stub with a fake register and reads the argv the vehicle receives
- ./RUNME.sh vehicle inside a stub names the vehicle as method and the stub as work

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The shim takes three roads in order, and the vehicle takes its work root from the shim.

| road | answers | who writes it |
|---|---|---|
| `SE_VEHICLE` | that folder | a person, or a test |
| the register, by the `vehicle` id in `vehicle.json` | the entry's `method_root` | the vehicle, at `vehicle register` |
| `~/.se/vehicles/<name>` | the folder a cloud box clones the upstream into | the bridgehead's install |

- The register stands in every folder `SE_REGISTRY` names, and in `~/.se` where it names none.
- The shim stays POSIX sh and reads both JSON files with sed, because a stub holds no node yet.
- A register path holds backslashes as JSON writes them, so the shim turns each into a slash.
- The shim finding no vehicle prints one line naming the vehicle, its upstream and the install road. It exits 1.
- The shim sets `SE_WORK_ROOT` to its own folder, and the design note takes that name in place of `SE_WORK`.
- `rootsHere` in the command line takes `SE_WORK_ROOT` as the work root where it stands, and its own root otherwise.
- So `./RUNME.sh vehicle` inside a stub names the vehicle as method and the stub as work.
- One contract test drives the shim over a fixture: a fake vehicle, a register naming it, and a stub.
- The fake vehicle's `RUNME.sh` echoes its argv and its work root, and the test reads both and the refusal line.
- The bridgehead keeps its two roads. Its register road belongs to the install group, so this ticket leaves it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The approach covers every line of done_when.
- The register road matches the `vehicle` id in `vehicle.json` to the entry's `method_root`.
- The shim sets `SE_WORK_ROOT`, and `rootsHere` takes it, so `vehicle` names the stub as work.
- The refusal names the vehicle, its upstream and the install road, and exits 1.
- One contract test drives the shim over a fake vehicle, a register and a stub, and reads argv.
- The design note takes `SE_WORK_ROOT` in place of `SE_WORK`, and the bridgehead keeps its two roads.

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

<!-- what anybody adds, at any time, on this ticket -->
