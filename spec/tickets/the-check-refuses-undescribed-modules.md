---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: ports-declare-their-looks/gate
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
group: the-foundation-closes-its-gaps
parent: ports-declare-their-looks
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 89fe892caffa9ab83d6419af438a531a7da917b3
    hash_after: 89fe892caffa9ab83d6419af438a531a7da917b3
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    inputs:
      - name: ask
        hash: 547656438e9562e6
        size: 253
    def: 608e902adcc38d3c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask has the check refuse a missing description before a merge, and nothing past the tests calls q.Start, so a production module with no q.Doc passes the check; a test in a package importing every module runs Catalog.Undescribed over the full catalog

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/described_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A test in src/quack builds one catalog off q.Main, every IO module type and every projected module, and fails on each fault Catalog.Undescribed answers. Nothing past the tests calls q.Start, so this test is where a production module with no q.Doc or an input field with no doc tag meets the check before a merge.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, in src/quack, the package importing every module the root loads
the test stands in a file of its own, because main_test.go stands red under tickets-becomes-a-module
the list of modules stays in main.go, and the test reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
