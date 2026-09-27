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
process: [[trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 14bfa647339652d1936dc6828102d64d952fdb12
    hash_after: 14bfa647339652d1936dc6828102d64d952fdb12
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:265:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: cc66aea03239d315
        size: 937
    def: df12650931d480c9
reason: done
---

# Ask

The queue reads a group trunk marks `cloud: true` as the cloud's, beside a standing branch, so the work tab and its count leave the group and its tickets to the cloud. The owner's word: "Just because they are behind a flag that is not set yet does not make them not cloud groups."

Gain: the count behind the work tab's name reads the rows this desk takes. A marked group whose branch holds no commit past trunk reads as merged, and counts on the desk.

Breaks: the desk pull hands out a cloud group's tickets, and the count reads every migration ticket as the desk's.

- a case in `test/level0/work-answer.test.js` holds a marked group on a merged branch, and its open child, at `∞`
- a case in `test/level0/work-answer.test.js` holds a marked group with no branch, and its open child, at `∞`
- a case in `src/tui/workplaces_test.go` holds the cloud letter on a merged group placed at `∞`, and on its ticket
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/work-marked.test.js src/tui/workplaces_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The code the ask names stands on main already. `placesIn` in `src/scripts/work-answer.js` reads the marker, and `PlacesIn` in `src/tui/work/workplaces.go` lights a merged group the queue places at infinity. This step adds the cases that hold it.

The two queue cases stand in `test/level0/work-marked.test.js`, because `test/level0/work-answer.test.js` stands at its line ceiling. The Go case stands in `src/tui/workplaces_test.go`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and departs in one place: the queue cases stand in a file of their own, because the named file stands at its line ceiling
- the cleanup it reveals: a merged branch carries its children in the fixture, as a branch cut from trunk does
- the marker read stands in `placesIn` alone, and the cases point at the ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The Breaks line overstates the pull: a desk pull hands no child of an open group out, because a group works on a branch. What breaks is the count and the queue listing, which read every migration ticket as the desk's.

Every open group on trunk carries the marker already, so no group waits for one. `./RUNME.sh branch list --json` reads the marked groups whose branch holds no commit past trunk as merged.
