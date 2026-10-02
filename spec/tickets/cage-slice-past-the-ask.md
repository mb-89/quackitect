---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-hooks-door-lands/gate
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
group: go-cage-lands-in-shadow
parent: the-hooks-door-lands
record:
  - step: do
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 2b463b6990d632d62fc53ab35bb8f4740e652b55
    hash_after: 2b463b6990d632d62fc53ab35bb8f4740e652b55
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/migration passes; green, src/modules/config passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e447a8a42daab8ab
        size: 184
    def: 63d61555f665ba51
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the migration slice cage, migration_test.go, spec/config/level0.json and its schema entry lie past the ask's files; the shadow line of the ask carries them, so they ride with the build

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/migration src/modules/config

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The migration module declares the slice cage, built in as old, and the default file sets it to shadow with its schema entry. The ask of the-hooks-door-lands names the key in its group, so the key rides with the build that reads it. The size golden takes the schema line count the new entry moves.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask of go-cage-lands-in-shadow, which names migration/config/slices/cage as a shared key in the default file
- the cleanup it reveals is in the change: the hooks standing file names the owner of its folder, and the size golden takes the new count
- the mode stands in the default file alone, and the doc of the key points at the ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
