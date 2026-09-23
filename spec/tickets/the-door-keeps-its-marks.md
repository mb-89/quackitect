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
step: verdict
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: f4ff6950c4c706386b4cf5044908723cc3ff9d07
    hash_after: f4ff6950c4c706386b4cf5044908723cc3ff9d07
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 428a36c5317b4307b96b3bd59e38e3fceebbf9b6
    hash_after: 428a36c5317b4307b96b3bd59e38e3fceebbf9b6
    returns: 1
    why: "design: a failed first write removes its journal, so an older apply of the same name stands newest.; design: `undo` then takes that older apply back, and the ask wants it to say nothing waits.; design: the journal stays with a word that nothing landed, and `undo` answers nothing waits and drops it.; craft: the named cases leave out `undo` after a failed first write, and the ask wants a case a line.; craft: the stated cost runs low, because a `replace` sweep writes the marks file once a matched file.; craft: a preview puts the old marks back in memory, and the marks file keeps the preview's marks.; craft: `reads` in `level0.js` posts no fill, so each level zero call drops the context measure.; craft: a partial Read over a file with a whole mark keeps the whole mark beside the spans."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: afc48bde4dff0c40fc77445874e7f13ede1f9350
    hash_after: afc48bde4dff0c40fc77445874e7f13ede1f9350
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: f5079134723def2bdfbc0f1b649bc1bf62d26586
    hash_after: f5079134723def2bdfbc0f1b649bc1bf62d26586
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 27efb9c3c60a04119238e9fbc12864cf6ce40431
    hash_after: 27efb9c3c60a04119238e9fbc12864cf6ce40431
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: afb861175e497e1ca7cc8dc783ec6613ea8746b6
    hash_after: afb861175e497e1ca7cc8dc783ec6613ea8746b6
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 3b36b26e31f979d9ff4f8a7c951cf0f710cde993
    hash_after: 3b36b26e31f979d9ff4f8a7c951cf0f710cde993
    answered:
      - name: tests
        exit: 0
        said: green, 83 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: The rules pass.
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
| the store | `src/bridge/write.js` | `marksOf` loads the marks from a runtime file on the first ask |
| the write-back | the same | `marksSeen` marks in memory, and one `marksKept(box)` writes the file once a call |
| the call's end | `decide` in `src/bridge/server.js` | runs `marksKept` after the door answers, so a sweep writes the file once |
| the preview | `lands` in `src/bridge/apply.js` | puts the held marks back before `marksKept` runs, so the file keeps the old marks |
| the path | `.claude/skills/level0/lib/runs.js` | the marks file's name stands beside `REFACTORS` |
| the span | `.claude/skills/level0/lib/marks.js` | a mark holds the whole hash, and a list of `{ from, to, hash }` over line spans |
| the join | the same | a whole read replaces the spans, and a partial read adds a span beside the whole hash |
| the partial Read | `onRead` in `src/bridge/server.js` | a Read with `offset` or `limit` marks the lines it hands back |
| the shell read | `src/bridge/bash.js` | `cat`, `head -n`, `tail -n` and `sed -n 'a,bp'` over a tracked file mark what they print |
| the meeting | `staleFault` in `marks.js` | a write passes where the whole hash agrees, or where the lines it changes lie inside a span that still agrees |
| the whole write | the same | a Write replacing the file asks for the whole mark |
| the folder | `writes` in `src/bridge/apply.js` | a `create` makes its file's folder before the write |
| the first fault | the same | a first file refusing the write keeps the journal, marked `landed: false`, and the answer opens on `nothing written` |
| the undo | `undoes` | a newest journal marked `landed: false` answers `nothing waits to undo`, and goes |
| the dead bridge | `.claude/skills/level0/hooks/level0.js` | a `mcp__level0__` tool outside `READ_TOOLS` meeting no server answers the `no server answers` line |
| the fill | the same | those tools keep the road they ride today while a server answers, so the context measure reads them |

The lines a write changes come off the common head and tail of the disk text and the new text.

The cases:

