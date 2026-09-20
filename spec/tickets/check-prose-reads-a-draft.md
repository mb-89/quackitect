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

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

The approach names `src/bridge/prose.js` as the tool's home, and that file stands
already: it owns `readsProse`, the filter the same approach points at. The
reviewer decides between two roads, and the draft says neither.

| the road | what it costs |
|---|---|
| the tool joins `src/bridge/prose.js` | the prose reader's file grows a spec and a handler |
| the tool takes a file of its own | a name beside the reader, such as `src/bridge/draft.js` |
