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
group: boxes-hold-and-hand-back
step: do
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: fb4596a8248a941fc70cb3a74e94f249fdeab727
    hash_after: 3fcdcb36d36acd60d06bb879a7ed8c847b718af7
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  101.9  in all"
    inputs:
      - name: ask
        hash: 17f64484dcd98687
        size: 401
    def: df12650931d480c9
reason: done
---

# Ask

A cloud box waits for its helpers and retries inside its turn, so no turn ends on a wait that nothing wakes.

Boxes end their turn on a helper or a retry, the container stops, and the work waits for a takeover.

- `spec/guidance/cloud/cloud.md` holds a rule that a box waits for a helper or a retry inside its turn.
- `.claude/skills/work/SKILL.md` names the same rule, and `./RUNME.sh check` exits 0.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance-tags.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Rule 10 of the cloud guidance now tells a box to wait for every helper and retry inside its turn, because a turn ending on a wait stops the container and the step waits for a takeover. The work skill points at the same rule. The guidance note holds its cap of items, so the wait joins rule 10, which already carries the branch to done.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, with the rule folded into rule 10, since the guidance schema caps the note items
- the change reveals no cleanup
- the rule stands once in the cloud guidance, and the work skill points at rule 10

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
