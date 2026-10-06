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
step: do
record:
  - step: do
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: bce9088a90586a5382c9b5fcc2c1653536b7ce6a
    hash_after: bce9088a90586a5382c9b5fcc2c1653536b7ce6a
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    3.2  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 297ce510ece32051
        size: 589
    def: df12650931d480c9
reason: done
---

# Ask

The design input carries the owner's points and the explorer's behavior, and the design note points only at rules that stand. The review of the group's accept names each gap.

The implementation group reads a design input holding a Scope alone, and follows pointers at a fixture home and a ratio rule no note holds.

- `spec/design_input/examples-are-the-tests.md` carries a chapter for each of the owner's points, the explorer among them
- `spec/design_output/examples.md` names the fixture home and the ratio by what stands, and says how a tab takes its name
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

The review of the group found the design input standing as a Scope alone, since the mint drops a free chapter. It now carries a chapter for each of the owner's points, the pyqtgraph explorer among them. The design note named a fixture home and a ratio rule no note holds. It now names the TestMain and the fake disk, and the code-is-pure group as the owner of the ratio. It also says a tab takes the word ./RUNME.sh tui takes. Rule 5 of the examples guidance binds once the harness runs examples, so the drafts building the harness stand clear of it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the review point by point
- the cleanup it reveals: mint_note drops every chapter its schema leaves unnamed, noted for the retro
- each fact stands once: the ratio and the fakes stay with their owners

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
