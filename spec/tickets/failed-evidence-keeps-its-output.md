---
kind: [[ticket]]
state: draft
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/standard]]
group: the-engine-fixes-its-faults
---

# Ask

A hand-back runs each evidence command, and shows only the last line of a failing one. A Go case that fails now and then then leaves `FAIL` and no name. Two runs met it:

- the check answered 1 inside the hand-back of `door-and-lease-commit-callers`, and passed on the retry
- `TestWaitWithNoHandleWaitsOnTheSessionsOpenOperations` failed once inside a check, and passed alone every time after

The hand-back keeps the whole output of a failing evidence command in a file under `.se`. Its refusal names that file and the failing cases.

The next miss then names its case, and a hand fixes the case in place of retrying.

Without it, a case failing at random stays unnamed, and each hand pays a retry.

- a case fails an evidence command, and the refusal names the failing Go case and the output file
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
