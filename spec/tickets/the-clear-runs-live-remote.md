---
kind: [[ticket]]
state: draft
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
group: the-clear-continues-the-session
---

# Ask

A cloud session proves the clear live: past a low `context.handoverAt` it writes the handover, clears, and keeps working on the resume prompt. The fakes in [[spec/tickets/the-clear-continues-the-session]] meet no remote client, and a remote client may refuse a clear a plugin asks for.

Without the trial, a box past the key may still stand idle, and nobody reads why.

- the session log of this box carries the clear's rows, or the warn row naming the refusal. `grep -E 'handover|clear' .se/.log/session.jsonl` decides it
- the next conversation opens on the resume prompt, and `read-handover` closes. `./RUNME.sh ticket pull` decides it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
