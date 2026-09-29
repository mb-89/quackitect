---
kind: [[ticket]]
state: open
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
group: loose-fixes-a906d84
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The verbs slice shadows `ticket yours`, and the coordinator saw it answer apart from cli.js: the new path answered ten rows where the old one answered five. Gain: the shadow log stays empty for the verbs, so the coordinator can turn `migration.phase4switch` on. Breaks: the switch stays off while a verb answers apart from cli.js.

- the four shadowed verbs write no row to `./RUNME.sh log --kind shadow` after the run starts
- this ticket names the cause of the split and what a fix needs
- `./RUNME.sh test src/quack` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

No code changes. The split does not reproduce on this tree, and the cause stands below.

- I drove ticket yours, ticket yours --next, retro notes and branch list --queue. The shadow log holds no row stamped after the run began.
- The old path reads the remote branches under `work/`. A standing branch draws one row of its own, and that row carries no state.
- A trunk ticket naming that branch's group rides the branch, so the old path draws no row for it. The five drafts of the-engine-fixes-its-faults were such tickets.
- The new path reads tickets, places and the cloud marker. It reads no git, so it cannot know a branch stands.
- On the coordinator's run a work branch stood for the closed group. That branch no longer stands on origin, so both paths draw the same rows.
- The old rule stands until the switch, so the old side is the right one.
- I weighed two fixes. Dropping the drafts from the tickets alone breaks agreement today. Feeding standing branches into the index as a port is right, and it is a design change.
- I took the second and minted the follow-up ticket the-index-reads-standing-branches. This ticket claims no fix.
- I wrote no test that fails first. The fault needs a standing remote branch, and the git write door refuses a scratch remote.
- Assumption: the prose shadow rows stand outside the verbs slice.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the fix needs a branch input, so the follow-up ticket carries it
- the cleanup it reveals is a note of its own: the follow-up ticket
- every fact stands in one place: the cause stands here, and the follow-up ticket points at this one

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
