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

A change to a ticket's draft after `implement/change` passes marks `tests-red` and the gate stale, and the replay asks the red cases to fail over code that already passes them. Two roads reach it:

- an edit to a design note the ask names, inside the implement leaf
- the rename verb rewriting a moved path inside the draft's lists

A replayed red leaf passes on green where a later leaf of the same route already turned its cases green, so the route walks on.

Without it, the replay takes the code back out to make the cases red, and implement puts it back.

- a case edits a draft past `implement/change`, and reads the replayed `tests-red` pass on green
- a case renames a path a draft names, and reads the route walk on
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
