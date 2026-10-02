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
    hand: box 290b6d3e66c7 · claude-code-remote · session
    hash_before: 609feaacebaf1e572ceb34ca9cba45187cf54131
    hash_after: 609feaacebaf1e572ceb34ca9cba45187cf54131
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/clock passes; green, src/index passes; green, src/q passes; green, src/quack passes
      - name: check
        exit: 0
        said: The rules pass.
    inputs:
      - name: ask
        hash: 36ed1c35ade71afa
        size: 656
    def: df12650931d480c9
reason: done
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

./RUNME.sh test src/modules/clock src/index src/q src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Two of the mismatches are timing, and one is a real disagreement on the new path. The index and the IO process each run their own clock and git poller. The shadow weighed a value once, two seconds after the IO process committed it.

| finding | cause | change |
|---|---|---|
| `clock/minute` one apart | each clock ticked a minute from its own start, so one path held the old minute up to a minute longer | `src/modules/clock/clock.go` reads the time each second and commits as the minute turns |
| `queue/places` order | one path read a moved `git/stood` before the other. The old order is the all-zero score of a shallow clone, the new one the day score | `src/quack/io.go`: the shadow weighs a value apart again each settle, and writes a row only once it stays apart past `shadowPatience` |
| `queue/places` and `work/*` stay apart | every module process loads the whole wiring. Its scheduler computed names other instances own off defaults, such as places with no stood and no plan | `src/q/scheduler.go`: `Only` keeps a module process's waves to its own instances, and `src/quack/placements.go` calls it |
| `files/<path>` apart | each path stamps `changed` with the change time it read, and a write landing twice with one text moves the stamp alone | `src/quack/io.go`: a file value with the same hash and text reads as the same |
| doubled placement | a second `serve` stood a door beside the live one, and the first door kept its modules after its standing file went | `src/index/main.go`: a serve beside a live door stands none, a door drops only its own standing file, and a door the file no longer names leaves |

The standing hang did not reproduce on this box. It follows from the doubled index, which the guards close. The places order reproduced on a checkout and on a clone that took its whole history, and came together within one git poll.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a timing mismatch gets a tolerant compare, a real one a fix, each a test
- the cleanup it reveals: the stop path removed whichever standing file stood, and now drops its own alone
- every fact stands once: the spans live in the constants of `src/quack/io.go`, `src/modules/clock/clock.go` and `src/index/main.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The ten-minute run found two causes beside the three the ask names. A module process computed names other instances own, off defaults. A file value differed in its `changed` stamp alone.
- The box pushed nothing before the pass: the commit verb pushes `main` alone from here, and the gate refuses it. A verb that pushes the work branch before the pass closes that gap.
