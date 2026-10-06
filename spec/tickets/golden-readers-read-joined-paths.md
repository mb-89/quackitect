---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: size-golden-drops-line-counts/gate
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
group: engine-verbs-hold
parent: size-golden-drops-line-counts
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 0dd17dde38cd3e4adcf48c1f6ef255408966b4fc
    hash_after: 0dd17dde38cd3e4adcf48c1f6ef255408966b4fc
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   87.1  in all"
    inputs:
      - name: ask
        hash: d453e8455c3f6841
        size: 305
    def: 8cfd8a673e77c8ef
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

goldenReaders matches a slash path past src/, so src/tui/log/golden_test.go logGoldenAt, written filepath.Join("..", "..", "quack", "testdata"), names no reader for src/quack/testdata/log.golden.json; implement writes that reader FromSlash as it writes twinsAt, or goldenReaders reads the joined form too.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

CGO_ENABLED=0 go test -count=1 ./src/tui/log/ && CGO_ENABLED=0 go test -count=1 ./src/quack/ -run TestTwinGoldens && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

goldenReaders finds a golden's readers by the folder path a test file's text names, written with slashes. logGoldenAt and logFixtureAt in src/tui/log/golden_test.go and twinsAt in src/quack/check_twins_test.go built their paths with filepath.Join, so a change to a golden under src/quack/testdata or src/modules/check/testdata named no reader there. Each path now reads filepath.FromSlash over the slash form, which builds the same path and names the folder in its text.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask by its first road: each reader writes its path FromSlash, and goldenReaders keeps reading slash paths alone.
The change takes twinsAt with it, the same rewrite the parent's draft names, and a grep for filepath.Join over a testdata path in test files finds none left.
The folder path stands once in each reader's own variable.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
