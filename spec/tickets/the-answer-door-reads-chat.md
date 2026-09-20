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
step: implement/reflect
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
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: de19c56112d536e49ae506441c524c4c8ccf1993
    hash_after: 7b95a88b002539244f003de1862a742db68d6656
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-12
    hash_before: 77088ba3b0cfda96050dd92ed8dd4421be89f424
    hash_after: 77088ba3b0cfda96050dd92ed8dd4421be89f424
  - step: implement/tests-red
    hand: box fa49097ce66c · claude-code-remote
    hash_before: d5882b8b675c2eefc369ed9663865bf737c19b1f
    hash_after: d5882b8b675c2eefc369ed9663865bf737c19b1f
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 05527dd4fd9af3f4e4b2d69200eafbd084c0446f
    hash_after: cc182fdb38e7240e269231a18041b982bc6b76c3
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 50244aa517488b643ac7f7019c42dbbdd1a33ae9
    hash_after: 7c20a5de5f9af2e6a3bcc01a7e24f74e102fe0f4
    answered:
      - name: tests
        exit: 0
        said: green, 386 test(s) pass in 35 file(s); green, src/engine/swap passes
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box fa49097ce66c · claude-code-remote · helper-13
    hash_before: 819395e3d10d39bf1cfe94e5213fd1e8f9f85991
    hash_after: 819395e3d10d39bf1cfe94e5213fd1e8f9f85991
    returns: 1
    why: "the header of `src/bridge/report.js` holds the claim this branch overturns, that a chat text waits for turn end; `spec/design_output/extension.md` line 410 holds the same claim, and links to the chapter now saying the opposite; an ask under `ask.wanted` takes a fitting chat text too, so that chapter's rule about the tool reads false; the chapter What the refusal says quotes the lib `SAYS` in full, and the case holds the constant alone; so the chapter's claim that a case keeps the two together overstates what the tree holds; the three display cases run green before the change, and the wording case alone carries red; `onMessageDisplay` pays off `delta`, and `src/bridge/server.js` wires it at `classic.MessageDisplay`; the blank-text case feeds the door an empty delta and asserts the refusal `{ needs: \"reply\" }`; the change reaches the six files the design table names, and each hunk answers a row of it; `./RUNME.sh check` answers 0 on this branch; the branch review reads the retro as absent"
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

**Measured here.** `.se/.log/session.jsonl` on this box carries a row for
`classic.MessageDisplay` each time the chat shows a text, and each row holds
that text under `delta`. Most of those rows stand between two calls of one
turn, and the rest open a turn.

So the client posts the event for a text between two calls, and the door reads
it there. A reader counts the rows by running the log through `rowsIn` and
reading the event of each.

**The chapters.** Two chapters carry the old reading, and the measurement above
overturns one line of each.

| the chapter | what it says today | what it says after |
|---|---|---|
| What the door reads | the first text of a turn pays, and a text between calls pays nothing | every displayed text pays, because the client posts each one |
| The reply line | the agent writes the chat and calls the report | the chat pays, and the report writes the log |
| What the refusal says | the wording of the lib's own refusal | the same wording, with the chat paying |

**Two exports carry the name `SAYS`.** A change reaching one leaves the other
standing, so the plan names each with its reader.

| where `SAYS` stands | what it is | who reads it |
|---|---|---|
| `src/bridge/answer.js` | the words the door's refusal opens with | `onAgentSpoke` |
| `.claude/skills/level0/lib/answer.js` | the constant the owner's prompt door holds | a case in `test/level0/answer.test.js` |

The chapter What the refusal says quotes the lib's constant, and that constant
carries the chapter's own link. So the chapter and the constant change
together, and the case asserting its words changes with them.

**The change.** The cases, the door's wording, and the chapters.

| what changes | where |
|---|---|
| a case pays the demand off a text shown between two calls | `test/level0/answer-door.test.js` |
| a case reads no refusal on the call after it | the same file |
| a case leaves the demand standing where the text is empty | the same file |
| the door's `SAYS` and its refusal say the chat pays | `src/bridge/answer.js` |
| the prompt door's `SAYS` says the same | `.claude/skills/level0/lib/answer.js` |
| the case over the door's `SAYS` reads the new words | `answer-door.test.js` |
| the case over the prompt door's `SAYS` reads the same | `test/level0/answer.test.js` |
| the three chapters above | `spec/design_output/level0.md` |

The case in `answer-door.test.js` asserts the words `mcp__level0__report with
the same text`. Each `SAYS` keeps the report beside the chat, so both cases
change with the wording and hold the same claim.

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

pass

