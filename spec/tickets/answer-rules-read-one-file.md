---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-engine-fixes-its-faults
step: do
record:
  - step: do
    hand: box 6150d1759159 · claude-code-remote
    hash_before: f42953a83c54944c3c16f879fcd337e006d148c6
    hash_after: 1924db97a6ce6fc0ed9d9218c5076cd711de4822
    answered:
      - name: tests
        exit: 0
        said: green, src/rules passes
      - name: check
        exit: 0
        said: "   96.1  in all"
    inputs:
      - name: ask
        hash: d113e1e04e8b55ff
        size: 521
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a ticket or a note takes any name, and the chat answer alone meets the answer rules.

<!-- breaks, as text: what breaks if it is never done -->
breaks: the section `*answer.md` in `src/rules/scope.go` turns `ShapeAnswer` and `ParagraphAnswer` on over every path ending that way. No later section turns them off, so a ticket named so fails the check under rules for a chat answer.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/rules/ -run TestTheAnswerRulesReadTheAnswerFileAlone` passes, over a ticket ending in answer and over `level0-answer.md`
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change the ask names -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/rules

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The answer section in `src/rules/scope.go` and `.vale.ini` reaches `level0-answer.md` alone, the name `answerAs` lints an answer as. A ticket or note whose name ends in answer meets its own section's rules. The rule fixtures lint under that name too, and `TestTheAnswerRulesReadTheAnswerFileAlone` holds both sides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the Discussion says why the ticket stays open past the order
- the fixtures move to the new name in the same change
- the name stands once in each of the two section lists, and `answerAs` owns it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The order that reopens this group closes the ticket as done with, since the ask names `.vale.ini` and the JavaScript `voice.js`. The box keeps it open: the JavaScript left, and the Go rules carry the same glob at `src/rules/scope.go`. The answer lints as `level0-answer.md`, the name `answerAs` holds in `src/modules/drafts/answer.go`.
