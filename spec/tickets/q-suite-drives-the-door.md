---
kind: [[ticket]]
state: closed
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
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: ed27b3c717dc6f5e6e73fb25140dd314538d6821
    hash_after: c56a90e07fa56ac5bef2bc4a5eb39f72918f4e16
    def: 56deac2301e48d9e
reason: done
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

src/q/qtest/qtest.go gains Beside: a harness over a store another hand builds and schedules, which waits out its waves through the settle it takes after each seed, land and run, and guards its commit list with a lock. Over now builds on Beside with the in-place spawn, and qtest_test.go runs the suite beside a spawning scheduler. src/index/contract_test.go opens the door through opens, and hands Beside the door store and its scheduler Settle, so each suite case runs through the go run spawn. A probe handing Beside a settle that waits for nothing fails the commits case on each run, so the suite now meets the door scheduling. Surprise: the store calls its heard hands before its move hands, and the scheduler starts a wave off a move, so the harness records a seed before its wave whatever order the hooks register in. The door prints a closed-database line at stop in this case and in older door cases alike.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
