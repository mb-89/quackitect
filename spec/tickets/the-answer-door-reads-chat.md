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
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 110e6960d7e56b40cc1b1106e1432715bd5bd0f3
    hash_after: 135d102b2930583c69c9220e94820e065701c0ce
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-10
    hash_before: 90b2ac3bd6d3198cef6225c150eacb7367f2c25a
    hash_after: 90b2ac3bd6d3198cef6225c150eacb7367f2c25a
    returns: 1
    why: the table claims a case covers `onAgentSpoke`, and the tree holds none, so that row reads false; the change table leaves out `src/bridge/answer.js`, which the prose changes at `SAYS` and the refusal; a `SAYS` rewrite breaks the standing case asserting the report line, and the plan names no fix; the reply line chapter alone changes, and the paragraph under "What the door reads" keeps the opposite rule; the refusal quoted under "What the refusal says" drifts from `SAYS` today, and the plan skips it; the cited log pair stands outside the log this box keeps, though the ordering it claims holds; "Two things the road does" opens a list of three bullets; the three cases the plan names run against the door as written, so the shape holds; `./RUNME.sh check` answers 0 on this branch, and the handback carries no retro
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 8957836c819b43e2d46ab96990d693e7a73faa42
    hash_after: 47f361632d2a55e801ee9d972611fcdf97d64e6c
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-11
    hash_before: 6e73dceeee447f4bcd7029d590ddc9756fa978bd
    hash_after: 6e73dceeee447f4bcd7029d590ddc9756fa978bd
    returns: 2
    why: the tree holds two `SAYS`, and the plan names the one under `src/bridge/answer.js` alone; the chapter "What the refusal says" quotes the `SAYS` of `.claude/skills/level0/lib/answer.js` today; a standing case in `test/level0/answer.test.js` asserts that second `SAYS`, and the plan skips it; the draft writes a count, and the log carries 44 rows today, so the count drifts; 35 of those 44 rows follow a call, so "every one of them" overstates the log; the ordering holds on 33 rows, where a displayed text stands between two calls; answers the earlier findings on the `onAgentSpoke` row, the change table, and the `SAYS` case; answers the earlier findings on both chapters, the refusal quote, and the log this box keeps; answers the earlier finding on the bullet count, now three bullets under "Three things the road does"; the three cases the plan names run against the door as written, so the shape holds; `./RUNME.sh check` answers 0 on this branch, and the branch review reads the retro as absent
---

# Ask

an answer written in the chat pays the owner's prompt at once

the door refuses the calls that carry the work, after the answer stands

- a tool call after an answer in the chat meets no refusal
- a case covers text shown between two calls paying the demand

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- the road stands already, and nothing holds it
- the cases the ask names go in `test/level0/answer-door.test.js`
- the door's wording and two chapters change beside them

**What stands.** `onMessageDisplay` in `src/bridge/answer.js` reads the text
the chat shows and pays the demand with it. The server wires it at
`classic.MessageDisplay`, and the bridgehead posts every event.

| the road | what pays | what covers it |
|---|---|---|
| the report tool | `pays` | a case in `answer-door.test.js` |
| the bridgehead's texts | `onAgentSpoke` | nothing |
| the chat | `onMessageDisplay` | nothing |

**Measured here.** `.se/.log/session.jsonl` on this box carries 43 rows for
`classic.MessageDisplay`, and every one of them lands after a tool call of the
same turn. Each carries the text under `delta`.

So the client posts the event for a text between two calls, and the door reads
it there. A reader wanting the count again runs the log through `rowsIn` and
counts the event.

**The chapters.** Two chapters carry the old reading, and the measurement above
overturns one line of each.

| the chapter | what it says today | what it says after |
|---|---|---|
| What the door reads | the first text of a turn pays, and a text between calls pays nothing | every displayed text pays, because the client posts each one |
| The reply line | the agent writes the chat and calls the report | the chat pays, and the report writes the log |
| What the refusal says | a refusal the code left behind | the refusal `SAYS` builds today |

**The change.** The cases, the door's wording, and the chapters.

| what changes | where |
|---|---|
| a case pays the demand off a text shown between two calls | `test/level0/answer-door.test.js` |
| a case reads no refusal on the call after it | the same file |
| a case leaves the demand standing where the text is empty | the same file |
| `SAYS` and the refusal say the chat pays | `src/bridge/answer.js` |
| the standing case over `SAYS` reads the new words | `answer-door.test.js` |
| the three chapters above | `spec/design_output/level0.md` |

The standing case asserts the words `mcp__level0__report with the same text`.
`SAYS` keeps the report beside the chat, so that case changes with the wording
and holds the same claim.

**What the cases show.** Three things the road does that nobody decides.

- any displayed text pays, so one word pays as well as an answer
- the score of an answer stands in the other door, which reads a draft
- a harness sending no display event leaves the report road, as it works today

**What this leaves.** The first of those three wants a ruling: a text under a
length pays nothing, or every text pays and the score door alone judges. The
ask says an answer in the chat pays at once, so the cases take that reading.
The review decides it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- the tree holds two `SAYS`, and the plan names the one under `src/bridge/answer.js` alone
- the chapter "What the refusal says" quotes the `SAYS` of `.claude/skills/level0/lib/answer.js` today
- a standing case in `test/level0/answer.test.js` asserts that second `SAYS`, and the plan skips it
- the draft writes a count, and the log carries 44 rows today, so the count drifts
- 35 of those 44 rows follow a call, so "every one of them" overstates the log
- the ordering holds on 33 rows, where a displayed text stands between two calls
- answers the earlier findings on the `onAgentSpoke` row, the change table, and the `SAYS` case
- answers the earlier findings on both chapters, the refusal quote, and the log this box keeps
- answers the earlier finding on the bullet count, now three bullets under "Three things the road does"
- the three cases the plan names run against the door as written, so the shape holds
- `./RUNME.sh check` answers 0 on this branch, and the branch review reads the retro as absent

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
