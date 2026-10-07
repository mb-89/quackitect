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
group: level-zero-becomes-a-typed-mod
step: do
record:
  - step: do
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: cd3792f49455dc239f8ceb50104e4000c0a0f52f
    hash_after: 7e1d8ff1bb068c428089cb06b00a81d0e98abe2c
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   93.5  in all"
    inputs:
      - name: ask
        hash: 92f06230e991b6b1
        size: 741
    def: df12650931d480c9
reason: done
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

./RUNME.sh test src/modules/hooks/spawn_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The spawn answer in src/modules/hooks/spawn.go leaves a spawn untagged where its prompt opens on the hand line, as well as where it carries the own field. The live kit drops that field, so the pull hand took the session tag, which told it to pull under no --as. The line stands once as q.HandOfItsOwn, the pull writes its hand prompt from it, and a case in each package reads it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the answer reads the hand line, and a spawn case reads no tag on it
the cleanup the change reveals: the hand prompt names no ticket in its first pull, which the group retro carries as a finding
the hand line stands in q alone, and the pull and the spawn answer read it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
