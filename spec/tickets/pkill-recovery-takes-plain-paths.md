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
    hash_before: b39aa69275ac3ba73ca525cf13cf4e5d629eca98
    hash_after: b39aa69275ac3ba73ca525cf13cf4e5d629eca98
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   77.5  in all"
    inputs:
      - name: ask
        hash: 758a2011b7e4e3fa
        size: 479
    def: df12650931d480c9
reason: done
---

# Ask

The recovery while the index is down lets `pkill -f` through on a plain path under the runtime folder alone. The road then stops the stale index alone.

A `pkill -f` pattern holding a regex `|` beside the runtime folder reads as a recovery. It kills every process the user owns: `src/modules/hooks/guard.go:175`, finding 13.

- `./RUNME.sh test src/modules/hooks` passes `Recovers` cases refusing a pattern with `|` or `.*`, and passing the plain path
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/guard_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A `pkill -f` recovers while the index is down only where its pattern holds path characters alone, letters, digits, `_`, `.`, `/` and `-`, beside the runtime folder. A quoted `|`, `.*` or any other regex mark then widens no match past the stale index. The plain-path pattern stands as `plainPath` in `src/modules/hooks/guard.go`. The code landed in d521550e7.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestRecovers` refuses four patterns holding `|` or `.*`, and passes the two plain paths it held
- the cleanup the change reveals: none, since the refusal text already names a path under the runtime folder
- the plain path stands once, as `plainPath` beside `killSignal` in `guard.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
