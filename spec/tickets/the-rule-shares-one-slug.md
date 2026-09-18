---
kind: [[ticket]]
state: open
urgency: now
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

The slug turning a heading into an anchor stands in four places today, all of
them JavaScript:

- `src/extension/lib/panel.js`
- `.claude/skills/level0/lib/projection.js`
- `.claude/skills/level0/lib/schema.js`
- `test/contract/vocabulary.test.js`

[[spec/tickets/a-pointer-names-its-heading]] asks for a rule in the language
server, which is Go. That module imports none of the four, so the rule carries a
fifth copy.

One place owns a thing, and a copy a technical reason forces says so beside it.
So the owner decides which way this lands:

| way | what it costs |
|---|---|
| a fifth copy in Go, with its reason beside it | a rule drifting from the four, and one more place to fix |
| the checker asks the index over its door | a call per note, and a second module in the rule's path |
| one owner in Go, and the four read it | every JavaScript caller reaching a binary to slug a heading |

The design step returned twice on this rule, and the engine parked a person step
on that ticket. [[spec/tickets/a-pointer-names-its-heading]] carries the record.

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- [[spec/tickets/a-pointer-names-its-heading]] stands at its design step until the answer lands
- ten notes keep a pointer naming a heading standing nowhere, and the scan under the private folder lists them

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer names one of the three ways, or a fourth the reader writes down
- `./RUNME.sh check` answers 0 once the rule and the notes land

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The rule carries its own slug in Go, with the reason beside it.

| way | why it stands aside |
|---|---|
| the checker asks the index | a call a note, and a second module in the rule's path |
| one owner in Go | every reader in JavaScript then reaches a binary to slug a heading |

Voice rule 7 takes a copy a technical reason forces, where that reason stands
beside it. A Go module imports no JavaScript, and that is the reason.

So the Go slug names the four copies in its comment, and a contract test holds
the five to one answer. A copy drifting then fails the check.

A wrong answer here moves one function. A later commit undoes it, so this box
decides it.

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

- [[spec/tickets/a-pointer-names-its-heading]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times: The three moves turn `owner's` into `owner-s`, so they answer the anchor `the-owner-s-prompt-comes-first`.
  - Say instead that the slug matches the one that stands, which turns `owner's` into `owners` before it dashes the rest.
  - A slug stands already in `test/contract/vocabulary.test.js`. Name it as the one the rule matches, so the copy carries its reason.
  - The list names [[spec/design_input/a-stub-takes-its-vehicle]], whose heading `The stub's files` answers the anchor its pointer names.
  - Drop that note, because the slug that stands resolves it. Ten notes stay.
  - The check answers 0 on this commit.
