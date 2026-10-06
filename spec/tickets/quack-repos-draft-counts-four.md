---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-repos-meet-fake-git/gate
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
group: unfaked-doors-take-fakes
parent: quack-repos-meet-fake-git
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 1a818d56353bb7b12425f5c88b0f831b696e6979
    hash_after: d1da43b9d1b86d31590d577b4fe96915c6148b72
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  103.3  in all"
    inputs:
      - name: ask
        hash: a835730b6a186469
        size: 166
    def: 7f45bf4926f4a317
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft says Five cases lean on a refusal and lists four, the index lock, the commit hook, the open hook and the remote URL, so Four stands and no case goes missing

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_twins_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The quack-repos draft said Five cases lean on a refusal the fake holds no road to, and listed four. The engine owns the draft field, so the correction stands under the ticket's Discussion: Four, and no case goes missing. The size golden takes the ticket's new length.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from an edit in place, since the door refuses a write to another ticket's draft, and the Discussion holds the correction
- the cleanup it reveals, a size golden pinning an open ticket's length, stands as the note size-golden-pins-open-tickets
- the count stands once, in the Discussion line, which points at the draft's list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
