---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: commits-name-their-writer/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-foundation-closes-its-gaps
parent: commits-name-their-writer
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 7442a53baa40fddcdc227d00cf221deff15b4e11
    hash_after: 7442a53baa40fddcdc227d00cf221deff15b4e11
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-config-module-resolves-layers.md:327:86: Vocabulary: qtest stands outside the words this tree writes. W"
    inputs:
      - name: ask
        hash: 725a756b8b869cf9
        size: 298
    def: 10eb0330577be131
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`grep -rn GivenIn src` hits src/quack/testdata/tree.golden.json, which holds every ticket's ask with this one's among them, so the third done_when line stays unmet by its own command. The case in src/quack/given_test.go reads .go files alone, so the ask wants `grep -rn --include=*.go GivenIn src`.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/given_test.go src/quack/golden_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The third done_when line of commits-name-their-writer now greps the Go files alone, with --include=*.go.
The golden file under src/quack/testdata holds every ticket's ask, so a bare grep over src always hit this ask's own words.
The grep now reads what the given-form case reads, and it finds no hit.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask and edits its one line.
The reading reveals no cleanup, since the golden case stays green over the edited ask.
The command stands once, in that ask line.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
