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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 1f8a865a70a7709a73a3c831a7472fe999b44bc5
    hash_after: ef1b7d2f7c043be463b8de6cfa71fd62cac9255a
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   58.1  in all"
    inputs:
      - name: ask
        hash: 96769a3753488944
        size: 362
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a read or a post to a wedged index ends on an error, so an unattended verb never hangs on it.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `answers` in `src/quack/boxdoors.go` sends through `http.DefaultClient`, which carries no deadline, while every sibling door bounds its client.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/quack/ -run TestTheV1ClientCarriesABound` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`answers` in `src/quack/boxdoors.go` sends through a client bounded by the wait it takes, and `reads` and `posts` hand it `answerWait`, the bound the sibling doors use. A read to a wedged index now ends on an error. `TestTheV1ClientCarriesABound` hangs past a five-second test timeout on the unbounded client, and passes in its bound now. `follows` keeps its pause, and each read inside it carries the bound.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch through `answerWait`
- the bound stands in `answerWait` alone
- the case stands a listener as the bound door test, marked as such

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
