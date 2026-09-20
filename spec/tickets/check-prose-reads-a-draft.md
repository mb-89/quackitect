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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 09b61b89224ccd5cfb4f8a8d943b8d3e9b1ee1d1
    hash_after: 09b61b89224ccd5cfb4f8a8d943b8d3e9b1ee1d1
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: ed778c0da59e8b60125e4b1865dac1795d3c783b
    hash_after: ed778c0da59e8b60125e4b1865dac1795d3c783b
    returns: 1
    why: "the write door stands in `src/bridge/write.js`, and `voiceDoor` runs the read this tool reuses; name `wholeAfter` and `readsProse` beside it, because the whole-file read and its filter both stand there; `refusal` stands under `.claude/skills/level0/lib/refuse.js`, so the table points there for it; the tool's own module is unnamed. Say which file holds its spec and its handler; the ask names `./RUNME.sh test`, and the approach names no case file the two drafts land in; what holds: `mutations` answers the whole file a write lands, so the ask's third row stands already; `CHECK` under `answer.js` names `check_answer`, and the chapter the tool joins stands"
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: e2f80914c88351f79b6db87329587f1df880536c
    hash_after: e2f80914c88351f79b6db87329587f1df880536c
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-4
    hash_before: e10beaf2ae704287c354d02ab01a6ce04c50d4fe
    hash_after: e10beaf2ae704287c354d02ab01a6ce04c50d4fe
    returns: 2
    why: "The approach answers every line of the earlier `why`, and two things leave the agent guessing.; `src/bridge/server.js` imports a `SPECS` and `TOOLS` pair per module. Name the pair `src/bridge/prose.js` exports, so the tool registers.; `src/bridge/write.js` exports `onWrite` and `wholeAfter`, and `voiceDoor` stands behind them. Name the one exported function the door and the tool both call, so one place owns the read.; `readsProse` stands in `src/bridge/prose.js`, and the table puts it beside `voiceDoor` under `write.js`. Point that row at the file holding it.; The write door reads `wholeAfter`, and `mutations` reaches the copilot runtime alone. Name `wholeAfter` where the ask's third bullet stands.; `refusal` opens on the line refusing a write, and the tool writes nothing. `answerFindings`, in the same file, carries the wording a tool answer takes.; What holds:; `voiceDoor` and `wholeAfter` both stand in `src/bridge/write.js`.; `refusal` stands under `.claude/skills/level0/lib/refuse.js`.; `CHECK` under `answer.js` names `check_answer`, beside `checkSpec`.; [[spec/design_output/level0#the-gate-reads-the-answer]] stands, and the chapter `The tool reads a draft` sits under it.; No test reads `src/bridge/prose.js`, so `test/level0/prose.test.js` takes a fresh owner.; `./RUNME.sh test` runs `node --test` over `test/level0`, so the two cases run there.; `wholeAfter` answers the whole file a write lands, so the ask's third bullet stands.; The draft picks the first road the Discussion names, so that question closes."
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 4ae255384bc1bd0ee435569dd1d0e8f6051ad8e0
    hash_after: 4ae255384bc1bd0ee435569dd1d0e8f6051ad8e0
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-6
    hash_before: d3af706b852722850fb10f93feaaad823100952d
    hash_after: d3af706b852722850fb10f93feaaad823100952d
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 79c6c219f5c4591fb3022767acffad241dc12f8a
    hash_after: 79c6c219f5c4591fb3022767acffad241dc12f8a
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 363caea7c1b5f821b33ff1d2d8c56af34c1a67f8
    hash_after: 363caea7c1b5f821b33ff1d2d8c56af34c1a67f8
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 40b2e17d5e903272bc0d852bf50065d04c1fdce8
    hash_after: 40b2e17d5e903272bc0d852bf50065d04c1fdce8
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-11
    hash_before: 596e5590af3e8f6884ca7542016051c09e9df96a
    hash_after: 596e5590af3e8f6884ca7542016051c09e9df96a
    returns: 1
    why: "The tool registers and answers nothing, so the ask's first two bullets stand open.; `readsDraft` answers a bare string, where `onToolCall` takes `{ result: { result: text } }`.; A live call to the tool answers the engine line naming no hook for it.; So the tool reads a draft and hands the reader no finding.; Every other handler carries the shape: `reports`, `runsFind`, `claims`, `reviewsBranch`.; `test/level0/prose.test.js` asserts the handler is a function, and reads no answer through the dispatch.; The fix: answer `{ result: { result: text } }`, and drive `TOOLS[PROSE_CALL]` in a case.; What stands:; `./RUNME.sh check` answers 0 on this commit, and 1264 cases run.; The diff touches the six files the ask and the approach name, and nothing else.; `proseFaults` holds the door's read once, and `voiceDoor` keeps its logging and its refusal.; `CODE.test(where)` reads the same extension the old guard reads, so the door holds its ground.; `spec/design_output/level0.md` carries the chapter, and `src/bridge/server.js` registers the pair.; The branch review answers retro absent from the handback, which the route takes after this step."
  - step: implement/reflect
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 9a5db02674556f98f569c08e514683fadb023efd
    hash_after: 9a5db02674556f98f569c08e514683fadb023efd
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: c744b42f27788aac4f8852aca7c7aaf56353687e
    hash_after: c744b42f27788aac4f8852aca7c7aaf56353687e
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

