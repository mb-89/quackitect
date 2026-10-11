---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quoted-fronts-round-trip/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tickets-keep-their-chapters
parent: quoted-fronts-round-trip
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: ad2d2b373bd106164f158a4fd1402d307c9cf373
    hash_after: ad2d2b373bd106164f158a4fd1402d307c9cf373
    answered:
      - name: tests
        exit: 0
        said: green, src/yaml passes; green, src/front passes
      - name: check
        exit: 0
        said: "   62.7  in all"
    inputs:
      - name: ask
        hash: e9fba0314070f6fe
        size: 460
    def: f0e563b5ce6828f8
reason: done
---

# Ask

Every reader of `yaml.Read` and `ReadLines` stands named as a caller the quote decode reaches, so a reviewer weighs each reader the change moves.

The draft named three callers, and a reader past the front that holds a quoted backslash value reads it differently with no review.

- `git grep -n "yaml.Read\|yaml.ReadLines" -- src` lists each caller, and the discussion of quoted-fronts-round-trip names them with what each now reads
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/yaml src/front

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The discussion of quoted-fronts-round-trip names every reader of `yaml.Read` and `ReadLines` in a table, with what each reads, so a reviewer weighs each reader the quote decode moves. One value in the tree changes its read: a record `why` in `spec/tickets/a-check-finds-every-writer.md`, which now reads as written. The change touches no code, so the check decides it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the callers stand once, in that discussion table, and the grep command beside it lists them again

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
