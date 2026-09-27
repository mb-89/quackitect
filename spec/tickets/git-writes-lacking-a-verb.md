---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-landing-takes-a-verb/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-verbs-land-whole
parent: every-landing-takes-a-verb
record:
  - step: do
    hand: box d7a55188b9103 · claude-code-remote
    hash_before: fa5ccf92c86b6c3168889e845059ac6ae41db544
    hash_after: fa5ccf92c86b6c3168889e845059ac6ae41db544
    answered:
      - name: tests
        exit: 0
        said: green, 39 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

approach item 7 names a verb for each git write, and `stash`, `rebase`, `reset`, `tag` and `cherry-pick` have none. Name what the refusal says for each.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The discussion of [[spec/tickets/every-landing-takes-a-verb]] names the road the refusal gives for each git write no verb stands for. The engine owns the approach, so the table stands under the discussion. `GIT_WRITES` in `.claude/skills/level0/lib/git-writes.js` holds the refusal's words, and a case in `test/level0/bash.test.js` proves each road.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change departs in place alone: the engine owns the approach, so the roads stand in the parent's discussion
- the cleanup: none stands, because the table and its case already land on the branch
- the refusal's words stand in the table alone, and the discussion names each road without its wording

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
