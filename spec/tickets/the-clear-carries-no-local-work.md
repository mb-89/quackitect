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

A cloud box clears its context and keeps working, so its handover must lose nothing and must not loop. The handover's hand-back now refuses work that lives on the box alone: a commit origin lacks, or a changed file not committed. It also refuses a second handover on the tip the last one passed on. A whole context that pushed nothing then stops and says what blocks it, and stops burning tokens.

A box stopped earlier this week after two and a half hours of clears with nothing pushed. The hold also goes stale after sixty minutes now, in place of ninety.

- `./RUNME.sh test test/level0/pull-ephemeral.test.js` passes the case for unpushed work, uncommitted work and a looped handover
- `./RUNME.sh config work.staleAfter` reads `60m`
- `./RUNME.sh check` exits 0
