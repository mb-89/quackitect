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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The install fetches the Go modules once, beside the other wants. So the first check on a fresh box runs its Go part in seconds, and the stamp's parts read the same on every run.

<!-- breaks, as text: what breaks if it is never done -->
The Go part of the first check on a fresh box downloads its modules, and that download takes most of the check. A retro reading that stamp reads a fetch as a grown part.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/scripts/install.sh` names a want that downloads the modules of every Go module in the tree, and `SE_INSTALL_SKIP` skips it
- the first `./RUNME.sh check` after the install fetches nothing, which the `go` part of `.se/.runtime/check.json` shows

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