A note reads clean on its first write, the way check_answer clears an answer.

Every note costs three or four refusals at the write door, and a table loses rows to them.

- A `check_prose` tool reads a draft note through the write door's rules.
- It answers every finding at once and writes nothing.
- The write door lints an edit against the whole file, so a table row reads with its header.
- `./RUNME.sh test` covers a clean draft and a refused one.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`check_prose` runs the write door's own read over a draft, and answers every finding at once.

| what it takes | what it answers |
|---|---|
| `path`, so the rules read the kind the path names | every finding, one a line |
| `text`, the whole file as the write would land it | nothing on disk |

One read serves both. `src/bridge/write.js` takes a new export, `proseFaults`, holding the lint and the filter `voiceDoor` runs today. The door calls it, the tool calls it, and a clean draft passes that door on its first write.

What each piece reaches:

| what the tool needs | where it stands |
|---|---|
| the read the door runs | `proseFaults`, the new export of `src/bridge/write.js` |
| the whole file a write lands | `wholeAfter`, exported beside it |
| the findings a note keeps | `readsProse`, under `src/bridge/prose.js` |
| the wording a tool answer takes | `answerFindings`, under `.claude/skills/level0/lib/refuse.js` |
| the name beside it | `CHECK`, under `.claude/skills/level0/lib/answer.js` |

`refusal` opens on the line refusing a write, and this tool writes nothing. So the answer takes `answerFindings`, which opens on the rules reading a draft.

`src/bridge/prose.js` takes the tool's spec and its handler, beside the filter it already holds. It exports the `SPECS` and `TOOLS` pair `src/bridge/server.js` imports for each module, so the tool registers with the rest.

The ask's third row stands already:

- `wholeAfter` under `src/bridge/write.js` answers the whole file a write lands
- so a table row reads with its header, and an edit reads with the lines around it
- the finding names the file and the line, which a whole-file read answers

Where each thing stands after:

