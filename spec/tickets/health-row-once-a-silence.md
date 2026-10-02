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
group: module-processes-land-in-shadow
step: do
record:
  - step: do
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: a64f2d0c744f9ae1c794700dc093c88352cbf31a
    hash_after: 3b81be9ffd129ff9ba905baa64e3837d2b46e4f9
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/module-processes-land-in-shadow.md:194:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 1b17dfd20f594dfa
        size: 436
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A guarded hook call writes a `processes` shadow row on each call while the index's lease stands past its term. Write one row a silence, as the IO process's watch does.

The gain: the session log names each silence of the index once.

What breaks: a hung index fills the session log with one row a tool call.

- `go test ./src/modules/hooks/` passes, with a case reading one row over two calls in one silence
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/cage_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hooks door keeps the end of the index lease its last shadow row names. A guarded call in the same silence writes no second row, and a later silence with a new end writes its own. A case reads one row over two calls in one silence.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one row a silence, as the IO process's watch writes
- the cleanup the change reveals is in the change, and nothing else stands open
- every fact the change adds stands in one place: the door's downSince field alone holds the told end

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
