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
    hash_before: 821af3d821df70e46162463fd5cfedfe4bfce57b
    hash_after: 1697ac70e45a2c786a7f32177f170cbb7ddd0781
    answered:
      - name: tests
        exit: 0
        said: green, 65 test(s) pass in 6 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-notes-say-boxes-decide.md:34:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: b7ce13081a1737c1
        size: 923
    def: df12650931d480c9
reason: done
---

# Ask

A ticket a box mints on its branch, a question, a finding or a fix, joins the group the box works, and the group reaches done once every child closes. Only work a person alone can do, a trial on the owner's machine, a secret, a setting on GitHub or claude.ai, leaves the group loose on main. That is the owner's ruling: "If a box opens a ticket that it can solve itself, it assigns it to its own group. And then it can't finish until it fixed all its items."

Without it `branch done` files every open child loose on main, and a box hands its own agent work back to the queue unfinished.

- `./RUNME.sh test test/level0/unblock.test.js` passes, with a case where the mint on a work branch names the branch's group
- `./RUNME.sh test test/level0/work-done.test.js` passes, with a case where `branch done` refuses while an agent child stands open, and a case where a person-only child leaves loose
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-done.test.js test/level0/work-fix.test.js test/level0/unblock.test.js test/level0/ticket-fill.test.js test/level0/cloud-ask.test.js test/contract/process.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A group reaches done once every ticket a box can close stands closed. `leftRefuses` in `src/scripts/work-fix.js` makes `branch done` refuse while a child, or a ticket the branch adds with no group, stands open off the person route. It names the pull of each. The new route `spec/processes/person` carries work a person alone can do, and `filesUp` hands it loose on main, past any parent. The mint on a `work/` branch names the branch's group through `joinsGroup`, so a box's own question, finding or fix stays in its group. `branch unblock` takes a successor on the person route alone, and the cloud ask door names that route.

What I weighed: the owner's words name the person route's cases, a trial on the owner's machine, a secret, a setting. A route of its own marks them where the frontmatter already names a route, so no new field is needed. A child group still files into its parent, because it is no agent ticket. `GroupAsksNobody` stands as it is, because a person-route ticket minted on a branch names no group.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, or the discussion says why it departs: the tests stand in `work-done`, `work-fix`, `unblock` and `ticket-fill`, not the file names the ask guessed
- the cleanup the change reveals is in the change: the cloud ask door and the question route's header name the person route
- every fact the change adds stands in one place: [[spec/design_output/work#a-box-leaves]] owns the rule, and the code points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
