---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: index-reads-loaded-projections/gate
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
group: quack-verbs-switch-over
parent: index-reads-loaded-projections
record:
  - step: do
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 6786f5cb325382f907f102f99606ae24b25d89bc
    hash_after: 6786f5cb325382f907f102f99606ae24b25d89bc
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/config passes
      - name: check
        exit: 0
        said: "spec/tickets/index-reads-loaded-projections.md:333:153: Characters: The character / stands outside the set a paragraph a"
    inputs:
      - name: ask
        hash: b0ca1541d418ea23
        size: 123
    def: 75d8d0f2720c47bf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names a `shadow` value for the config case, and the case seeds `switch` at 3. Align the tests list with the case.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/config

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent's draft named a `shadow` value for the config case, while `TestValuesReadTheTrackedFile` seeds `migration.switch` at 3 and reads 3 at `migration/config/switch`. The engine writes the parent's draft, so the correction stands under the parent's `# Discussion`, and the case decides the claim as it stands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the parent's Discussion names the value the case seeds, since the door refuses a write to the passed draft
the cleanup the change reveals: the curl key on the parent's ask stands corrected beside it in the same Discussion
every fact stands in one place: the case owns the value, and the Discussion points at the case

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