- `test/level0/prose.test.js` holds the cases, and no case reads that file today
- one case drives a clean draft to an empty list
- one case drives a draft carrying a long sentence to the finding naming it
- the chapter `The tool reads a draft` lands under [[spec/design_output/level0#the-gate-reads-the-answer]]

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

The approach answers both `why` lines, and every name it cites stands in the tree.

- `proseFaults` takes the read the door and the tool both call, so one place owns it.
- `src/bridge/prose.js` holds the tool's spec and its handler, and exports the `SPECS` and `TOOLS` pair.
- `src/bridge/server.js` imports that pair per module, so the tool registers with the rest.
- `wholeAfter` stands exported in `src/bridge/write.js`, and it answers the ask's third bullet.
- `readsProse` stands in `src/bridge/prose.js`, and the table points at that file.
- `answerFindings` and `refusal` both stand in `.claude/skills/level0/lib/refuse.js`.
- `CHECK` stands in `.claude/skills/level0/lib/answer.js`.
- `spec/design_output/level0` carries `The gate reads the answer`, with `The tool reads a draft` under it.
- No test reads `src/bridge/prose.js`, so `test/level0/prose.test.js` takes a fresh owner.
- `node --test` runs over `test/level0`, so the two cases land where the ask names.
- The draft picks the first road the Discussion names, so that question closes.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/prose.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four cases go red on their own assertions. `readsDraft` answers an empty line and `SPECS` answers an empty list, so each case reads back nothing where it asks for a finding.

What surprises:

- the gate wants an assertion, so the module loads before the cases run
- a name the module lacks reads as a build fault, which the gate refuses
- so the exports stand with empty bodies, and the change fills each one

The door's own read moves to `proseFaults` in the same hunk, because a case over the tool calls the read the door calls. The door keeps its logging and its refusal, and the read stands in one place.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases land in `test/level0/prose.test.js`, which the approach names
- Vale reaches the read as a door, and the case hands it a fake answering a finding
- the header of `proseFaults` points at the chapter the approach names

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

The handler answers its own shape, and the dispatch takes another. Every case reads the function directly, so none meets the shape the caller wants.

| what the case reads | what the caller reads |
|---|---|
| the handler's own answer, a string | `{ result: { result: text } }`, which `onToolCall` unwraps |
| the handler stands as a function | the engine answers no line, because the shape falls through |

The fix for the class runs in two moves:

- read the shape a sibling already answers, and take it
- drive the case through the dispatch, so the shape it wants is the shape it asserts

`reports` under `src/bridge/report.js` answers that shape today, and every other handler in the tree does. So one read of a sibling closes this, and the case asserts the wrapped answer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches the handler and the cases beside it, each a file the change already reaches
- Vale reaches the read as a door, and the cases hand it a fake answering a finding
- the class above names the approach each hunk follows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the read, the tool, the server's pair and the chapter the approach names
- Vale reaches the read as a door, and the cases hand it a fake answering a finding
- each header points at the chapter the approach names, and that chapter owns the table

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/prose.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`check_prose` reads a draft through the write door's own rules, and answers every finding at once.

| what the tool reaches | where it stands |
|---|---|
| the read the door runs | `proseFaults`, the new export of `src/bridge/write.js` |
| the findings a note keeps | `readsProse`, under `src/bridge/prose.js` |
| the wording of the answer | `answerFindings`, beside `refusal` |
| the spec and the handler | `src/bridge/prose.js`, beside the filter it holds |

One read serves both. `voiceDoor` held the lint and the filter inline before, and both move to `proseFaults`. The door keeps its logging and its refusal, so one place owns the read and a clean draft passes the door on its first write.

The tool writes nothing, so its answer opens on the rules reading a draft. `refusal` opens on a line refusing a write, and `answerFindings` beside it carries the wording a tool answer takes.

What a caller hands in:

- `path`, so the rules read the kind the path names
- `text`, the whole file as the write would land it
- a call missing either answers the line naming what it lacks
- `src/bridge/server.js` imports the `SPECS` and `TOOLS` pair, so the tool registers with the rest

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place, and the chapter owns the table
- the read takes a text and a path, so the cases touch memory
- each header says what its file is for, and counts nothing

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- spec/tickets/check-prose-reads-a-draft.md
- src/bridge/write.js
- src/bridge/prose.js
- src/bridge/server.js
- src/bridge/report.js
- src/bridge/search.js
- test/level0/prose.test.js
- spec/design_output/level0.md
- .claude/skills/level0/lib/refuse.js
- .claude/skills/level0/lib/code.js
- .claude/skills/level0/lib/answer.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

fail

The tool registers and answers nothing, so the ask's first two bullets stand open.

- `readsDraft` answers a bare string, where `onToolCall` takes `{ result: { result: text } }`.
- A live call to the tool answers the engine line naming no hook for it.
- So the tool reads a draft and hands the reader no finding.
- Every other handler carries the shape: `reports`, `runsFind`, `claims`, `reviewsBranch`.
- `test/level0/prose.test.js` asserts the handler is a function, and reads no answer through the dispatch.
- The fix: answer `{ result: { result: text } }`, and drive `TOOLS[PROSE_CALL]` in a case.

What stands:

- `./RUNME.sh check` answers 0 on this commit, and 1264 cases run.
- The diff touches the six files the ask and the approach name, and nothing else.
- `proseFaults` holds the door's read once, and `voiceDoor` keeps its logging and its refusal.
- `CODE.test(where)` reads the same extension the old guard reads, so the door holds its ground.
- `spec/design_output/level0.md` carries the chapter, and `src/bridge/server.js` registers the pair.
- The branch review answers retro absent from the handback, which the route takes after this step.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The chapter `A note reads clean first` owns the tool's table, and no other note repeats it.
- Each new header and each case points at that chapter by link, so one place owns the fact.
- The finding above names the file and the line, and repeats no code the tree holds.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The approach names `src/bridge/prose.js` as the tool's home, and that file stands
already: it owns `readsProse`, the filter the same approach points at. The
reviewer decides between two roads, and the draft says neither.

| the road | what it costs |
|---|---|
| the tool joins `src/bridge/prose.js` | the prose reader's file grows a spec and a handler |
| the tool takes a file of its own | a name beside the reader, such as `src/bridge/draft.js` |
