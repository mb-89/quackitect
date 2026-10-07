---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-waits-on-events/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: go-waits-on-events
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: e91ba968db7751c446480c1ec7a049d507e3e7c7
    hash_after: e91ba968db7751c446480c1ec7a049d507e3e7c7
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/modules/lsp passes; green, src/modules/hooks passes; green, src/modules/index passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 3991c2e8761f5692
        size: 378
    def: d6b1f4f6b79afd91
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft hands each caller's test clock.NewFake, but noModule in src/imports/imports.go refuses src/index, src/modules/lsp, src/modules/hooks, src/modules/index and src/tui/frame, their _test packages among them since ownModule trims _test, an import of src/modules/clock; the fake moves where those tests reach it, q/qtest beside its contract suite, and size names those files

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/index src/modules/lsp src/modules/hooks src/modules/index src/tui/frame src/q src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The fake clock moved to src/q/qtest/clock.go. The tests of src/index, src/modules/lsp, src/modules/hooks, src/modules/index and src/tui/frame now reach it through q/qtest, so noModule refuses none of them. src/modules/clock keeps NewFake as a pointer at the qtest fake for its own callers.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, with one departure: the contract suite stays in src/modules/clock/clock_contract_test.go. It drives the real clock, which q/qtest cannot import. It runs the qtest fake, the real clock and the wall through the same cases, and the check passes it.
the change reveals no cleanup
the fake stands once, in src/q/qtest/clock.go, and the module points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
