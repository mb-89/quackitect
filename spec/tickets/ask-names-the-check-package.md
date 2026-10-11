---
kind: [[ticket]]
state: closed
point: gate
todo: false
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: route-keeps-its-chapters/gate
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
process_hash: 2a00b62f7c4bc60b
group: tickets-keep-their-chapters
parent: route-keeps-its-chapters
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: d550ced96948b79bf15530f10a960c5cd261023f
    hash_after: d550ced96948b79bf15530f10a960c5cd261023f
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   70.4  in all"
    inputs:
      - name: ask
        hash: d909a0d3fa5195ad
        size: 347
    def: f3c9a8656d586f83
reason: done
---

# Ask

The route ticket's ask names the package its test lives in, so its done_when line runs as written.

The line names `./src/check`, which stands nowhere, so a hand running it meets no package.

- the done_when line of route-keeps-its-chapters reads `go test ./src/modules/check -run TestReRouted`, and that command passes
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The done_when line of route-keeps-its-chapters names `./src/modules/check`, where `TestReRouted` lives, so the line runs as written. The fix landed in 476871014.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the fact stands once, where the change writes it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
