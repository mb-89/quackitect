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
step: implement/tests-red
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 054a9a4d91fe4d68be64397e96b000824bd09256
    hash_after: 054a9a4d91fe4d68be64397e96b000824bd09256
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 1de3fec1fddee01385d0e099e711e60ba236630b
    hash_after: 1de3fec1fddee01385d0e099e711e60ba236630b
---

# Ask

A count or a copied fact meets a check before it lands, so each fact keeps one owner. A reader then finds the current value on the first read.

Notes count their tables and test runs, and a header counts its files. `level0.js` spells the self-test flag and timeout again, and `stepsIn` parses the route `leavesOf` owns. Each copy drifts from its owner unseen.

- `VoiceVale.CountedList` stands at warning over notes
- `CodeComment` refuses a long header or one carrying a count
- `level0.js` builds its start script from `SELF_TEST` and `TESTING`
- a shared fixture test holds `stepsIn` to `leavesOf`
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Four owners, and a check holds each copy to its owner.

| part | what changes |
|---|---|
| the list count | a new script rule `spec/config/styles/VoiceVale/CountedList.yml` at warning |
| what it reads | a line holding a count word, right above a list or a table |
| where it reads | every note, and the code section of `.vale.ini` sets it `NO` |
| the header | a new script rule `VoiceVale/CodeHeader.yml` at error, over the leading comment |
| what it refuses | a sixth header line, and a header line holding a count word |
| `CodeComment` | keeps the stray comment at warning, and hands the header length to `CodeHeader` |
| the constants | `SELF_TEST` and `TESTING` move into `.claude/skills/level0/lib/vehicle.js` |
| their readers | `reload.js` and `server.js` import both, and `START` in `level0.js` spells them through a template |
| the route | `test/level0/route-fixture.test.js` runs `stepsIn` and `leavesOf` over the same tickets |
| what it holds | both name the same leaf paths, a nested route and a leaf with evidence among them |
| the fixes | every header and list the new rules name lands fixed in the same change |

A count word is a digit or a number word from `two` up, before a plural noun.

- the cost: a Vale rule holds one level, so the header takes a rule of its own beside `CodeComment`
- the cost: the bridgehead imports its own folder alone, so the constants move there and the server reads them
- the case: a note with a counted list warns, and a header with a count refuses
- the case: `START` carries the flag and the timeout `vehicle.js` exports
- `./RUNME.sh check` answers 0 once the fixes land

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- design: the approach answers every line of the Ask, and `./RUNME.sh check` answers 0 on the base.
- design: `CodeHeader` refuses in place of `CodeComment`, against the Ask's wording.
- design: that deviation stands argued, because a Vale rule carries one level and `CodeComment` warns on a stray comment.
- design: `level0.js` imports `vehicle.js` already, so the constants reach `START` with no new import road.
- design: `reload.js` owns both constants today, and `server.js` reads the flag from it.
- design: the extension bundles alone, so a shared fixture test is the right hold on `stepsIn`.
- craft: `CodeComment` skips a line holding a link, so name whether `CodeHeader` counts that line.
- craft: `CountedList` reads the line above a list or a table alone, so a counted test run slips past.
- craft: name the ticket and answer sections, since the prose glob reaches them and the Ask says notes.
- craft: `vehicle.js` owns vehicles, so a comment names why the self-test constants stand there.
- craft: line 21 of `level0.js` says the hook imports nothing, so correct it in the same change.

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
