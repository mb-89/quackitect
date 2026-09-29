---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: pull-verbs-become-actions/gate
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
parent: pull-verbs-become-actions
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 655c4cd44caa059cd8063fa878975c9cc778e6d1
    hash_after: 655c4cd44caa059cd8063fa878975c9cc778e6d1
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/work-verbs-become-actions.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 483f2abcfa1b1d72
        size: 276
    def: 894320b5dd55a1cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the branch open done_when line rests on a fake registry, since src/modules/verbs/branch.go registers no action while work-verbs-become-actions stands at gate; depends_on names ticket-verbs-become-actions alone, so the live index answers branch/open only once that ticket lands

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/branch-needs.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The branch open line of the pull ticket rested on a fake registry alone. The wiring case red under work-verbs-become-actions now asks the live index for branch/open beside branch/take. A line under the pull ticket names that case, and says its implement step goes after the branch topic lands. depends_on stays as it stands, since the engine owns the front matter.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from a depends_on edit, which the door refuses, and the Discussion line says so and names the order
- the live half of the line now stands in the wiring case the branch topic turns green
- the order stands once, under the pull ticket, and the case owns the check

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
