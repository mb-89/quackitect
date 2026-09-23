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
    hash_before: 614c1aa4b8e9220e93e59a8afa6bbbf3016a1391
    hash_after: 614c1aa4b8e9220e93e59a8afa6bbbf3016a1391
---

# Ask

`ticket open`, `ticket note` and a route's render take no prose the lint refuses later, so no fix commit follows a landing. [[spec/tickets/one-reader-judges-a-verdict]] plans the pull's half, and this ticket takes the rest.

`ticket open` takes an Ask the lint warns on, and `ticket note` writes a word outside the vocabulary. A retro route names a step the voice rules refuse, and the retro's first write meets the door.

- `ticket open` reads the Ask through the `readsProse` road at the lint's level
- `ticket note` reads its line through the same road before it writes
- a contract test renders every route under `spec/processes` through the voice rules
- a case under `test/level0` feeds each verb a line the lint warns on, and each refuses
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One reading over a ticket's text in memory, shared by the pull, the open and
the note. The pull's half landed it inside `voiceFaults`, so this change lifts
it out.

| part | the file | what changes |
|---|---|---|
| the reading | `src/bridge/findings.js` | `readsDraft(it, path, text, lines)` runs Vale on `valeArgvOf` with the text on stdin, then `readsText` |
| what it keeps | the same | the findings at error and at warning on the lines the caller names |
| the pull | `src/scripts/pull-chapter.js` | `voiceFaults` calls `readsDraft` over its chapter's lines, and `REFUSES` moves beside the reading |
| the open | `src/scripts/ticket-ask-lint.js` | `askFaults` calls `readsDraft` over the whole ticket, and keeps the Ask's lines |
| the note | `src/scripts/ticket.js` | `note` reads the minted text through `readsDraft` before it writes, and keeps the Ask's lines |
| its refusal | the same | the note writes nothing, prints each finding at its line, and exits 1 |
| the routes | `test/contract/process.test.js` | a case mints a ticket off every route under `spec/processes`, and real Vale reads it |
| what it holds | the same | no finding stands on a line the route writes: a heading, a `does` comment or a `says` comment |
| the design | `spec/design_output/pull.md#the-voice-reads-the-evidence` | the chapter names the open and the note beside the pull |

The cases:

- `ticket.test.js`: `ticket open` over an Ask carrying a semicolon refuses, naming `Characters`
- `ticket.test.js`: `ticket note a-name "one; two"` refuses, and writes no file
- `one-reader.test.js` keeps passing, because the pull reads through the same function

The callers:

- `handBack` in `pull.js` calls `voiceFaults`
- `open` in `ticket.js` calls `askFaults`
- `retro-new.js` mints through `mintedNote`, and the route case covers what it renders

The cost: a warning in a route's own text now fails the contract case, and the change fixes each one it finds.

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
