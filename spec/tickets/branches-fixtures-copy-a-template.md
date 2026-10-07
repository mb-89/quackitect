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
group: dead-tests-and-code-leave
cloud: true
step: do
record:
  - step: do
    hand: box d2c15bcb53d2 · claude-code-remote
    hash_before: 9622c9d0f336cac60c349434d93cb3feef3e23db
    hash_after: 41d66878bc48b5bd89d307204c06b1a3ab2c48b3
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  119.5  in all"
    inputs:
      - name: ask
        hash: 765edff68d3e4a0f
        size: 552
    def: df12650931d480c9
reason: done
---

# Ask

The branches tests build their git fixture once a package, in TestMain, and copy it a test. The package then spawns no fresh origin and clone a test.

The branches package keeps paying a git init, a commit and a clone for every test, and the check stays slow for it.

- a TestMain in each branches test package builds the git template once
- each test copies the template in place of a fresh origin and clone
- `go test` over the branches packages passes, faster than before
- the ticket carries the timing before and after
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/branches

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A TestMain in src/branches builds a bare origin and a configured clone once a run. newTree copies both with os.CopyFS and writes the remote into the clone's config, so a tree spends three git processes in place of twelve. src/branches is the one branches test package. The package's wall time moves from 24.8, 29.2 and 28.1 s before to 27.4, 26.5 and 27.6 s after, on four cores. Each test runs more git after newTree than inside it, so the gain stays inside the noise. The first commit stays a test's own, since each test commits its own files.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the timing shows the template saves setup alone
- the cleanup it reveals: the env list of the sh helper now stands once as gitEnv, shared with the template build
- the template steps stand once, in buildTemplate, and newTree points at them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
