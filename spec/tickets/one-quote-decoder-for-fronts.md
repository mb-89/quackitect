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
    hash_before: 8596d01dc247103badd29a09c41e547565c47872
    hash_after: 8596d01dc247103badd29a09c41e547565c47872
    answered:
      - name: tests
        exit: 0
        said: green, src/yaml passes; green, src/front passes
      - name: check
        exit: 0
        said: "   61.4  in all"
    inputs:
      - name: ask
        hash: 27ddbd8ec37ea7d6
        size: 379
    def: f0e563b5ce6828f8
reason: done
---

# Ask

The front writer and the yaml reader decode a quoted value through one function, so a fix to the escapes reaches both.

Two decoders of the same four escapes drift apart, and a value one decodes and the other refuses reads back changed.

- go test ./src/yaml ./src/front passes, with `yaml.Unescaped` the one decoder and `src/front/mint.go` calling it
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

The decoder of the four escapes the front writer writes moves from `src/front/mint.go` into `src/yaml/yaml.go` as `Unescaped`. The yaml reader and the front mint both call it, so a fix to the escapes reaches both, and the reader decodes no escape the writer refuses. `TestASetValueReadsBackAsWritten` runs each value through `Set` and `Normalise`, and reads it back as written. The change landed in c2e40442f with quoted-fronts-round-trip.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the decoder stands once, in `yaml.Unescaped`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
