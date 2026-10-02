---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: read-topics-land-in-shadow/accept
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-land-in-shadow
parent: read-topics-land-in-shadow
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: ac8ebec4b4e47a18171bb1830d1136ffaf3211dd
    hash_after: 0b80f55f1e53cf6fc33124081d98bc0bf865d215
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 0fafb976e3e88b7d
        size: 138
    def: fdd86be60f49a659
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

nothing imports src/shadow since main dropped src/tui/work/shadow.go, since every shadow writes through the log door; take the package out

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/work

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/shadow leaves the tree. Every shadow writes through the log door, and nothing imports the package since main dropped src/tui/work/shadow.go.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the package leaves, and nothing else changes
- the deletion reveals no further cleanup: a search for src/shadow finds it only in ticket history
- the change adds no fact, so nothing needs a pointer

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
