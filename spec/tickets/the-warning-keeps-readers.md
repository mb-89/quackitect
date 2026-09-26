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
    hash_before: d7f2d88019f64de1bb03e03f16cbd4c138e60b38
    hash_after: d7f2d88019f64de1bb03e03f16cbd4c138e60b38
    answered:
      - name: tests
        exit: 0
        said: green, 38 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-warning-keeps-readers.md:69:79: Antithesis: Say what is. 'never' opens a half that says what the thing "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The rewritten prompt carries the `warns` line into the owner's row the transcript and `$.session.messages()` hand back. Name every reader of an owner row's text, `sinceTheOwner` and `answerAfter` in `.claude/skills/level0/lib/answer.js` among them, and show each reads the same with the line in front

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/answer.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Every reader of an owner row's text reads the same with the warning line in front. A grep for readers of a `user` row and of transcript content names these:

- `sinceTheOwner` in `lib/answer.js` reads the role and the tool results, and never the text
- `answerAfter` and `spokeSince` in `lib/answer.js` read the agent rows past the owner row
- `answersIn` in `lib/voice.js` reads agent rows alone
- `pastRow` in `src/bridge/answer.js` reads the role and the results mark
- `onPromptSubmit` reads the prompt's text before the rewrite, so `namesNote`, `questionsIn` and the prompt log row read it bare

A case in `test/level0/answer.test.js` drives the first three readers over an owner row with and without the line, and they answer the same.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: it names every reader and a case shows each reads the same
- the cleanup: none stands, because no reader needed a change
- the list of readers stands in this ticket alone, and the case points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
