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
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: 12eed34dfc7053def73836626de7d334d7990772
    hash_after: 62e2b6933dbb08fa0c9fbdcae121209aab77034c
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  115.3  in all"
    inputs:
      - name: ask
        hash: c73f3605aba8ff58
        size: 347
    def: df12650931d480c9
reason: done
---

# Ask

A fix starts from the live fault shown through the real door, so the fix answers the fault the box met.

Fix boxes change code against a guess, and a fix lands green while the live fault stands.

- `spec/guidance/code/testing.md` holds a rule that a defect fix first shows the fault through a probe or a contract case.
- `./RUNME.sh check` exits 0

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

Rule 5 of `spec/guidance/code/testing.md` now names the failing case a defect fix starts from: a `./RUNME.sh probe` run or a contract case showing the live fault through the real door. The rule joins rule 5, since the note holds its cap of items and rule 5 already asks for a red test first. An example row shows the do and the do-not.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, with one departure: the rule joins rule 5, since the schema caps the note's items
the change reveals no cleanup
the rule stands in rule 5 alone, and the probe verb owns its own usage

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
