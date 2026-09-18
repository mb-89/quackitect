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
group: the-verbs-read-two-roots
step: verdict
record:
  - step: design/draft
    hand: box ea4589862ac3
    hash_before: c2e318dea6e4eb5ef0298ff0f77aff5cdc039944
    hash_after: c2e318dea6e4eb5ef0298ff0f77aff5cdc039944
  - step: design/review
    hand: box ea4589862ac3 · helper-2
    hash_before: 1c265ac5ec45f318062c0aae815e5e50b2ecf79f
    hash_after: 1c265ac5ec45f318062c0aae815e5e50b2ecf79f
  - step: implement/tests-red
    hand: box ea4589862ac3
    hash_before: fe69616f09d4ae995f02663de181a79a595fbdcd
    hash_after: fe69616f09d4ae995f02663de181a79a595fbdcd
    answered:
      - name: tests
        exit: 1
        said: assertion, 11 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box ea4589862ac3
    hash_before: 2fd2a0b4d2b8c8d7f0e1e186d8444361d3f66ec3
    hash_after: 2fd2a0b4d2b8c8d7f0e1e186d8444361d3f66ec3
    answered:
      - name: lint
        exit: 0
        said: 14 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: c5e8270659b5ba232d854fcd568cb22905e84715
    hash_after: c5e8270659b5ba232d854fcd568cb22905e84715
    answered:
      - name: tests
        exit: 0
        said: green, 575 test(s) pass in 52 file(s)
      - name: check
        exit: 0
        said: 67 stand at warning, which the panel draws and check allows.
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A project keeps its own tickets, its own guidance notes and its own overrides. The vehicle's rules hold over all of it.

<!-- breaks, as text: what breaks if it is never done -->
A stub's tickets land in the vehicle, or the rules read the stub's guidance as the vehicle's. The two trees leak into each other.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- ticket note, ticket update, branch take and the pull read and write spec/tickets under the work root
- the standing layer joins the method's guidance with the work root's file by file, as [[spec/design_output/vehicle#the-work-root-inherits]] rules
- the write door refuses a bad write inside the stub with the vehicle's rules, over two fake roots
- the projections land in the work root and read the method's schema

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The command line hands every verb both roots, and each read names the root it belongs to. The server's box carries the two already, so the doors take the same rule.

| the read | the root |
|---|---|
| a ticket, a private note, a hold, the box id, the brief | the work root |
| a schema, a process, the Vale config, the styles, the copy id | the method root |
| a guidance note | the work root's file where it stands, else the method's |
| a link a field names | the work root first, then the method root |
| a projection's target | the work root |
| a projection's source | the work root's file where it stands, else the method's, and a JSON source joins key by key |

The verbs and the files each one keeps under the work root:

| verb | keeps under the work root |
|---|---|
| `ticket note`, `retro notes` | `.se/tickets` |
| `ticket update`, `ticket open` | `spec/tickets` |
| `branch take`, `branch pull` | `spec/tickets`, `.se/hold`, `.se/box.json` |

- `rootsHere` runs once in the command line. The verbs take `it.method` and `it.work`, and `it.root` is the work root.
- Git runs at the work root, because a stub is its own repository.
- `schemasHere` and `processAt` read the method root. So a stub's ticket meets the vehicle's schema and route.
- The pull runs a command field and a test at the work root. It names the Vale config under the method root, so a relative config resolves in the stub.
- One reader, `inherits`, stands beside `layered` in the layer module. It reads a relative path off the two roots, and the work root's file wins.
- The reader lists a folder as the union of both, with the work root's name winning. A JSON file both roots hold joins key by key.
- On a tree driving itself the reader reads the one root.
- The standing layer reads `spec/guidance` through that reader, in the server and in `standing`. A stub's note joins the set, and one it names again replaces the vehicle's.
- The helper's guidance and the canary count follow the standing layer.
- The write door keeps its reads. The path is relative to the work root, and the schemas and Vale come off the method root.
- A test drives the write door over two fake roots. A ticket under the stub breaking the vehicle's schema comes back refused, and one keeping it passes.
- `readAll` takes two readers: the sources through `inherits`, and the targets in the work root alone. A target the method root holds counts for nothing in a stub.
- The server's projection and the `project` and `check` verbs land every target under the work root. The owner door refuses a write to one there.
- The stop rules and the judged styles stay on the method root, because the ask names guidance and nothing else.
- The stub verb writes `project/spec/tickets`. This ticket reads `spec/tickets` under the work root, as the ask says. A private note carries that to the retro.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The approach answers each done_when line, and the two tables name the root of every read.
- The reader `inherits` matches the chapter The work root inherits: silent, replaced, or joined, one file a unit.
- The layer module holds `layered` and `deeply` already, so the reader builds on what stands.
- The server's box carries `method`, `work` and `root` already, so the doors take the rule with no new field.
- The write door test over two fake roots feeds a bad ticket and asserts a refusal, as reviewing asks.
- The targets read the work root alone, so a target the vehicle holds stays out of the stub.
- The chapter names the stop rules and the judged styles as inheriting too. The approach leaves them on the method root on purpose.
- The stub verb writes `project/spec/tickets`, and the approach carries the mismatch with `spec/tickets` to the retro.
- No branch stands yet, so `./RUNME.sh check` waits for implement.

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

Eleven tests fail on their own assertion, across five files. Two files are new: the verbs over two roots, and the write door over two fake roots.

- The verbs fail because the route and the schema stand under the method root. The verbs read the work root for both.
- The pull hands out the stub's ticket already, because every file read goes through `it.root`. It misses the note the work root lacks.
- The link check refuses a note the method root holds, so the second road stands unwritten.
- The reader fails on the method's file, because it reads the work root alone until the change lands.
- The projection lands its target in the method root, and the standing layer takes the work root for the environment.
- The write door refuses the stub's bad ticket already, and passes the good one. The three places rule refuses a route whose last leaf names no reader, which the fixtures first missed.
- The take on a cloud box passes already, because it writes the record under `it.root`. The command line alone decides which root that is.

### checked

- the change touches the layer module, the reader tests and the test files the ask names, and no stub file
- every door the tests reach is a fake: the disk, git, the clock and the log
- the reader carries a comment naming the chapter The work root inherits

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

    ./RUNME.sh lint

### checked

- the change touches the layer, the projection, the guidance door, the command line and the verbs. No stub file moves.
- every door the change reaches is a fake in its test: the disk, git, the clock and the log. The fixtures stand in one shared module.
- every changed function carries a comment naming the chapter The work root inherits

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

The fixture the pull tests drive now names both roots.

| what stands | what it becomes |
|---|---|
| `handFaults` joins the Vale config onto `it.method`, and the fixture names no root | the fixture names the method root and the work root |
| the answer key spells that path with a forward slash | the key builds its path with `join`, so either separator reads |
| a pointer stands on the second line of a comment | each pointer stands on the line the rule reads |

A stub lints under the vehicle's rules, so the config comes off the method root. Where that join throws, the try swallows it and the voice reads nothing back. The two cases over the hand-back then read green where the rules refuse.

<!-- the form is text -->

### checked

- the change touches no file the ask leaves out. The commit holds two fixtures and one comment.
- every door the change reaches has a fake. The cases drive the fake disk, git and process.
- a comment names the approach. The one in `hand.js` points at the work root chapter.

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
