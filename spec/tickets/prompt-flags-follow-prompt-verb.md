---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: boxes-write-their-final-record/gate
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
group: the-fleet-watches-itself
parent: boxes-write-their-final-record
record:
  - step: do
    hand: box 238560a34a48 · claude-code-remote
    hash_before: dc3b127140cd39f90d5c4ed84f9fe7fa896a6ece
    hash_after: dc3b127140cd39f90d5c4ed84f9fe7fa896a6ece
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 1b837a3cba32b626
        size: 179
    def: f1dbe938dcadec5d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/branches/prompt.go belongs to the sibling a-verb-writes-box-prompts, so the three flags land on the rules that ticket writes, after it, not as a second write of the same file.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/probe-clear.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The box rules in `src/branches/prompt.go` and the work skill's done line name `--model`, `--cost` and `--final`. So every box writes its model, cost and final line to the record at its hand-back.

The check met three faults on the way, and the change fixes each.
- The new branch cases ran alone, so each now calls `t.Parallel`.
- `fleet.go` read another way than gofmt writes it.
- The clear probe cloned this branch with a parked fix ticket, and the pull handed that ticket ahead of the probe's own leaf. The probe now drops every park in its clone and commits that, so its handover reads no local work. A case in `test/level0/probe-clear.test.js` holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change follows the ask: the flags ride the rules constant the prompt verb prints.
- The cleanups the check revealed stand in the change: the serial cases, the format, and the probe's park.
- The flags stand in the rules and in the skill, since a spawn reads the prompt and a box reads the skill.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
