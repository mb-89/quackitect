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
step: design/review
record:
  - step: design/draft
    hand: box ea4589862ac3
    hash_before: c2e318dea6e4eb5ef0298ff0f77aff5cdc039944
    hash_after: c2e318dea6e4eb5ef0298ff0f77aff5cdc039944
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A project keeps its own tickets, its own guidance notes and its own overrides, and the vehicle's rules hold over all of it.

<!-- breaks, as text: what breaks if it is never done -->
A stub's tickets land in the vehicle, or the rules read the stub's guidance as the vehicle's, and the two trees leak into each other.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- ticket note, ticket update, branch take and the pull read and write spec/tickets under the work root
- the standing layer joins the method's guidance with the work root's, file by file, as spec/design_output/vehicle.md rules under the work root inherits
- the write door refuses a bad write inside the stub with the vehicle's rules, proven in a test over two fake roots
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
