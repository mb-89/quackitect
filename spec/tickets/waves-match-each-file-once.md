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
group: waves-match-each-file-once
step: do
record:
  - step: do
    hand: box 819347f31bce · claude-code-remote
    hash_before: ae900f21db9e1f992225b62b187a76528bbe1e8b
    hash_after: ae900f21db9e1f992225b62b187a76528bbe1e8b
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes
      - name: check
        exit: 0
        said: "    2.7  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: b21a9d7cae4d3101
        size: 801
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A wave in `src/q/scheduler.go` asks a loaded family for its concrete names once for every name the wave carries, and each ask walks every name. A wave over the whole tree pays the square of its files a family, under the scheduler's lock, and every post and read waits on it. This ticket asks each family once a wave, which reads the same names in the same order.

- gain: a fresh index answers its first posts and pulls in a fraction of the time, on every box and in the dry probe
- breaks: each file the tree adds makes the first wave slower by a share of every file, and a post waits out the lock
- done_when: `go test ./src/q` passes, and a case settles every key of two families after one commit moves many files
- done_when: the dry probe past its install reads shorter than main reads on one box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/q/scheduler_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A wave asks each loaded family for its concrete names once, where it asked once for every name the wave carries. The second ask answered names the wave had seen, so the order stands as it stood, and a wave over the whole tree stops paying the square of its files under the lock.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the guard stands in waves, and the dry probe past its install reads 25.8s against 42.5s
- the cleanup: the probe also reruns the install on each RUNME call in its clone, and that is the next ticket
- one place: the guard sits beside the call it guards, and the ticket holds the measure

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The measure, on a cloud box with four cores, wall seconds. The dry probe ran through a timing wrapper over the same commit, with and without the change:

| span | before | after |
|---|---|---|
| the second `prompt.submit` post | 5.2 | under 0.4 |
| `RUNME.sh mint ticket` in the clone | 10.6 | 4.2 |
| `RUNME.sh ticket pull` in the clone | 8.5 | 7.5 |
| `RUNME.sh ticket pull handover --pass` | 4.2 | 2.2 |
| the dry probe past its install | 42.5 | 25.8 |
| the new case, the guard on and off | 0.63 | 0.42 |

The calls I took, with nobody to ask:

- A helper found the cause: a goroutine dump showed a post waiting on the scheduler's lock while `waves` ran `concreteOf` once a name.
- The change is exact. The second ask of a family in one wave answers names the wave has seen, so skipping it leaves the order as it stood. The new case passes with the guard off as well, so it holds the answers, and the measure holds the cost.
- The lock stays where it stands, because the work under it is now linear in the files.