- `write.test.js`: a mark written on one box reads on a fresh box over the same disk
- `write.test.js`: a Read of lines 10 to 20 lets an Edit inside them land, and refuses one at line 30
- `bash.test.js`: `sed -n '1,5p' README.md` marks lines 1 to 5
- `apply.test.js`: a `create` into a new folder lands, and a failed first write answers `nothing written`
- `apply.test.js`: an undo after that failed write answers `nothing waits to undo`, and an earlier apply stands
- `bridgehead.test.js`: a `mcp__level0__plan` call with no server answers the line

The callers:

- `onWrite` and `lands` in `apply.js` call `staleFault` through the write door
- `marksSeen` stands in `onRead`, `onWrite` and `undoes`, and each keeps its call
- `readsFiles` in `apply.js` marks each file a sweep matches
- the bridgehead answers for the server's own tools too, beside the `READ_TOOLS` it registers

The answers to the earlier review:

- the undo after a failed first write: the journal stays, marked, and the undo answers nothing waits
- a case for that undo: it stands in `apply.test.js`
- a sweep writing the file per match: the file writes once a call
- the preview: the held marks go back before the write
- the context fill: the other tools keep their road while a server answers
- a partial read over a whole mark: the table names the join

The cost: each call that marks writes the runtime file once, and a whole write still asks for a whole read.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- design: each earlier finding stands answered in the table, the cases and the answers list.
- craft: a failed first write keeps the made text as each mark, so put the held marks back.
- craft: `spec/design_output/level0.md` says the box holds the marks, so the change updates that note.
- craft: `cat` at a pipe's head prints part of the file, so mark a lone shell read.
- craft: `marksKept` writes the file where a mark moves, so the store row names that guard.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/write.test.js test/level0/bash.test.js test/level0/apply.test.js test/level0/bridgehead.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Seven cases fail on their own assertion, and each names a line of the ask.

- a fresh box over the same disk refuses the Edit, because the marks live in memory
- a Read of lines 10 to 20 marks the whole file, so the Edit at line 30 lands
- a `sed -n` read sets no mark, so the Edit inside its lines comes back refused
- a failed first write answers `would not write`, and `undo` takes the failed journal
- a `plan` call on a dead bridge passes on to the harness
- the fake disk writes into any folder, so `mark-doors.js` wraps it with the refusals the real disk gives

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the four test files the approach names, and one helper beside them
- the disk, the clock, the log and the harness each stand as a fake in these cases
- each case carries a pointer to the design note the approach updates

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

    ./RUNME.sh lint src/bridge/write.js src/bridge/apply.js src/bridge/bash.js src/bridge/server.js .claude/skills/level0/lib/marks.js .claude/skills/level0/lib/runs.js .claude/skills/level0/hooks/level0.js spec/design_output/level0.md spec/design_output/apply.md test/level0/mark-doors.js test/level0/write.test.js test/level0/bash.test.js test/level0/apply.test.js test/level0/bridgehead.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the approach names, the two design notes, and the tests
- the disk, the clock and the harness each stand as a fake, and `mark-doors.js` wraps the disk
- each new function carries a pointer to the design note section it implements

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/write.test.js test/level0/bash.test.js test/level0/apply.test.js test/level0/bridgehead.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The write door keeps its marks on disk and over line spans, and `patch` says what it wrote.

- the marks load off `.se/.runtime/marks.json`, and `decide` writes them once a call where a mark moves
- a Read with `offset` or `limit` marks a span, and an Edit inside a span that agrees lands
- a lone `cat`, `head -n`, `tail -n` or `sed -n` read marks the lines it prints
- a `create` makes its folder, and a failed first write answers `nothing written`
- the failed journal stays with `landed: false`, and `undo` answers that nothing waits
- a batch call writing nothing puts back the marks it meets
- a level zero tool on a dead bridge answers the `no server answers` line

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the approach names, the two design notes, and the tests
- the disk, the clock and the harness each stand as a fake in the cases
- each new function carries a pointer to the design note section it implements

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
