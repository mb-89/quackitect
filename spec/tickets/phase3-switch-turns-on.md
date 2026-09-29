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

The phase-3 shadow ran against this tree, and the config, log and check topics and the prose checks read the same on the old path and the new, so `./RUNME.sh log --kind shadow` names no mismatch. Turning `migration.phase3switch` on lets a box take [[spec/tickets/read-topics-switch-over]], and the groups that wait on phase 3.

While the switch reads false, `branch take` passes those groups over.

- `./RUNME.sh config` reads `migration.phase3switch true spec/config/level0.json`
- `./RUNME.sh log --kind shadow` names no mismatch of the read topics after a run of config, log and check
- `./RUNME.sh check` exits 0
