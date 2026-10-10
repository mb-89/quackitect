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
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 2e51d1369338654f7d01544c70dbf52663e2e25d
    hash_after: 2e51d1369338654f7d01544c70dbf52663e2e25d
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   80.1  in all"
    inputs:
      - name: ask
        hash: abac3ea4644882fc
        size: 376
    def: df12650931d480c9
reason: done
---

# Ask

One predicate decides which posts carry a fill, so the gate holds one shape in `Hook` and in `filledOf`.

`fills()` and `filledOf()` own one fact and already differ on `Stop`. The next edit to one changes the filter unseen: `src/modules/hooks/stops.go:408`, finding 14.

- `./RUNME.sh test src/modules/hooks` passes, with `filledOf` calling `fills`
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`fills` is the one predicate over which posts carry a fill, and `filledOf` calls it. The two read the main agent's call and its Stop alone. A helper's Stop now carries no fill in `Hook` either, which matches what `filledOf` already answered, so the door's behavior stands. The `filled` map goes, since `fills` holds its fact. The code landed in d521550e7.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `filledOf` calls `fills`, and `TestTheDoorReadsTheFillOnTheMainAgentsCallsAlone` holds both to the same rows, a main and a helper Stop among them
- the cleanup the change reveals: the `filled` map in `src/modules/hooks/stops.go` goes with the second shape
- the gate stands once, as `fills` in `src/modules/hooks/hooks.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
