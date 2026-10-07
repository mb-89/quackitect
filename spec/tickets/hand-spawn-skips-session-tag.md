---
kind: [[ticket]]
state: open
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
group: level-zero-becomes-a-typed-mod
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

gain: A hand the pull spawns reads its own name alone, so it pulls under `--as` as its prompt says.

breaks: The live kit drops the `own` field the pull tool sets, so the spawn answer in `src/modules/hooks/spawn.go` tags the hand as the session's hand. The tag tells it to pull under no `--as`, against the prompt.

done_when:
- the spawn answer leaves a spawn untagged where its prompt opens on the hand line `spawnPrompt` in `src/pull/pull_branch.go` writes, `own` field or none
- a case in `src/modules/hooks/spawn_test.go` feeds a spawn with that line and no `own` field and reads no tag, decided by `./RUNME.sh test src/modules/hooks/spawn_test.go`
- `./RUNME.sh check` exits 0

view: none

from: [[.se/tickets/kit-drops-the-own-spawn]]

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
