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
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 8ed4ef096ab7e6e869dd910a12ec16c8da7eb7ac
    hash_after: db4003c9a6a482acdd3f9eaf78380deae00d5d72
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
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

    ./RUNME.sh branch test test/contract/install.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`src/scripts/install.sh` carries the want `go-modules`, between `go` and the
builds. It runs `go mod download` in every folder holding a tracked `go.mod`,
and writes the checksum of every `go.sum` to `.se/.runtime/go-modules`. The
want stands while that stamp matches, so a warm tree asks no network, and a
changed dependency fetches again. A box with no Go reads the want as met.
`SE_INSTALL_SKIP` skips it through the loop every want passes, so it needs no
line of its own. A case in `test/contract/install.test.js` holds its place in
the list and its fetch.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: a want fetches the modules, and the skip list reaches it
- the cleanup: none stands, because the want reuses the loop and the stamp folder the install holds
- one place: the stamp and the module list live in `install.sh` alone, and the ask's second line reads off `check.json`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
