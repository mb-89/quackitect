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
    hash_before: 46a9cac92f4d083da60b6ea41db9540341b4ce41
    hash_after: 903e18fb0375288848e73ba19e79d9230eb0f9df
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/write passes
      - name: check
        exit: 0
        said: "   73.0  in all"
    inputs:
      - name: ask
        hash: 6af04e05df305880
        size: 501
    def: df12650931d480c9
reason: done
---

# Ask

The write door cleans the root and the path before it decides inside or outside. A doubled slash or a dot segment inside the tree then meets the ticket refusal.

A `Write` to the root spelled with a doubled slash reads as outside the tree and lands with no ticket. See `src/modules/hooks/write/door.go:63`, finding 11, and the last item of `tests-and-ci-hold`.

- `./RUNME.sh test src/modules/hooks/write` passes `RelativeTo` cases for a doubled slash, a dot segment and `..`
- ./RUNME.sh check passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/write

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`RelativeTo` in `src/modules/hooks/write/door.go` cleans the root and the path before it reads one under the other. A doubled slash, a dot segment and a `..` inside the tree then read as the tree's own path, and the write meets the ticket refusal. A `..` past the root reads as the outside path it lands on. The change landed in 903e18fb0.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestRelativeToReadsEitherSeparatorAndEitherDriveCase` holds a doubled slash, a dot segment, a `..` inside and a `..` past the root
- the cleanup the change reveals: none, since `relativeTo` in `src/modules/check/paths.go` reads paths the walk already resolved
- the cleaning stands once, as `cleaned` beside `RelativeTo`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
