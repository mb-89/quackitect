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
group: retro-and-coordinator
step: do
record:
  - step: do
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: f649817cd1dcc7a126ce723857824241c075a71e
    hash_after: f649817cd1dcc7a126ce723857824241c075a71e
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  106.5  in all"
    inputs:
      - name: ask
        hash: e73959d694a8d00d
        size: 480
    def: df12650931d480c9
reason: done
---

# Ask

A split orders its children by what each one reads, and a draft names every default file a new key moves.

Siblings land in the wrong order, a key misses its default file, and a group grows past review before it splits.

- The split checklist in `spec/processes/group.yaml` asks what each child reads from its siblings, and when a growing group splits.
- The draft checklist in `spec/processes/standard.yaml` asks for each file a new config key moves.
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/dispatch_write_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The split checklist of the group route now asks each child to name what it reads from its siblings, so the children land in that order, and asks a group growing past one review to split before it grows further. The draft checklist of the standard route asks every config key an approach adds to name each default file it lands in. The process hashes moved, so ticket update carried the new routes into this group and into the ticket the route hash test pins. Open tickets in other groups take the new route when their own boxes run ticket update, which keeps this branch clear of their files.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, a line on each checklist the ask names
- the open tickets of other groups wait for their own boxes, and nothing else needs cleanup
- each checklist line stands once, in its process file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
