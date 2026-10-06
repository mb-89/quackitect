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
group: examples-are-the-tests
depends_on: [examples-design-note]
step: do
record:
  - step: do
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: ddcbc025af154a9d77acd4582c9528db33c214ae
    hash_after: 08c70f993809168006750cf9805d815c5e921ecd
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.8  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 9daa5cdab6673a51
        size: 590
    def: df12650931d480c9
reason: done
---

# Ask

The rules on examples reach every hand that writes a test and every retro that audits one: the testing guidance names the example as the behavior test, and the retro's audit counts features with no example and tests that duplicate one.

A hand writing a test never meets the design note, and the suite keeps growing tests that re-assert what an example shows.

- `spec/guidance/code/testing.md` carries the example rules, added beside what the code-is-pure group writes there
- `spec/processes/retro.yaml` and `spec/guidance/retro/audit.md` carry the two counts
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/guidance_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The example rules stand in spec/guidance/code/examples.md, tagged testing so every testing step reads them, with their argument in spec/rationales/examples.md. Rule 10 of testing.md points at them. The audit guidance carries rule 6 on the two counts, argued in spec/rationales/auditing.md, and the audit step of spec/processes/retro.yaml carries the checklist item. The guidance golden reads the new note.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from the ask in one place: testing.md stands at the cap of fifteen items the guidance schema holds, so the rules take a note of their own beside it, tagged testing, and testing.md points there; this also leaves the code-is-pure group its own room in testing.md
- the cleanup it reveals: the RestatedTable rule timing out under load, fixed in restated-table-runs-in-time; the guidance golden has a JS writer and a Go -update flag, noted for the retro
- each fact stands once: the rules link the design note chapters, and argue in the rationale

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
