---
kind: [[ticket]]
state: closed
urgent: true
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
group: the-rules-hold-themselves
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 2ecfd03b81d54ab6d3aa354f669380d7fd594f8a
    hash_after: b68c8df446528e8670f2746809061a0be385277a
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A box mints a successor `branch unblock` takes, and a test holds that road open.

<!-- breaks, as text: what breaks if it is never done -->

- The cloud guidance tells a box to mint a successor whose first step reads `by: person`.
- `admits` in `src/scripts/unblock.js` refuses every other `by`.
- Every process a box could name opened at a step admitting an agent.
- So the verb refused every successor a box could mint, and the wall stood.
- `spec/processes/question.yaml` now opens at a person step, and it carries no test and no chapter.
- Nothing holds that road open, and a later edit closes it again with no case going red.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a case in `test/level0/unblock.test.js` mints off `question` and reads `branch unblock` running
- a chapter under `spec/design_output/work` names the process a successor takes, and the cloud guidance points at it
- `./RUNME.sh branch test test/level0/unblock.test.js` answers green
- `./RUNME.sh check` exits 0 on the commit

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/unblock.test.js test/contract/process.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Two cases hold the road a box hands a question down, and a chapter names it:

| what stands | where |
|---|---|
| the verb takes a successor the mint writes off the question route | `test/level0/unblock.test.js` |
| the shipped route opens at a step waiting for a person | `test/contract/process.test.js` |
| the route a successor takes, and the mint that writes one | [[spec/design_output/work#a-successor-stands-on-question]] |
| the pointer a cloud box reads | rule seven of [[spec/guidance/cloud]] |

The first case mints through `withRoute` and `mintedNote`, so it reads the same
road a desk walks. Flipping the route's first step to `by: anyone` turns it red,
which is the closing edit the ask names. The second case reads the shipped file,
so an edit to the route itself turns that one red.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and the discussion says where the second case departs from it
- the cleanup it reveals: the design output gains the chapter, and the cloud guidance points at it
- each fact stands once: the level zero case owns the road, and the contract case owns the shipped route

# Discussion

- This ticket names no group, so it stands in the pool on trunk.
- [[spec/tickets/the-successor-names-a-person]] adds the refusal, and names the gap this ticket closes.
- [[spec/tickets/a-person-reads-the-split]] is the first successor the new process carries.
- `test/level0/person-step.test.js` covers the wait answer naming the route. The chapter under the design output, and a case over the route itself, stand open.
- The ask names `test/level0/unblock.test.js`, and a test there reads no real file. `DoorsOnly` and `FakeDoorsInTest` refuse the disk door.
- So the road case stands there off a route fixture. `test/contract/process.test.js` holds the shipped file to that shape. [[spec/guidance/code/testing]]