- the three cases the plan names run against the door as written, so the shape holds
- `onMessageDisplay` pays off a displayed text, and `src/bridge/server.js` wires it at `classic.MessageDisplay`
- the road table reads true: a case covers `pays` alone, and both event doors stand bare
- the change table names both `SAYS`, both cases over them, and the three chapters
- `test/level0/answer.test.js` asserts the lib's `SAYS` wording, and the plan carries a row for it
- every display row in the log carries its text under `delta`, and most stand between two calls
- every finding of the verdict before this one takes an answer in the draft
- the ruling the draft leaves open: every text pays, and the score door judges the length
- the quote under What the refusal says drifts from the lib's `SAYS`, so the rewrite takes its new words
- the lead reads Two chapters, and the table under it names three
- "the rest open a turn" overstates, because a few rows follow a call and close a turn
- the branch review reads check as passing, and reads the retro as absent

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Four cases stand in `test/level0/answer-door.test.js`, and one fails on its
own assertion.

| the case | what it reads |
|---|---|
| a text shown between two calls | it pays the demand, which holds today |
| the call after that text | it meets no refusal, which holds today |
| a display carrying blank text | the demand stands, which holds today |
| the door's words say the chat pays | the words leave that out |

**What surprises.** The road works whole. The door pays off a displayed text
between two calls, and the call under it passes, with no line of code changed.

So the fault the ask names lives in the wording and the chapters alone. An
agent reads the door's words and the design, and both tell it to call the
report before the next call. The behaviour under them pays already.

The three green cases hold that road where nothing held it. The red one carries
the change the ask asks for.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases reach the one test file the approach names, and nothing else changes
- the door meets a fake box carrying a log alone, so no door runs live
- a comment over each new case points at this ticket, which carries the approach

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

**The class.** One claim stands in four places, and the change reaches one of
them. The chapter says a text between two calls pays now, and three copies of
the old claim stand on.

| where the old claim stands | what it says |
|---|---|
| the chapter What the door reads | changed |
| the header of `src/bridge/report.js` | a text between calls reaches no hook |
| the paragraph under the reply table of `spec/design_output/extension.md` | the same, and it links at the changed chapter |
| the chapter's own line on the case over `SAYS` | it claims a case the tree holds nowhere |

The design guidance names this: one place owns a thing, and every other place
points at it. A claim copied into a header and a second note drifts the moment
one copy moves.

**The fix for the class.** A change to a claim starts with a search for the
claim, across the code and the notes alike.

- search the tree for the words of the claim before changing the place holding it
- change every copy the search names, or point it at the owner
- write the owner into the copy that stays, so the next reader follows one link
- claim a case stands only where the search names the file holding it

This ticket's change takes that road: the two copies point at the chapter, and
the line claiming a case says what the case holds.

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

- the change reaches the two refusals, their two cases, and the three chapters the approach names
- the door meets a fake box carrying a log alone, so the cases run no door live
- each new line points at this ticket or at the chapter owning what it says

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

An answer in the chat pays the owner's prompt, and the words of the door say
so now. The road pays already. `onMessageDisplay` reads the text off
`classic.MessageDisplay`, for a text between two calls as much as for the
first of a turn.

| what changes | so that |
|---|---|
| the door's `SAYS` names the chat as paying | an agent reads what its answer buys |
| the prompt door's `SAYS` says the same | the two refusals read alike |
| What the door reads carries the display road | the chapter stops saying a text between calls pays nothing |
| The reply line splits the two roads | the chat pays, and the report writes the log |
| What the refusal says quotes the words standing | the chapter and the constant read together |

Three cases hold that road where nothing held it. The report stays: it carries
the same text into the log, where a retro reads it, and it pays the demand as
the chat does.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches the two refusals, their two cases, and the three chapters the approach names
- the door meets a fake box carrying a log alone, so the cases run no door live
- each new line points at this ticket or at the chapter owning what it says

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/lib/answer.js
- spec/design_output/level0.md
- spec/tickets/the-answer-door-reads-chat.md
- src/bridge/answer.js
- test/level0/answer-door.test.js
- test/level0/answer.test.js
- src/bridge/server.js
- src/bridge/report.js
- spec/design_output/extension.md
- src/engine/projection.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- the header of `src/bridge/report.js` holds the claim this branch overturns, that a chat text waits for turn end
- `spec/design_output/extension.md` line 410 holds the same claim, and links to the chapter now saying the opposite
- an ask under `ask.wanted` takes a fitting chat text too, so that chapter's rule about the tool reads false
- the chapter What the refusal says quotes the lib `SAYS` in full, and the case holds the constant alone
- so the chapter's claim that a case keeps the two together overstates what the tree holds
- the three display cases run green before the change, and the wording case alone carries red
- `onMessageDisplay` pays off `delta`, and `src/bridge/server.js` wires it at `classic.MessageDisplay`
- the blank-text case feeds the door an empty delta and asserts the refusal `{ needs: "reply" }`
- the change reaches the six files the design table names, and each hunk answers a row of it
- `./RUNME.sh check` answers 0 on this branch
- the branch review reads the retro as absent

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- two `SAYS` constants each serve one door, and the chapter repeats the lib words, so findings four and five stand

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
