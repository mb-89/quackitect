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
group: retro-verbs-run-in-go
step: do
record:
  - step: do
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: 3ba926a91fb2bbc0f416ab6589b030f1ba336559
    hash_after: 3ba926a91fb2bbc0f416ab6589b030f1ba336559
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   69.2  in all"
    inputs:
      - name: ask
        hash: e406c2821133ccf7
        size: 264
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The push waits on the warnings the retro port left in its Go files and in config.md. Each number takes a name in its file's constants block, and each file past the line cap splits by topic. Done when `./RUNME.sh lint` names no warning in a file this group changed.

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

The push gate held on the warnings the retro port left: unnamed numbers in its Go files, four files past the line cap, a hedge, and a long sentence in config.md. Each number now takes a name, the zeros take the Go zero value, and the long files split by topic into cloud, values, JavaScript values and mint JSON files. The code moved whole, and the stamp reads no warning.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup it reveals: two shared names already stood for the bit size and the decimal base, and the split reuses them
- the fact stands once: each number takes one name in its file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
