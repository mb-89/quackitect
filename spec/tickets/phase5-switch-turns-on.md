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

The phase-5 switch opens [[spec/tickets/go-cage-switches-over]] and moves no slice key. That group holds [[spec/tickets/cage-rules-port-before-switch]], which ports the cage rules until the shadow reads clean. It moves `migration.cage` to `new` only after that. The shadow names the gap that ticket closes, so the switch waits on nothing but itself.

While the switch reads false, the group cannot start, and the port that would clean the shadow never runs.

- `./RUNME.sh config` reads `migration.phase5switch true spec/config/level0.json`
- `./RUNME.sh config` reads `migration.cage shadow spec/config/level0.json`
- `./RUNME.sh check` exits 0
