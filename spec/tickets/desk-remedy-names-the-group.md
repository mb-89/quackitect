---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-twins-leave-whole/gate
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
parent: the-twins-leave-whole
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 9285fd063099e739264920db812d9374a66187b1
    hash_after: 9285fd063099e739264920db812d9374a66187b1
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  112.2  in all"
    inputs:
      - name: ask
        hash: 60b28b8cbd523b28
        size: 266
    def: b3995cb871db2080
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the named pull's refusal used to name the group in the remedy (branch merge one-group). Under the new test it reads branch merge <name>, and only the message names the group, so a desk reader loses the exact command. Keep it, or carry the name into the node's remedy

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Kept as it stands. The named desk pull's message names the group, and the node desk-works-on-trunk's remedy names the merge with its placeholder, the one remedy every desk refusal shares in Go and in JS. Carrying the name into the remedy needs a placeholder filled at the door, a mechanism the failure door holds nowhere, for one refusal. The cost: a desk reader types the group the message names into the merge.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change departs on purpose: the ask offers keep, and this keeps it, with the reason above
no cleanup follows, since nothing changes
the remedy stands once, on the node, and the message names the group beside it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
