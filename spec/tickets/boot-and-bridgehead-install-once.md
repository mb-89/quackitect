---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: sessions-boot-from-the-repo/gate
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
group: the-cloud-works-its-queue
parent: sessions-boot-from-the-repo
record:
  - step: do
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 8865b09018434341fe6e357af533691e8548e2d6
    hash_after: 55eb3be4a6d996259a53961803c50a82eb0e9afa
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-bridge-outlives-its-starter.md:402:1: ListItem: A sentence in a list item holds 20 words, and this one "
    inputs:
      - name: ask
        hash: 22d1135cd6f870ee
        size: 233
    def: 96460415736d4305
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

where the manifest stands and node_modules stands nowhere, both boots and the bridgehead START road run src/scripts/install.sh on the same session start. Name which one runs, or a guard keeping the second from running over the first.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

On a cloud box where the manifest stands and the modules stand nowhere, the plugin loads and its start road installs the modules. The boot hook installed on the same start, so two installs wrote one tree. boots now installs where the manifest stands nowhere alone. There no plugin loads, so no start road runs, and the level zero note says which road owns which case.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it names the road that runs in each case, and no lock guards one install from another
the cleanup the change reveals stands in it: the modules entry of the boot needs goes, and the fixture line says the new split
the split stands once, in the boot hook section of the level zero note, and boot.js points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
