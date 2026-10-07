---
kind: [[ticket]]
state: closed
group: the-check-runs-beside
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
step: do
record:
  - step: do
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 20fc25d8293ed8079d406ef75e73e1e3b9cc5c8c
    hash_after: c37e0c34ae798a3773ec6e2c7e13f8d3552331da
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/lsp passes
      - name: check
        exit: 0
        said: "   61.5  in all"
    inputs:
      - name: ask
        hash: 6ad91211404d5f27
        size: 631
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The rules part runs Vale beside every other part, and a script rule under that load passes Vale's own cap, which Vale names E201. The lint then reads no file and turns the check red on a sound tree. The Vale run in the lint module goes again on E201, a bounded number of times, as the contract case on Vale paths does.

- gain: the check reads the tree's rules, and not the box's load
- breaks: a sound tree goes red under the parts running at once, and the push waits on a rerun
- done_when:
  - `./RUNME.sh test src/modules/lsp/tools_test.go` passes a case where Vale answers E201 once, then rows
  - `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/lsp/tools_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lint runs Vale again when Vale names its own timeout, E201, up to valeTries runs. With every part of the check at once, a script rule passed the cap of Vale on a sound tree, and the rules part read no file and went red.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the Vale run in the lint module goes again on E201
- the change reveals no cleanup past it
- the code and the count stand once, at the top of tools.go, and the ticket carries the reason

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
