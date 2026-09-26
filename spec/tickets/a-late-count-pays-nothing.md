---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-reply-follows-its-prompt/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-gates-read-the-state
parent: a-reply-follows-its-prompt
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: b193e8fee0d495d3ea086000dcde87eee6fcbc1f
    hash_after: b193e8fee0d495d3ea086000dcde87eee6fcbc1f
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-warning-has-fallback.md:39:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The owner-row count `owners` taken at `prompt.submit` comes off a transcript that flushes a turn late, per [[spec/design_output/level0#what-the-door-reads]]. There it misses the previous prompt's row, so "the owner row past `owners`" names that older prompt, and its replies pay the new one, the fault the ask's first line names. Where no row id stands, the transcript road stands down and the display road, the report and the `tool.call` event pay, the way the draft already treats a session past the window. A test in `test/level0/answer-door.test.js` drives a transcript a turn late at `prompt.submit`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/answer-door.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A transcript carrying no row ids now pays a prompt nothing. The draft this ticket answers keyed such a transcript on a count of owner rows, and the change never built that count. It still read a transcript without ids off the last spoken text, and a flush a turn late handed an older text through that road. `freshTexts` in `src/bridge/answer.js` stands that road down for a prompt, so the display road pays alone there. `level0.md` says so under `What the door reads`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: no id stands the transcript road down, and the display road pays
- the cleanup stands in the change: the seen road for a prompt goes, and its comment names both tickets
- the rule stands in level0.md once, and the code comment points at the tickets

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
