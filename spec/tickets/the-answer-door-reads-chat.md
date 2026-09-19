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
- the chapter naming the two places changes with them

**What stands.** `onMessageDisplay` in `src/bridge/answer.js` reads the text
the chat shows and pays the demand with it. The server wires it at
`classic.MessageDisplay`, and the bridgehead posts every event.

| the road | what pays | what covers it |
|---|---|---|
| the report tool | `pays` | a case in `answer-door.test.js` |
| the bridgehead's texts | `onAgentSpoke` | a case in the same file |
| the chat | `onMessageDisplay` | nothing |

**Measured here.** This box shows the text reaching the server before the call
under it. One pair off `.se/.log/session.jsonl`: the display lands at
`22:45:48.097`, and the call after it at `22:45:48.975`.

**The change.** Three cases, and one chapter.

| what changes | where |
|---|---|
| a case pays the demand off a displayed text | `test/level0/answer-door.test.js` |
| a case reads no refusal on the call after it | the same file |
| a case leaves a demand standing where the text is empty | the same file |
| the chapter says the chat pays, and the report writes the log | the reply line chapter |

The chapter reads today as though the agent owes both. A chat answer pays, and
the report stays the way the log takes the same text. So the wording of the
door changes with it, in `SAYS` and in the refusal.

**What the cases will show.** Two things the road does that nobody decided.

- any displayed text pays, so one word pays as well as an answer
- the score of an answer stands in the other door, which reads a draft
- a harness sending no display event leaves the report road, as it works today

**What this leaves.** The first of those two wants a ruling: a text under a
length pays nothing, or every text pays and the score door alone judges. The
ask says an answer in the chat pays at once, so the cases take that reading.
The review decides it.

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
