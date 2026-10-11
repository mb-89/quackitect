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
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box af15433560d6 · claude-code-remote
    hash_before: 27f00f5f2e839a09bd858973ddd6de25c8cf3dc5
    hash_after: 987895a6e1aeffdbda7274c815bbb8c0307ca689
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "   64.9  in all"
    inputs:
      - name: ask
        hash: 9185359c4bb9db6e
        size: 719
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Origin holds `work/*` branches standing no commit ahead of main: merged, and never deleted. The tree's own close verb deletes each one, and leaves every branch carrying an unmerged commit and every branch a running box holds under `beats/*`.

The gain is a branch list that names live work alone, so a fleet reader and the dispatcher read no dead group.

Without it the merged branches pile up, and every tips read and every listing pays for them.

- `git ls-remote origin 'refs/heads/work/*'` names no branch that stands no commit ahead of main, outside this group's own
- no branch with an unmerged commit and no branch a `beats/*` ref holds leaves origin
- the group's Discussion lists every branch the close deleted

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/branches

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The close deletes no branch. Main's history restarts at a rewrite, so every old group branch on origin counts thousands of commits ahead of main with no merge base, three branches carry their own opening marker, and the rest are live groups. ./RUNME.sh branch close deletes a branch git counts merged into main and runs on main, where it drops a marker and pushes main, so it finds none, and the order forbids both a push of main and the delete of a branch carrying unmerged commits. Every old group but one stands closed done on main, so its work landed before the rewrite. The person ticket old-groups-leave-origin carries the one delete command and each tip for a restore, so the owner makes the call. The group's Discussion tables every branch.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from the ask: no branch closes, for the reason the says field gives, and a person ticket carries the delete
- the cleanup the change reveals is a ticket of its own: old-groups-leave-origin
- every fact the change adds stands in one place: the census in the group's Discussion, the tips on the person ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
