---
kind: [[ticket]]
state: draft
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
---

# Ask

The phase 9 shadow names three faults on main:

- the person-trial tickets place in another order on the new path
- the two paths read the clock minute one apart
- a second index start hangs its standing verb and places every module process twice

The gain is a shadow that writes a row only where the two paths disagree in substance, so migration.phase9switch can turn on. Left undone, the switch stays off, and a box running the index hangs.

- `./RUNME.sh log --kind shadow` adds no processes row over a ten-minute index run with activity
- `.se/.runtime/bin/se-index standing` answers at once with the index already running
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

go test ./src/modules/clock ./src/index -run 'Minute|Serve|Displaced|Drops|Reaches|Door' && go test ./src/quack -run Shadow

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Each value mismatch is timing. The index and the IO process each run their own clock and git poller, on their own phase, and the shadow weighed a value once, two seconds after the IO process committed it.

| finding | cause | change |
|---|---|---|
| `clock/minute` one apart | each clock ticked a minute from its own start, so one path held the old minute up to a minute longer | `src/modules/clock/clock.go` reads the time each second and commits as the minute turns |
| `queue/places` order | one path read a moved `git/stood` before the other. The old order is the all-zero score of a shallow clone, the new one the day score | `src/quack/io.go`: the shadow weighs a value apart again each settle, and writes a row only once it stays apart past `shadowPatience` |
| doubled placement | a second `serve` stood a door beside the live one, and the first door kept its modules after its standing file went | `src/index/main.go`: a serve beside a live door stands none, a door drops only its own standing file, and a door the file no longer names leaves |

The standing hang did not reproduce on this box. It follows from the doubled index, which the guards close. The places order reproduced on a checkout and on a clone that took its whole history, and came together within one git poll.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: a timing mismatch gets a tolerant compare, and the doubled placement a guard, each with its test
- the cleanup it reveals: the stop path removed whichever standing file stood, and now drops its own alone
- every fact stands once: the spans live in the constants of `src/quack/io.go`, `src/modules/clock/clock.go` and `src/index/main.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
