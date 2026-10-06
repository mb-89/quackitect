---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: cloud-turns-end-without-questions/gate
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
group: boxes-hold-and-hand-back
parent: cloud-turns-end-without-questions
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 032321d28bee51533b73b4885e52b3a4b4b2eee3
    hash_after: 5dd38ce8d03f955cba189b9d26ce297cfa7f613c
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 1ae5c0508934c0ec
        size: 340
    def: 4a3b325c93939cde
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft puts ends-on-a-question in ReadsText so the stop call skips it, but ReadsText gates only the reason a stop call names (src/modules/hooks/stops.go Stops.claims), and a-cloud-box-decides is a continue, never a reason; implement drops the entry and the last assertion of TestEndsOnQuestionReadsTheLastProse, or keeps both as harmless

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/pull_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The stop tests drop the ReadsText assertion, because ReadsText gates only the reason a stop call names, and a-cloud-box-decides is a continue rule. The gate had bound the question cases to spec/config/stop/level0.yml through os.ReadFile, and the import rules refuse os in a pure module. So the cases read the rules inline, with the claim in the facts as the gate found it must be. The binding to the real file moves to the implement step of cloud-turns-end-without-questions, as a test in src/quack. The change also reveals a pull fault. This ticket carries todo: true, and the pull served tagged tickets of every group ahead of the branch group. The dry probe clone then handed this ticket in place of its own leaf, and the check went red. The pull on a work branch now takes a tagged ticket of its own group or a private note alone, and a case in src/pull/pull_test.go holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and drops the assertion; the entry was never written
- the cleanup the change reveals is in the change: the import fault and the tagged pool
- the rule text stands in level0.yml once the implement lands, and taggedHere states the tagged scope once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
