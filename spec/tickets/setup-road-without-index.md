---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: box-verbs-port-to-go/gate
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
group: box-verbs-run-in-go
parent: box-verbs-port-to-go
record:
  - step: do
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: 61e37ca470e4b638e88e02474a90ac0de4f633bc
    hash_after: 61e37ca470e4b638e88e02474a90ac0de4f633bc
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   63.6  in all"
    inputs:
      - name: ask
        hash: f447f528301b30de
        size: 222
    def: 89146b8ec86d255d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

RUNME.sh's no-index road drops the setup call, so a box with no index runs no setup at all, against spec/tickets/setup-runs-without-an-index; implement says how that road sets up or names the index build as its first step.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/install.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The setup runs in the index, and the install brings go as one of its wants, so a box with no index is one where that build failed. RUNME.sh then names the build as the step to take, in one line, and runs the verb, and starts no node setup. install.sh says the same where it finds no index. The install test reads the new line and asserts RUNME.sh names no setup program.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask offers naming the index build as the first step, and the road takes that offer
- no cleanup stands past the message in install.sh, which changes with it
- the line stands once in each script, which a shell script cannot share

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
