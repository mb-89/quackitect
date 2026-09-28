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

The q contract suite in `src/q/qtest/suite.go` runs on the fake, and on a real side in `src/index/contract_test.go` built through `qtest.Over`. That side spawns each run in place, as the fake does. The door spawns each run with `go run()` in `src/index/door.go`, so no suite case meets the door's own scheduler.

The real side of the suite starts the door, and drives each case through the store and scheduler the door builds.

A fault in the door's async scheduling then fails a suite case, as the model's contract rule asks.

Without it, the fake and the door can part on ordering, and the suite stays green.

- the real side of the suite starts the door, which `src/index/contract_test.go` shows
- `go test -race ./src/index/` passes
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
