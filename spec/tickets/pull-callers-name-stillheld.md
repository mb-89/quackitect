---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failures-and-the-sentinel/gate
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
group: failures-stand-registered
parent: failures-and-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 74c596639b71505bc08595d1eb4bec55d5537e9e
    hash_after: 5520aeef1b6dc08fadd5262ed1ef83ef77eb745a
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 9ef4dec01110b9e7
        size: 217
    def: 16e0bdd9a976b893
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list and the red test's Say(Refused form miss the Errorln refusals in src/pull/pull.go, stillHeld and the refusals at the branch check and the queue bind among them; move each through the door at implement

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/pull/pull_failure_test.go src/quack/ticket_bless_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every refusal the pull says now raises through the failure door. The pull's It takes a failure.Registry, which src/quack/ticket_doors.go loads from spec/failures. Each site calls it.Refuse(failure.Raise(it.Failures, "<id>", rows...)) with a literal id, so the tree check reads each id. Refuse prints the site's message, then the id at its level and each remedy, and logs a row carrying the id. The Errorln refusals move too: the flags, the branch check, the queue bind, the person-step split and stillHeld, which keeps its size cap. Say now writes the standard stream alone. Each id has a node under spec/failures, and desk-works-on-trunk serves the desk refusal. src/pull/pull_failure_test.go reads stillHeld and the branch check off a fake registry. The bless cases expect the line the door prints for each id.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: every Say(Refused and every refusal Errorln in src/pull raises an id, and the red case now names take.go alone
- the cleanup the change reveals: the desk refusal prints its site remedy beside the node remedy, and the wider id tests ride pull-ids-test-written
- every fact stands in one place: each remedy stands on its node, and the site keeps the message it builds

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
