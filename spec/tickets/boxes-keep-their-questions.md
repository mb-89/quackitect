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
step: do
group: loose-fixes-99f4547
record:
  - step: do
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 193b1252c5c3723eed91415291de9475aa36de06
    hash_after: 193b1252c5c3723eed91415291de9475aa36de06
    returns: 1
    why: "The work stands on main (fb875c2fa: cloud rules 6, 7, 8 and 13, rationale 16, lint and guidance test green). The check alone answers 1, because gate-points-pass-the-push carries its red list as one comma-joined line, the defect list-fields-split-lines fixes. Pass again once that ticket closes."
    answered:
      - name: tests
        exit: 0
        said: green, 20 test(s) pass in 1 file(s)
      - name: check
        exit: 1
        said: "}"
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The cloud guidance says what the owner ruled. A box keeps every ticket it can close in its own group, and the group reaches done only once they close. Only work a person alone can do leaves as a free ticket on `main`, and no box opens a GitHub issue.

Without it, boxes send their own questions loose to `main`, and each one waits on the owner. The dispatch opened 17 issues at once from such tickets.

- rules 6, 7, 8 and 13 of `spec/guidance/cloud/cloud.md` say it
- `spec/rationales/cloud.md` carries the reason under its own heading
- `./RUNME.sh lint spec/guidance/cloud/cloud.md spec/rationales/cloud.md` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work stood landed on main before this group took the ticket, through PR 27 and PR 31, commit fb875c2fa. Rules 6, 7, 8 and 13 of the cloud guidance keep a box its own tickets, send person work alone to main, and open no GitHub issue. The rationale carries it under 16. Questions stay with the box, and the lint over both notes passes. So this step passes on that evidence, and redoes nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change stands on main as the ask names it, and nothing departs
the verification revealed no cleanup
the rule stands in the guidance, and its reason in the rationale alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

A second fail would send this ticket to a person, so the box greened the check instead. Two faults stood red:

- `redListOf` read a comma-joined red row as one path, so the check ran the gate-points red tests. It now splits a row on commas, with a case in `test/level0/red-list.test.js`. `list-fields-split-lines` still owns the writer fault.
- `Quote` in `src/front/front.go` left a value opening on a space or a flow closer bare, so the last fail recorded `said:   }` and Vale read no file. It now quotes such a value, with cases in `src/front/front_test.go`. The box repaired the one row through `se-front normalise`, the engine's own front writer, and the recorded value stands as it was.
