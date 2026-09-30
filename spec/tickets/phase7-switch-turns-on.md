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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The phase-7 shadow reads clean now that [[spec/tickets/check-sweep-reads-tracked]] has landed. The whole-tree check writes no shadow row, and neither does an untracked note. A staged note draws the same findings on both roads. Turning `migration.phase7switch` on lets a box take [[spec/tickets/lsp-door-switches-over]].

- `./RUNME.sh config` reads `migration.phase7switch true`
- `.se/.runtime/bin/se-lsp check` over this tree adds no row to `./RUNME.sh log --kind shadow`
- `./RUNME.sh check` exits 0
