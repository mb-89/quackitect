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
step: implement/tests-green
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 614c1aa4b8e9220e93e59a8afa6bbbf3016a1391
    hash_after: 614c1aa4b8e9220e93e59a8afa6bbbf3016a1391
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 09245012fb0b240a8abcabdad6f399dccd5597ff
    hash_after: 09245012fb0b240a8abcabdad6f399dccd5597ff
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: b2e6ff24a06f4b7d1561e2042d9ac5157a966350
    hash_after: b2e6ff24a06f4b7d1561e2042d9ac5157a966350
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 31f4eb1d08844b9fdeecdb6a3f6d1b2667b94010
    hash_after: 31f4eb1d08844b9fdeecdb6a3f6d1b2667b94010
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
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

pass
- The road, the level, the routes case and the callers match the ask and the code.
- Craft: a `readsDraft` stands in `prose.js` already, as the handler of `check_prose`.
- Give the shared reading a name apart from it, so one name reads one thing.
- Craft: the ask names `readsProse`, and the approach reads through `readsText`.
- Say why in the approach: `readsProse` drops findings the lint keeps.
- Craft: `test/level0/ticket.test.js` holds the door's cases, and the verbs have no case there.
- Put the open case in `ask-lint.test.js`, and the note case in `ticket-verb.test.js`.
- Craft: a case in `ask-lint.test.js` says a warning leaves the open alone.
- The change turns that case around, so name it beside the cases.
- Craft: `askFaults` takes the rows `askLines` keeps, and those rows drop the comment rows.
- Hand `askFaults` the whole ticket and the Ask's first and last line, so a finding names its file line.
- Craft: the stated cost leaves out a draft whose Ask carries a warning today.
- That draft stops opening until a hand rewrites its Ask.
- Craft: `retro-new.js` puts its `--why` line in the Ask, and no reading covers it.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/ask-lint.test.js test/level0/ticket-verb.test.js test/level0/retro-new.test.js test/contract/process.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Five cases fail on their own assertion, and the route case passes already. Real Vale finds no line a route writes today, so that case holds the routes from here on.

- `ask-lint.test.js`: an error on the Ask names the file's line 10, and the fake Vale reads the lint's argv.
- `ask-lint.test.js`: a warning on the Ask refuses the open, and a warning past the Ask opens it.
- `ask-lint.test.js`: an Ask carrying a semicolon refuses, naming `Characters` at line 10.
- `ticket-verb.test.js`: `ticket note a-name "one; two"` refuses and writes no file.
- `retro-new.test.js`: a `--why` line carrying a semicolon refuses and writes no ticket.
- `process.test.js`: a ticket minted off every route draws no finding from real Vale.
- `semicolon-vale.js`: a fake Vale that names each semicolon on the line the text holds it.

The shared reading stands as a stub named `voiceOver` in `src/bridge/findings.js`, so the route case builds. No ticket under `spec/tickets` stands a draft today.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The tests touch the three verbs, the shared reading and the routes, and the ask names each one.
- Vale reaches the cases through the fake process door, and the route case drives the real Vale.
- Each new case carries a pointer to the design chapter it holds.

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

    ./RUNME.sh lint spec/design_output/pull.md src/bridge/findings.js src/scripts/pull-chapter.js src/scripts/ticket-ask-lint.js src/scripts/ticket.js src/scripts/retro-new.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change touches the files the ask and the review name, and no other.
- Vale stays behind the process door, and the fake process answers it in every level0 case.
- Each new function carries a pointer to `spec/design_output/pull.md`, and the chapter names the road.

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
