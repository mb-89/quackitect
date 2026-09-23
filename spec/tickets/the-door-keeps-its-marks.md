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
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: f4ff6950c4c706386b4cf5044908723cc3ff9d07
    hash_after: f4ff6950c4c706386b4cf5044908723cc3ff9d07
---

# Ask

A hand that reads and then writes meets no refusal, and a failed `patch` says what it wrote. The hand stops reading a file twice to please the door.

The write door refuses a write over a real read after a restart, a partial Read or a shell read. `patch` fails whole on a `create` into a new folder, and a dead bridge reads as plugin wiring.

- the read marks survive a server restart
- a partial Read marks the lines it covers
- `patch` makes the folder a `create` op names
- a failed first op answers `nothing written`, and `undo` says nothing waits
- the plugin says the bridge answers nothing where a tool's hook finds no server
- a case under `test/level0` covers each line above
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The marks move to disk and learn spans, `patch` makes its folders and says
what it wrote, and every level zero tool names a dead bridge.

| part | the file | what changes |
|---|---|---|
| the store | `src/bridge/write.js` | `marksOf` loads the marks from a runtime file on the first ask, and `marksSeen` writes it back |
| the path | `.claude/skills/level0/lib/runs.js` | the marks file's name stands beside `REFACTORS` |
| the span | `.claude/skills/level0/lib/marks.js` | a mark holds the whole hash, or a list of `{ from, to, hash }` over line spans |
| the partial Read | `onRead` in `src/bridge/server.js` | a Read with `offset` or `limit` marks the lines it hands back |
| the shell read | `src/bridge/bash.js` | `cat`, `head -n`, `tail -n` and `sed -n 'a,bp'` over a tracked file mark what they print |
| the meeting | `staleFault` in `marks.js` | a write passes where the lines it changes lie inside a span whose lines still hash the same |
| the whole write | the same | a Write replacing the file still asks for the whole mark |
| the folder | `writes` in `src/bridge/apply.js` | a `create` makes its file's folder before the write |
| the first fault | the same | a first file refusing the write removes the journal, and the answer opens on `nothing written` |
| the undo | `undoes` | reads no journal, so it answers `nothing to undo` as it stands |
| the dead bridge | `.claude/skills/level0/hooks/level0.js` | `reading` takes every `mcp__level0__` tool, so each one answers the `no server answers` line |

The lines a write changes come off the common head and tail of the disk text and the new text.

The cases:

- `write.test.js`: a mark written on one box reads on a fresh box over the same disk
- `write.test.js`: a Read of lines 10 to 20 lets an Edit inside them land, and refuses one at line 30
- `bash.test.js`: `sed -n '1,5p' README.md` marks lines 1 to 5
- `apply.test.js`: a `create` into a new folder lands, and a failed first write answers `nothing written`
- `bridgehead.test.js`: a `mcp__level0__plan` call with no server answers the line

The callers:

- `onWrite` and `lands` in `apply.js` call `staleFault` through the write door
- the bridgehead answers for the server's own tools too, beside the four `READ_TOOLS` it registers
- the server's tools behind the bridgehead are `find`, `patch`, `replace`, `undo` and the server's own

The cost: each mark writes the runtime file once, and a whole mark still asks for a whole read.

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
