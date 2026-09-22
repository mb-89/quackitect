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
group: the-stub-takes-shape
step: verdict
record:
  - step: design/draft
    hand: box 36d4a566c587
    hash_before: 023e4ccfaf9cd0f7f960cecb9dd70289d3ea5b10
    hash_after: 023e4ccfaf9cd0f7f960cecb9dd70289d3ea5b10
  - step: design/review
    hand: box 36d4a566c587 · helper-2
    hash_before: 5e3755404c949ce7591a71c1f119365f9f13db3b
    hash_after: 5e3755404c949ce7591a71c1f119365f9f13db3b
  - step: implement/tests-red
    hand: box 36d4a566c587
    hash_before: fafa539ce386e83bae87a83a4a1687af6a3ea1bd
    hash_after: fafa539ce386e83bae87a83a4a1687af6a3ea1bd
    answered:
      - name: tests
        exit: 1
        said: assertion, 12 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 36d4a566c587
    hash_before: 627070e430f1f21a6c8681bd6df95dae5c3bab1b
    hash_after: 627070e430f1f21a6c8681bd6df95dae5c3bab1b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 36d4a566c587
    hash_before: 9202a3441bb89ecaa01d0c707c710885cc211d13
    hash_after: 9202a3441bb89ecaa01d0c707c710885cc211d13
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 36d4a566c587 · helper-7
    hash_before: 59e288938c79e182e04e2c63a0c4e3f7cf96797d
    hash_after: 59e288938c79e182e04e2c63a0c4e3f7cf96797d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A bare folder becomes a project the method drives, with nothing copied in, in one command.

<!-- breaks, as text: what breaks if it is never done -->
The button has nothing to run, and a project starts by hand from a clone of this tree.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh stub into <folder>` writes the project folders, the record, the shim, the settings and the bridgehead
- `vehicle.json` carries the vehicle's identity, its brand and its upstream repo, read off the register and `git remote get-url origin`
- the verb refuses a vehicle with no remote unless `--upstream` names one
- a contract test produces a stub into a temp folder and reads every file back. The stub holds no file of the method.
- spec/design_output/vehicle.md carries a chapter on the stub and its files

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask says | the approach answers |
|---|---|
| one verb writes the stub's files | the verb `stub` writes each file through the disk door, and a pure module names the files |
| `vehicle.json` carries the vehicle's identity, its name and its repo | the pure module builds that record off the register entry and `git remote get-url origin`, and the verb refuses a vehicle with no remote unless `--upstream` names one |
| a contract test reads every file back | one test produces a stub into a folder it makes, reads each file, and finds no file of the method |
| the design output carries a chapter on the stub | the chapter stands. For details, see [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]. |

- the shim hands every argument to the vehicle's `RUNME.sh`, with the work root set to the stub
- the bridgehead is a plugin of its own. It reads the record at session start and hands every hook to the vehicle's module.
- an empty folder travels with git through one `.gitkeep`
- the verb `vehicle into` stands as it is, and the stub verb copies nothing out of the method

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- the approach covers every row of the ask: the verb, the record, the contract test and the chapter
- the ask says brand and the approach says name, and the chapter binds the two, so `name` stands
- the ask reads the identity off the register and the chapter off `.se/.runtime/identity.json`, so implement settles the source
- the record carries `version` and `made` past what the ask names, so the contract test reads both back
- the chapter names `test/contract/stub.test.js`, so the tests-red step writes the test there
- the chapter hands the register road to the next group, so the shim stops at its two roads

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Twelve tests fail on their own assertion, and one passes: the stub that lands in the vehicle itself. The skeleton verb refuses everything, so that refusal reads green before the change. The unit tests drive a fake disk, a fake clock and a fake git. The contract test drives the real disk, the real git of this tree and a temp repo with no remote.

### checked

- the change touches the vehicle module, the stub verb, its template, two tests and one chapter. The ask names each.
- the disk, the clock and git each have a fake under `src/doors/fake`, and the unit test reaches nothing else
- every new function points at a chapter of the vehicle design output

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

./RUNME.sh lint .

### checked

- the change touches the vehicle module, the verb, its template, two tests and the vehicle chapter
- the verb reaches disk, the clock and git through their doors. The unit test hands in the fake of each.
- the bridgehead runs in the client, where the engine interface is its door. The import group proves it.
- every new function points at a chapter of the vehicle design output

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

A new verb, `stub into`, writes a bare project the vehicle drives from outside. It copies nothing out of the method, and a contract test walks the stub to prove it.

| piece | what changes |
|---|---|
| the vehicle module | names the stub's files and builds the record off the identity, the folder name and the upstream |
| the verb | reads the upstream off git, and refuses a vehicle with no remote unless `--upstream` names one |
| the template under `src/stub` | the shim and the bridgehead plugin, copied as they stand |
| the shim | finds the vehicle through `SE_VEHICLE` or the folder a cloud box clones into, and hands every verb to it |
| the bridgehead | finds the vehicle the same way at session start, and hands every hook to the vehicle's modules |

- the register road and the import at session start stand unproven here, and two later groups prove them
- a first run dropped the verb's first argument where no flag stood. A contract case now drives the command line.

### checked

- the change touches the vehicle module, the verb, its template, two tests and the vehicle chapter
- the verb reaches disk, the clock and git through their doors. The unit test hands in the fake of each.
- every new function points at a chapter of the vehicle design output

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/stub-takes-shape.md
- spec/design_input/a-stub-takes-its-vehicle.md
- spec/design_output/vehicle.md
- spec/guidance/review/reviewing.md
- spec/tickets/a-person-reads-the-pull.md
- spec/tickets/the-stub-takes-shape.md
- .claude/skills/level0/lib/vehicle.js
- .claude/settings.json
- src/scripts/stub.js
- src/scripts/cli.js
- src/scripts/vehicle.js
- src/stub/RUNME.sh
- src/stub/.claude/skills/bridgehead/.claude-plugin/plugin.json
- src/stub/.claude/skills/bridgehead/hooks/hooks.json
- src/stub/.claude/skills/bridgehead/hooks/bridgehead.js
- test/level0/stub.test.js
- test/contract/stub.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- the branch does every line of the ask: the verb, the record, the refusal, the contract test and the chapter
- the record reads the identity off `.se/.runtime/identity.json`, and the chapter says so, which settles the source
- `./RUNME.sh check` answers exit 0 on the tip, with one test skipped and none failing
- the diff reaches two tickets past the brief, and each hunk is a trivial fix or a verb's mark
- the refusal on no remote has a unit test and a contract test, each with a repo lacking origin
- the refusal on a stub landing in the vehicle has a test asserting it writes nothing
- the command line refuses with no folder, and a contract case proves the exit and the message
- the contract test walks the whole stub and finds every path in the list, and none of the method
- the retro finds one lesson in the says chapter, the dropped first argument, and one doubt under Discussion
- the bridgehead's import at session start stands unproven here, and the chapter hands it to a later group
- the helper `same` stands in the pure module and again in the verb, which the retro reads

# Discussion

The judge refused the draft four times on text the write door takes, and named no rule. The draft went in through the shell hand-back, and a private note carries the doubt to the retro.
