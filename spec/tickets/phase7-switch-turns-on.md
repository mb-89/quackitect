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
step: do
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: 7c93dce293512d484c0b81ee7ba9ff207a3cc03c
    hash_after: 7c93dce293512d484c0b81ee7ba9ff207a3cc03c
    answered:
      - name: tests
        exit: 0
        said: green, src/lsp passes; green, src/modules/check passes; green, src/modules/migration passes
      - name: check
        exit: 0
        said: "spec/tickets/phase7-switch-turns-on.md:66:381: Vocabulary: lsp stands outside the words this tree writes. Write a core w"
    inputs:
      - name: ask
        hash: 0b7d18f413328998
        size: 502
      - name: [[spec/tickets/check-sweep-reads-tracked]]
        hash: 1a52fbc1fa128de7
        size: 3931
      - name: [[spec/tickets/lsp-door-switches-over]]
        hash: 67bd0f62c86a8558
        size: 6048
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The phase-7 shadow reads clean now that [[spec/tickets/check-sweep-reads-tracked]] has landed. The whole-tree check writes no shadow row, and neither does an untracked note. A staged note draws the same findings on both roads. Turning `migration.phase7switch` on lets a box take [[spec/tickets/lsp-door-switches-over]].

- `./RUNME.sh config` reads `migration.phase7switch true`
- `.se/.runtime/bin/se-lsp check` over this tree adds no row to `./RUNME.sh log --kind shadow`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/lsp src/modules/check src/modules/migration

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The coordinator ran the probe twice, with the lsp slice at shadow and se-index standing. The first run was on main at 4aba6a9, before the fix. There, an untracked note carrying a dead pointer made `se-lsp check` write three shadow rows, each held by the check module alone. So the compare runs and tells the roads apart. The second run was on main at e5522a7, after the fix, with se-lsp and se-index built fresh. There, the whole-tree check wrote no row, and the same untracked note wrote none. The index's `check/sweep` named the note nowhere. Staged, the note drew the same three findings on both roads, so the new road answers and agrees. So migration.phase7switch turns true.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none
- every fact stands once: the run lives on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
