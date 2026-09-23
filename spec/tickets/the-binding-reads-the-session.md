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
step: implement/change
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 1e40e441ab60cc0a3dc2104d2bf538dc94877f55
    hash_after: 1e40e441ab60cc0a3dc2104d2bf538dc94877f55
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 28fe29d78c6f3214fe9bcdf25d3423cb2da9905a
    hash_after: 28fe29d78c6f3214fe9bcdf25d3423cb2da9905a
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 5f80e387cc6c45c18665f520ef84e447b44f768b
    hash_after: 5f80e387cc6c45c18665f520ef84e447b44f768b
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
---

# Ask

The hand knows what the binding asks and who sets it, and a turn waiting on its own helpers ends quietly. The queue then drives the work without pulling against the owner's plan.

Under queue the stop hook pushes `ticket pull` and filler turns against the owner's plan and running helpers. The binding changes with no word, and it refuses the named pull `retro new` runs.

- a stop refusal under a binding names the binding, who sets it and when
- a ticket a verb mints for this session passes the binding
- `./RUNME.sh retro new` takes its retro under queue
- a turn waiting on its own helpers alone ends on a wait the hook holds
- a case under `test/level0` covers each line above
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The refusal says the binding, a minted ticket passes it, and a helper's wait
ends the turn under every binding.

| part | the file | what changes |
|---|---|---|
| the layer | `src/bridge/config.js` | `whereFrom(box, key)` answers the value and its layer: the local file, the environment or the tracked file |
| the moment | `src/bridge/stop.js` | the box keeps the binding it last read and the clock at the change, and the log says each change |
| the refusal | the same | `asksForStop` closes with one line naming the binding, its layer and that moment |
| the minted ticket | `src/scripts/pull.js` | the queue refusal of a named pull skips a name equal to `it.minted` |
| who mints | `src/scripts/retro-new.js` | the verb sets `it.minted` to the retro it writes, then pulls it |
| the helpers | `src/bridge/stop.js` | `helpers-running` reads `helpersRun` alone, under every binding |
| the rule text | `spec/config/stop/level0.yml` | `your-helpers-still-run` drops the sentence saying the queue refuses it |
| the falls text | `stop.js` | `FALLS["helpers-running"]` keeps the second sentence alone |
| the design | `spec/design_output/config.md#the-engine-controls` | the table's queue row names the helper's wait as a stop the hook takes |

The cases:

- `stop.test.js`: a refusal under `queue` from the local file names `queue`, the local file and the moment
- `pull.test.js`: under `queue` a named pull refuses, and the same name as `it.minted` passes
- a new `retro-new.test.js`: the verb takes its retro under `queue`
- `stop-helper.test.js`: under `queue` with a running helper, the turn ends on the wait

The callers:

- `onStop` runs `asksForStop` and the checks
- `claimFalls` reads `FALLS`
- only `retro-new.js` mints and pulls in one verb today, so one verb sets `it.minted`

The cost: a helper running beside a ticket in hand ends the turn under `queue`, and its answer wakes the session.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- design: each part answers an Ask line, and the cost holds. `your-helpers-still-run` at 83 beats the level1 rules.
- craft: the cost names a ticket in hand. The same claim also ends a turn over a group in hand and a waiting queue.
- craft: `asks` reads the local file and the tracked file alone. So `whereFrom` must read the same layers the hook reads.
- craft: the moment is the first read after a change, and the box loses it when the server starts again.
- craft: `retro-new.test.js` stands already, so the new case joins that file.
- craft: `stop-helper.test.js` holds a case where the queue holds the turn beside a helper. The change flips that case.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/stop-binding.test.js test/level0/stop-helper.test.js test/level0/pull-leaves.test.js test/level0/retro-new.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Seven cases fail on their own assertion, and each names what it waits for.

- `stop-binding.test.js` is new, because `stop.test.js` reads the rules alone and holds no box.
- The pull case joins `pull-leaves.test.js` beside the named pull, because `pull.test.js` stands at 588 lines.
- The retro case joins the `retro-new.test.js` that stands.
- The helper case in `stop-helper.test.js` now ends the turn under `queue`.
- `src/bridge/stop.js` stands at 595 lines, so the change moves the moment into a module of its own.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: the cases touch the named test files and one new file.
- every door the change reaches has a fake: the cases drive the fake disk, clock, proc and git.
- a comment names the approach the change implements: each case points at the design note it holds.

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
