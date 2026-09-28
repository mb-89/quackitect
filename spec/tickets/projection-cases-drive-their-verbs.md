---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/standard]]
group: the-foundation-closes-its-gaps
step: do
---

# Ask

`projections-read-the-mirror` closed with three gate points open. Each case below decides the claim its name makes:

- the dump case drives `quack dump`, and reads what it writes, where it now reads `dumpPath` alone
- the round trip reads each projection's own file back, where it now passes once any projection reads a file
- the plan and hold files meet a fixture the case seeds, where a CI box now carries no such file

The mirror's cases then fail where the mirror breaks, on any box.

Without it, a broken dump or a projection reading the wrong file passes the check.

- a case drives `quack dump` and reads the file it writes
- a case breaks one projection's file, and reads the round trip fail on it
- `./RUNME.sh check` exits 0 on a box with no plan or hold file

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
