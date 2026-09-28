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
group: boxes-keep-their-own-tickets
step: do
record:
  - step: do
    hand: box d81cb7b9efd7 · claude-code-remote
    hash_before: 075e9a38fec57caaa15effca4b23778f4709446e
    hash_after: cc590505dc10ecd3aa3343ec97172ceca0148147
    answered:
      - name: tests
        exit: 0
        said: green, 47 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f865a9929b12a996
        size: 737
    def: df12650931d480c9
reason: done
---

# Ask

A ticket waiting on a person stays a ticket in the tree, and the dispatch hands it to a box like any open work. The owner answers inside the ticket system, per the owner's ruling: "We have a ticket system for that."

Without it the dispatch opens a GitHub issue a question, the answer lands outside the tree, and no box picks the ticket up.

- `./RUNME.sh test test/level0/dispatch-fire.test.js` passes, with a case holding that the fire sends no request to the issues API
- `./RUNME.sh test test/level0/dispatch.test.js` passes, with a case bundling a loose ticket at a question step into a fix group, and a case leaving a person-only ticket loose
- `.github/workflows/dispatch.yml` grants no `issues: write`
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js test/level0/dispatch-fire.test.js test/contract/dispatch-workflow.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The dispatch opens no GitHub issue. `issues` and its label leave `src/scripts/dispatch-fire.js`, and `.github/workflows/dispatch.yml` drops `issues: write` and the `GITHUB_TOKEN` the issue road read. A loose ticket waiting on a question now bundles into a fix group like other open work, and that box answers it. The plan's part for a person lists the open tickets on `spec/processes/person` alone, and the dispatch hands those to no box. A draft whose ask no agent opens stays out of the bundle as before. The fix group's ask says the same rule `branch done` holds.

What I weighed: the owner's ruling "We have a ticket system for that" leaves the ticket as the one place a question stands. The person route marks work only a person can do, so the dispatch reads the route and needs no field of its own.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, or the discussion says why it departs: the workflow case stands in the workflow's contract file, beside its other cases
- the cleanup the change reveals is in the change: the `GITHUB_TOKEN` the issue road alone read leaves the workflow
- every fact the change adds stands in one place: the person route owns the mark, and the dispatch reads it through `onPersonRoute`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
