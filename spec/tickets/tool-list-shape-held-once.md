---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-hook-registers-index-tools/gate
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
group: quack-verbs-land-in-shadow
parent: the-hook-registers-index-tools
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 5129b7859863fceee9914bf9154c448c6df5be74
    hash_after: 5129b7859863fceee9914bf9154c448c6df5be74
reason: became
successors: [the-hook-registers-index-tools]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/index-tools.test.js reads a hand-written list whose fields match listedTool in src/index/tools_test.go today, and no case holds the two to the one shape the index generates

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/index/testdata/tools.golden.json holds the tool list once. test/level0/index-tools.test.js imports it in place of its own hand-written list, and TestTheToolListReadsAsItsGoldenFile in src/index/tools_test.go holds the list /v1/tools generates to the same file, with -update to write it again. Both files stand in the red set of the-hook-registers-index-tools, which implements /v1/tools, so they turn green with it and the check skips them until then. The parent Discussion names the update run.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: one golden file, read by the JS case and held to the generated list by the Go case
listedTools splits its fetch into toolsBody, which the golden case shares
the list stands in the golden file alone, and the parent points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- `src/index/testdata/tools.golden.json` holds the list once. The hook's case reads it, and `TestTheToolListReadsAsItsGoldenFile` holds the generated list to it.
- Both cases stand in the red set of the parent, since `/v1/tools` answers 404 until the parent implements it. So no green run answers this ticket, and it closes onto the parent, whose tests-green turns the golden case green.
