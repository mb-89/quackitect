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
group: dead-tests-and-code-leave
cloud: true
step: do
record:
  - step: do
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 595ba015c5de206810847729ad2748889e25b3e3
    hash_after: fd2ee37a46636da1ea638af8cd57e682fa79affe
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/imports passes; green, src/branches passes; green, src/tui passes
      - name: check
        exit: 0
        said: "   67.8  in all"
    inputs:
      - name: ask
        hash: b91011e441be2b8f
        size: 733
    def: df12650931d480c9
reason: done
---

# Ask

Tests that restate one another merge into one test each, so one behavior meets one test and a change edits one place.

A change to the verb list or a wiring touches a test a verb. A reader meets several copies of a branches or tui test, and cannot tell which counts.

- one table test over the verb list stands in place of one registers test a verb
- one wiring table stands in place of the wiring tests a wire
- the tree holds none of the branches native tests the port_* suites restate
- the tree holds none of the tui root tests that tui/work and tui/tree restate
- the log-tab and frame tests sit in their own packages
- one test covers the window port
- the import-layering checks sit in src/imports
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack src/imports src/branches src/tui

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Tests that restated one another merge into one test each, following findings 11, 12, 13, 15, 17 and 18 of the Go test audit on the test audit branch. One table test in src/quack/registry_test.go walks the verb list, and one in src/quack/tools_test.go walks the wiring names callers read, in place of a test a verb and a test a wire. The branches natives the port suites restate leave, and where a native asserted more than its port test, that assertion moved into the port test first. The tui root tests that tui/work and tui/tree restate leave the same way. The log-tab keys and sort tests move to tui/log, and the frame tests move to tui/frame over a stub tab, since tui/frame cannot import the log tab. The window door keeps its one real-port test in tui/frame, and the quack copy over tuiTellAt leaves, because that function only passes its port on. The tui package table and the rule that the index imports no module now stand in src/imports, each with a planted case that proves the rule names a fault. The audit paired some tests wrongly: sort_test tested the log tab, and several native branches tests asserted messages their port test missed. Those assertions were kept and moved, not deleted.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask item by item; the window port departs from the audit's fake, and the says field names why
- the cleanup it reveals is in the change: unused helpers, the programsFolder constant and the net import left with their tests
- every fact stands in one place: the verb list and the wiring names are read off their owners, and the import tables live in src/imports alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
