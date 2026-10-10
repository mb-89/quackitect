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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box ad0d66ffa433 · claude-code-remote
    hash_before: e2642392fe00016afc2025f878fa16ee7b324763
    hash_after: 7032ce8d152951acda59581a2ddbc4afaecd57db
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   65.1  in all"
    inputs:
      - name: ask
        hash: 884b4bc5e452ef27
        size: 338
    def: df12650931d480c9
reason: done
---

# Ask

retroJSToNumber reads a one-letter string as NaN, so a stray letter in rates.json or a chapter bound leaves the retro verbs running.

Any one-letter string other than e slices out of range, and the retro verb reading it panics.

- go test ./src/quack -run TestRetroJS passes cases for x, a and N reading as NaN
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/retro_jsvalues_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The number reader in `src/quack/retro_jsvalues.go` cuts the hex prefix before it reads the digits, so a one-letter text reads as NaN where it panicked out of range. A stray letter in a rates file or a chapter bound now leaves the retro verbs running. The case `TestRetroJSToNumberReadsALetterAsNaN` reads three letters as NaN, and a hex text and an empty one keep their numbers.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the rule stands once, in the comment beside the prefix cut

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
