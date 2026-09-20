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
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-battery-earns-its-time
step: do
record:
  - step: do
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: d893e9305e3d05c61f622386706dac1a118a30b9
    hash_after: d893e9305e3d05c61f622386706dac1a118a30b9
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The one-reading contract proves both fronts name the same lines, and one file proves it. The language server runs once, shared by both sides.

<!-- breaks, as text: what breaks if it is never done -->
The case runs Vale, Biome and the language server twice each over a folder, and takes eleven seconds under load.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/one-reading.test.js` reads one file and calls the language server once
- the case runs under three seconds alone, which `node --test test/contract/one-reading.test.js` decides

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/contract/one-reading.test.js

## check

    ./RUNME.sh check

## says

The case reads one file, `spec/guidance/working.md`, through both fronts. The language server reads it once, and both fronts take that list. The panel's route adds it beside its own findings, and `readingFor` takes it as its second argument where a caller holds one. Every other caller leaves that argument out, and the reading runs the server itself as before.

| the case | alone on this box |
|---|---|
| over the guidance folder, the server twice | 2.2 s |
| over one file, the server once | 0.8 s |

The change landed under the sibling ticket on the doors, because that ticket's third line needed every case under the bound. This record says what the case reads now.

## checked

- the change follows the ask: one file, and the server once
- the cleanup it reveals is in the change: the second argument, with its default
- the note on one checker owns the fact, and the case points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
