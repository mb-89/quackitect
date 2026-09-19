---
kind: [[ticket]]
state: open
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
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: cdf685ad92d873867f538ae2cd8c5320702067f9
    hash_after: cdf685ad92d873867f538ae2cd8c5320702067f9
---

# Ask

Each piece of work stands in the folder owning its topic, where a reader looks for it.

The bridge grows engine work, and src/scripts holds whatever fits nowhere else.

- Status, projection, the tense reader and swap stand under `src/engine`.
- The bridge holds transport alone.
- Every file under `src/scripts` names the topic it serves, and the rest move out.
- `./RUNME.sh check` exits 0 after the moves.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one rule sorting a file into its folder
- four moves the ask names, each its own commit
- one change under the Go module reader, which the swap move forces

**The rule.** A file under `src/bridge` answers an event off the wire. A file
under `src/engine` answers a question about the tree, with no event standing. A
file under `src/scripts` is a verb of the command line, named for the verb.

| the folder | what a file there does | what it imports |
|---|---|---|
| `src/bridge` | takes an event and answers the hook | the engine, and the doors |
| `src/engine` | reads the tree and answers a question | the doors alone |
| `src/scripts` | runs a verb a person types | either of the two |

**The four moves.** Each is a rename plus the imports naming it, and the check
decides each on its own.

| what moves | from | to |
|---|---|---|
| status | `src/bridge/status.js` | `src/engine/status.js` |
| projection | `src/bridge/projection.js` | `src/engine/projection.js` |
| the tense reader | `src/bridge/tense.js` | `src/engine/tense.js` |
| swap | `src/swap` | `src/engine/swap` |

The first three hold no event. `projection.js` carries one reader that does,
`freshens`, which the server calls after a tool ran. That reader stays in the
bridge, and the engine takes the rest.

**What swap costs.** `goModulesIn` lists a module as a folder holding `go.mod`
straight under `src`, and `goModulesOf` reads the same one level. A module at
`src/engine/swap` reads as none. Its tests leave the battery, and nothing says
so.

| what changes | so that |
|---|---|
| `goModulesIn` walks a folder below `src` too | the battery finds a module either way |
| `goModulesOf` takes the folder holding `go.mod` | a changed test names its own module |
| a case drives both over a module one level down | the fault stays fixed |

**What the ask leaves open.** The second line of the ask wants the bridge
holding transport alone. The four moves leave it holding the doors: the write
door, the stop door, the answer door and the rest.

- an event runs a door, so the rule above counts every door as transport
- the line reads as met where each door keeps its wiring and hands its thinking down
- the bridge files past the four each want that cut, and each is its own ticket
- this ticket moves the four, sets the rule, and mints nothing else

**The command line.** The third line of the ask names every file under
`src/scripts`. The verbs there read as verbs already, and the files named for a
topic instead are the `cli-` group and the `pull-` group. Each of those serves
one verb, so the name says the verb it serves and the sort holds.

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

<!-- what anybody adds, at any time, on this ticket -->
