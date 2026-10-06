---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: boxes-write-their-final-record/gate
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
group: the-fleet-watches-itself
parent: boxes-write-their-final-record
record:
  - step: do
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 37581c90a26ba58ed59c353dc9d4b8ef97a629f1
    hash_after: 37581c90a26ba58ed59c353dc9d4b8ef97a629f1
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: d60467639e3839dc
        size: 217
    def: f1dbe938dcadec5d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the release path closes its take in held.go letGo, and release reads --final as the branch name through word(argv, 1) in branch.go, so both files change and the size list names neither; the builder adds them in place.

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

The design draft of boxes-write-their-final-record lists the files its approach touches, and it leaves out two that release reaches: src/branches/held.go, where letGo closes the take, and src/branches/branch.go, where Branch reads --final as the name through word(argv, 1). The engine owns the draft's evidence and the door refuses an edit there, so the two files stand under the parent's Discussion, where implement reads them beside the list. No code reads the size list to gate a diff, so the note carries the whole fix.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The ask says to add the files in place; the door refuses that write to an open ticket's evidence, so the change lands under Discussion, the one chapter open to any hand, and this line says why it departs.
- The cleanup this reveals: an ask naming an edit to another leaf's evidence meets the door; the retro takes that as a finding, so no second note stands here.
- The two file names stand once, on the parent's Discussion, beside the list they extend.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
