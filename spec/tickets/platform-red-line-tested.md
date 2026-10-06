---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: level0-claims-name-the-platform/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: level-zero-smoke
parent: level0-claims-name-the-platform
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: e1d567742e114553b0d18d63cb2b8d45adcc2846
    hash_after: d21535927362133d19dc443e2c0f963b3e9693d0
reason: became
successors: [level0-claims-name-the-platform]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach has the red line name the platform beside the tree going red, and no test decides it; the builder adds the platform to the existing case 'level zero going red says the tree is red', or drops that claim from the approach

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

cd src && CGO_ENABLED=0 go test -count=1 -run '^$' ./quack/

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

cd src && CGO_ENABLED=0 go vet ./quack/

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The case level zero going red says the tree is red becomes level zero going red says the tree is red on the platform it ran on, and asserts the red line holds on linux beside so this tree is red. Before this, no test decided the approach claim that the red line names the platform. The change touches test code alone. The case stays red until level0-claims-name-the-platform implements level0Runs, as its two sibling platform cases do, so the tests field compiles the package tests and runs none, in place of the red case.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it adds the platform to the existing case and keeps the claim in the approach
the cleanup: none revealed; the stale run of probe dry in level0Runs belongs to the implement step of level0-claims-name-the-platform
one place: the case links the ticket, and the platform word stands in the fake default doors

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
