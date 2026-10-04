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
step: do
record:
  - step: do
    hand: box f67c07972052 · claude-code-remote
    hash_before: b94c3cf67eb846e39b2716addcdfbf55fd9c5f59
    hash_after: b94c3cf67eb846e39b2716addcdfbf55fd9c5f59
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   65.8  in all"
    inputs:
      - name: ask
        hash: 2f27903492d3e8aa
        size: 574
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The level zero dry probe starts once the tests end, so every check pays the tests' span and then the probe's. The probe starts together with the tests where five checks in a row and CI on Linux and Windows read no flake. Otherwise it stays after the tests, and the measure stands under Discussion.

- gain: a check pays the slower of the tests and the probe, not their sum
- breaks: every check pays the tests' span on top of the probe's
- done_when: `./RUNME.sh test test/level0/battery.test.js` passes
- done_when: `./RUNME.sh check` exits 0 five times in a row on one box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/battery.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The battery started the level zero dry probe once the tests ended, so a check paid the tests' span and then the probe's. Now the probe starts first and runs beside every part, the tests among them, and the battery waits for it before it stamps. Five checks in a row on one box read green, so the overlap flakes no contract case there. This change also drops the leftover draft [[spec/tickets/the-check-takes-a-minute]] left, since no work stood behind it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the probe starts with the tests, and five checks in a row read green
- the cleanup it reveals: the leftover draft goes in the same change
- every fact stands once: the order stands in `partsOf`, and its test pins level zero first

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The measure, on a cloud box with four cores, in seconds off `.se/.runtime/check.json`. Before is one steady run on origin/main. After is five runs in a row, and the first rebuilt the Go test cache.

| run | level0 | tests | go | rules | the battery's span | exit |
|---|---|---|---|---|---|---|
| before | 32.0 | 22.9 | 5.1 | 6.2 | 54.9 | 0 |
| after, 1 | 67.3 | 31.8 | 34.2 | 6.3 | 73.4 | 0 |
| after, 2 | 43.8 | 28.6 | 11.9 | 6.6 | 49.1 | 0 |
| after, 3 | 47.7 | 29.2 | 10.9 | 6.7 | 49.3 | 0 |
| after, 4 | 45.7 | 25.7 | 9.8 | 7.7 | 45.7 | 0 |
| after, 5 | 44.4 | 29.2 | 11.1 | 6.0 | 49.2 | 0 |

The overlap slows each part, since the probe's install builds Go while the tests run. The battery's span still drops, because it pays the slower road and not the sum. The probe now stands on the critical path.

The call I took, with nobody to ask: the overlap stays only while CI on Linux and Windows reads green too. A red there from the overlap puts the probe back after the tests, and this table stays as the measure.

The work on the check's span stops here, since a steady check now stands under a minute on this box. The battery's span reads as the dry probe beside the tests, then the go and rules parts.

What stands, and why each road waits:

| cost | why it waits |
|---|---|
| the dry probe, on the critical path | it is the one contract test of the start road: it clones, installs, starts a cold index and runs three verbs, and each is the door it proves |
| the go part after a Go change | `go test` caches a package while its inputs stand, so it costs that span on the run after a Go change alone |
| the first check after a binary rebuild | the live index restarts on the new binary while the tests run, and no check change shortens the box's own rebuild |
