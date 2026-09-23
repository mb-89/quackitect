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
    hash_before: d83d8224fbde532d08b9bbb3416d58c2ed94204b
    hash_after: d83d8224fbde532d08b9bbb3416d58c2ed94204b
---

# Ask

Each door and measure reads the thing it claims, so a pass means the change holds. [[spec/tickets/a-comment-hunk-is-prose]] plans the comment hunk, and this ticket takes the rest.

The test door misses Go and the level0 lib and hooks, and asks a test the ticket carries. The shell door passes a target behind a variable. The battery reads one run, and the fake disk hides a fault the real disk throws on.

- `SOURCE` in `tested.js` takes Go and the level0 lib and hooks
- the test door counts a test the tests-red leaf lands
- `ShellWritesNothing` resolves a variable target and refuses one it cannot resolve
- a first retro records a baseline, and the battery keeps a median
- the awake case waits on the child's end
- `fakeDisk.list()` throws on a file
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Six readers, each changed to read the thing it claims. The comment hunk stays
with [[spec/tickets/a-comment-hunk-is-prose]].

| part | the file | what changes |
|---|---|---|
| the sources | `.claude/skills/level0/lib/tested.js` | `SOURCE` takes `src/**/*.go`, `lib/*.js` and `hooks/*.js` under `.claude/skills/level0` |
| the Go test | the same | `TEST` takes `_test.go`, and a Go test names every file of its own folder |
| the carried test | the same | `untestedIn` takes the test paths the held ticket's command fields name, beside the staged ones |
| who hands them | `precommit.js` and `src/bridge/bash.js` | each reads the hold, and passes the paths under `test/` its ticket's command fields carry |
| the variable | `.claude/skills/level0/lib/bash.js` | `writesIn` reads `NAME=value` segments in order, and a `$NAME` target resolves to its value |
| the unresolved | the same | a target holding `$` with no value in the command refuses under `ShellWritesNothing` |
| the baseline | `src/engine/retro/effect.js` | a retro with no last one writes its battery with `baseline: true`, and the report names it |
| the median | `src/scripts/cli-stamp.js` and `battery.js` | the stamp keeps the last runs, and collect writes each part's median |
| the awake case | `test/contract/awake.test.js` | the release awaits the child's `exit` event, with a timeout, in place of the fixed wait |
| the fake disk | `src/doors/fake/disk.js` | `list` on a file path throws `ENOTDIR`, the way the real disk does |

The run count the median reads stands in `spec/config/level0.json`, beside the weights.

The cases:

- `tested.test.js`: a Go, a lib and a hook file each ask a test, and a carried test answers it
- `bash.test.js`: `f=README.md; echo x > $f` refuses, and `echo x > $HOME/y.md` refuses as unresolved
- `retro-effect.test.js` and `battery.test.js`: a first retro writes the baseline, and three runs keep a median
- `test/contract/disk.test.js`: the fake and the real disk both throw on a list of a file

The callers:

- `one-reader.test.js` walks a path with `list`, and its `filesUnder` catches the throw
- every other `list` caller hands a folder, and the check names any that breaks
- `onBash` and `precommit.js` call `untestedIn`, and both gain the carried paths

The costs:

- a write through `$TMPDIR` into a tracked kind now refuses, and a hand names the path
- the stamp grows by the kept runs

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
