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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 521a5d25b904d6fae2c77a6a2e8ea089194f9cc3
    hash_after: b8f32de5c0412c2997bfa529e92040569769a903
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/index passes
      - name: check
        exit: 0
        said: "   62.3  in all"
    inputs:
      - name: ask
        hash: 01bc9cafff4c3c61
        size: 578
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a hung writer action ends at its deadline, so the writers queued behind it run, and an expired writer holds the writer slot until its run returns.

<!-- breaks, as text: what breaks if it is never done -->
breaks: no action declares a deadline and nothing reads `watchdog.deadline-action`, so one hung writer queues every later writer until the index restarts. `Book.Expire` marks the op failed, and the next call starts a second writer beside the live one.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/index/ -run 'TestAnActionTakesTheDefaultDeadline|TestAnExpiredWriterHoldsTheSlotUntilItReturns'` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Book.Start` in `src/modules/index/ops.go` takes `watchdog.deadlineAction` where an action declares no deadline, so `Expire` ends a hung action. A writer whose run still delivers stands in `live`, and `Next` starts no writer while one does, so an expired writer holds the slot until `returned` frees it. `TestAnActionTakesTheDefaultDeadline` and `TestAnExpiredWriterHoldsTheSlotUntilItReturns` cover both. The derived and fold keys stay, since the deadline design still names them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch for the action key and the live slot
- the model design note names the default and the held slot
- the default stands in `bookSettingsOf` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
