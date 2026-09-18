---
kind: [[ticket]]
state: open
depends_on:
  - a-rule-carries-its-side
urgency: now
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
group: the-warnings-feed-a-refactorer
step: design/review
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 542e434bb133ac3969b905dc7c6290691b893c94
    hash_after: 542e434bb133ac3969b905dc7c6290691b893c94
---

# Ask

**The gain.** A person opens the tree and reads every finding in the problems panel, over every file. Version four draws them that way, and this brings it back.

**What breaks otherwise.** The panel holds the file in front of a person alone. A break in a file nobody opens stands unseen until somebody runs the lint by hand.

Version four answers `initialized` by walking the work root, diagnosing every note and publishing each one. Version five holds that walk as the sweep its check verb runs. Its server calls that sweep nowhere.

- the server answers `initialized` by sweeping the work root and publishing a finding per file
- a file nobody opens carries its findings in the panel
- an open buffer answers ahead of the copy on the disk
- a parked file draws nothing
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The sweep stands, and the server calls it from two places already. This adds one case to `took` in `src/lsp/lsp.go`, and the drawing under it stands too.

| what stands today | where |
|---|---|
| the walk over every tracked file | `Sweep` in `src/lsp/check.go` |
| the call over a method name | `src/lsp/serve.go`, at `sweep` |
| the drawing, a file a message | `publishes` in `src/lsp/lsp.go` |
| the map of what the panel holds | `one.drawn`, in the same file |

**The case.** `initialized` reaches `took` today and falls to `default`, which answers a message carrying an ID. That notification carries none, so the server drops it. The case runs the sweep, groups its findings by file, and publishes one message a file.

**The drawing.** `draws` groups and publishes already, so the sweep's case takes the same shape:

| step | what it does |
|---|---|
| group | one entry a file, off `said.File` |
| publish | `publishes` a file, which fills `one.drawn` |
| clear | nothing, because the panel holds nothing at this point |

**An open buffer answers first.** `Holds` writes the buffer into the overlay, and `Read` answers the overlay before the disk.

- `Forgets` drops the cached path list alone, so an open buffer survives a sweep
- that holds today, and a case pins it

**A parked file draws nothing.** `Paths` answers what git tracks, and the underscore skip of [[spec/design_output/schema#the-underscore-parks-a-draft]] drops a parked file from that list. So the sweep walks past it, and the panel stays empty for it.

**What the panel holds after.** `one.drawn` carries every file the sweep drew. So `didClose` and the next `draws` clear what stands stale, the way they clear the drawing an open file leaves.

**The cases.**

- `initialized` publishes one message a file the sweep finds
- a file no editor opens carries its findings in the panel
- a file an editor holds answers off the buffer, and the disk copy stands unread
- a parked file draws nothing
- the map names every file the sweep drew, so a later close clears it

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
