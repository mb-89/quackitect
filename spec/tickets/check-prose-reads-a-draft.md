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
step: design/review
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

What the tool reaches, each in its own place:

| what the tool needs | where it stands |
|---|---|
| the door itself | `voiceDoor`, under `src/bridge/write.js` |
| the whole file a write lands | `wholeAfter`, beside it |
| the findings a note keeps | `readsProse`, beside it |
| the shape of the answer | `refusal`, under `.claude/skills/level0/lib/refuse.js` |
| the name beside it | `CHECK`, under `.claude/skills/level0/lib/answer.js` |

`src/bridge/prose.js` holds the tool's spec and its handler, so the door keeps its own file. The handler calls the same read `voiceDoor` calls, so a clean draft passes that door on its first write.

The ask's third row stands already:

- `mutations` answers the whole file text a write lands, and the door reads that
- so a table row reads with its header, and an edit reads with the lines around it
- the refusal names the file and the line, which a whole-file read answers

Where each thing stands after:

- `test/level0/prose.test.js` holds the cases, over text in memory
- one case drives a clean draft to an empty list
- one case drives a draft carrying a long sentence to the finding naming it
- [[spec/design_output/level0#the-gate-reads-the-answer]] takes the tool beside the answer gate

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

fail

- the write door stands in `src/bridge/write.js`, and `voiceDoor` runs the read this tool reuses
- name `wholeAfter` and `readsProse` beside it, because the whole-file read and its filter both stand there
- `refusal` stands under `.claude/skills/level0/lib/refuse.js`, so the table points there for it
- the tool's own module is unnamed. Say which file holds its spec and its handler
- the ask names `./RUNME.sh test`, and the approach names no case file the two drafts land in
- what holds: `mutations` answers the whole file a write lands, so the ask's third row stands already
- `CHECK` under `answer.js` names `check_answer`, and the chapter the tool joins stands

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

The approach names `src/bridge/prose.js` as the tool's home, and that file stands
already: it owns `readsProse`, the filter the same approach points at. The
reviewer decides between two roads, and the draft says neither.

| the road | what it costs |
|---|---|
| the tool joins `src/bridge/prose.js` | the prose reader's file grows a spec and a handler |
| the tool takes a file of its own | a name beside the reader, such as `src/bridge/draft.js` |
