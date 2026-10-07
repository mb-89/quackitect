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
group: lint-without-vale
parent: lint-without-vale
step: do
record:
  - step: do
    hand: box 612227244607 · claude-code-remote
    hash_before: 79eab26943f2da9753ed4b4773b9d013f49e4c06
    hash_after: a7aea1023b8fa6a67deb1f1d6f81f27d494bec6d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   60.8  in all"
    inputs:
      - name: ask
        hash: 7f3aa5f4add31e22
        size: 295
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The tree lints clean under the Go rules, so `./RUNME.sh branch done` passes on this branch. The done gate counts every warning in the tree, and the warnings stand in files main wrote under Vale and in files the branch carries.

- `./RUNME.sh lint` names no warning.
- `./RUNME.sh check` exits 0.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/battery_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check stamp let a ticket prose warning hold a push only while Vale named its findings vale. The Go rules name them rules, so every open ticket of every group held the done gate shut. holdsPush in src/quack/battery.go now reads the source the Go rules write, and its case reads rules too. Past that, the Go code meets the rules with named numbers and split files, the notes meet the prose rules, and three work headings shorten with their links. Lint still prints the prose of open tickets, which stands at warning by rule and holds no push. The edits a helper made to other groups tickets were dropped, since they stand past this branch.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and departs where the ask reads lint names no warning: ticket prose stays at warning by rule, as the says field explains
the cleanup the change reveals is in the change: the stamp source regression from the Vale switch is fixed here, with its case
every fact stands in one place: proseSource points at fromRules in src/modules/lsp/tools.go in place of a second definition

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
