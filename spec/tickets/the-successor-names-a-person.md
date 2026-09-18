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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box d42624a67d18a8 · claude-code
    hash_before: 7bd137638c6db513987df6f7a4aaac3189714a6e
    hash_after: 4ee28b500a1d7f9b286933fda4e4482fee6b12c8
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 68 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A person's work reaches a person.

<!-- breaks, as text: what breaks if it is never done -->

- `branch unblock` hands a step wanting a person into a successor outside the group.
- It reads that successor as open and outside the group, and reads no `by`.
- A hand mints a successor off `trivial`, whose step reads `by: anyone`.
- The pull hands that successor to an agent, which reaches a person's question.
- The group stalls on the wall the verb exists to clear.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `branch unblock` refuses a successor whose first step admits an agent.
- A test covers that refusal, and `./RUNME.sh branch test` answers green.
- The cloud guidance names the assignment a successor carries.
- `./RUNME.sh check` exits 0 on the commit.

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/unblock.test.js

## check

    ./RUNME.sh check

## says

`branch unblock` refuses a successor whose first step admits an agent.

A successor carries a person's question. A hand minting one off `trivial` gets a first step under `by: anyone`. The pull then hands that question to an agent, and the wall stands again one ticket along. The verb now reads the successor's first step, and refuses every `by` outside `person`:

| the first step reads | what the verb answers |
|---|---|
| `by: person` | it runs, and the child closes `became` |
| `by: anyone`, or no `by` | refused, naming `anyone` |
| `by: agent` | refused, naming `agent` |
| no step at all | refused, because a successor opens at one |

`admits` in `src/scripts/unblock.js` holds the rule, and `openLeaf` reads the first step the way `takeable` reads it. So the two verbs read one shape.

The case drives all three spellings, and reads the child still open after each refusal. The successor fixture takes `by: person`, because the old fixture was the ticket this change refuses.

`spec/guidance/cloud.md` grows a line beside the `unblock` one, so a box mints the successor right the first time.

## checked

- the change follows the ask. The verb refuses, a case covers it, and the cloud guidance names what a successor carries.
- the cleanup stands in the change. `openLeaf` reads the first step the way `takeable` does, so one shape serves both.
- every fact stands in one place. The rule sits in `admits`, and the guidance points a box at the verb.

# Discussion

- This ticket names no group, so it stands in the pool on trunk.
- The step reads `by: anyone`. A process carries the assignment, and the ticket
  door holds `steps` for the verbs, so a hand assigns none after the mint.
- The verb and its design output stand already. For details, see
  [[spec/design_output/work#a-person-step-leaves]].
