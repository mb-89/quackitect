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
depends_on: [examples-design-input]
step: do
record:
  - step: do
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: c977d06ba160c99d5866ffadc43ac6c55856ff08
    hash_after: ff6a3951c4b7901b3d5bced29c16821dda05db2b
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    3.3  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 3d9c156f056cb609
        size: 539
    def: df12650931d480c9
reason: done
---

# Ask

One design note says how an example is tutorial, documentation and behavior test at once: its format, its runner, the two places, the two ways to run it, the Tutorial tab and its search, the checks, and how it meets the doors, the fixtures and the test ratio. The implementation group builds from it.

The implementation group builds from the owner's points alone, and each hand invents its own format, runner and explorer.

- `spec/design_output/examples.md` stands, with a chapter for each part the ask names
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

spec/design_output/examples.md holds the design: the example format with its expect lines, the user and developer places, the suite of examples, cases and contract tests, one parser with an interactive driver and a Go harness, the Tutorial tab and its search, the Runme editor road, the checks, and how examples meet doors, fixtures and the ratio.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the note follows the ask, a chapter for each part it names
- the cleanup it reveals: mint_note writes the Scope alone and drops free chapters, and the Vale script timeout under load, both noted for the retro
- each fact stands once: the doors, the fakes, the fixture home and the ratio stay in their own notes, and this note points at them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
