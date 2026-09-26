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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
record:
  - step: do
    hand: box d7a540d981d5 · claude-code-remote
    hash_before: d201d8aef459e49643ff544539061d2c6d7f0270
    hash_after: 3587c274ba8dbb81cfd7d9600e12d848ebb53f37
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "spec/tickets/the-decisions-get-rationales.md:71:1: ListItem: A sentence in a list item holds 20 words, and this one hold"
reason: done
---

# Ask

A rationale argues each ruling in [[spec/design_input/the-index-holds-the-model]] and [[spec/design_input/the-migration-runs-in-slices]] that none argues yet. [[spec/design_input/the-migration-runs-in-slices#the-settled-rulings]] names the ones argued already.

The owner settles these and wants no box to ask again. A box finds the argument before it decides.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- each rationale says the ruling is final, what it gives up, and what makes it wrong
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

A rationale now argues each ruling of the model and the migration that none
argued. The rulings group by what one argument carries, so a cluster such as
the slices, the shadow and the owner's switch shares one note. Each rationale
says the ruling is final, what it gives up, and what makes it wrong.

[[spec/design_output/migration#the-argument-for-each-ruling]] maps every ruling
to its argument, the standing ones among them. The settled rulings in the
migration's design input point at that map.

Weighed: one rationale a ruling, against one a cluster. A cluster wins where
the rulings share their evidence, because a split repeats it. Assumed: the
rulings in the inner protocol funnel belong to their own ticket.

## checked

- the change follows the ask: every unargued ruling of both design inputs has a rationale, and the map names each one
- the cleanup it reveals: none, because the map is one table and the list points at it
- the map holds each pointer once, and the design input points at the map


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
