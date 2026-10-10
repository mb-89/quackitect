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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box ad0d66ffa433 · claude-code-remote
    hash_before: bf90fc347a3ce3a481dd19bf71be4ed849e9ffda
    hash_after: 30be16da6cb3eb89bbca2998a4024b7fc616ccf3
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   66.2  in all"
    inputs:
      - name: ask
        hash: cfae1906a9c6bae3
        size: 446
    def: df12650931d480c9
reason: done
---

# Ask

retro collect deletes only what it moved, so a session log row written while collect runs survives into the next collect.

The file-by-file fallback removes the whole source folder, so a fresh session.jsonl written between the listing and the removal is deleted, and no manifest row names it.

- go test ./src/quack -run TestRetroCollect passes a case where a file appearing after the listing stands after the fallback
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/retro_collect_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`retroCollectFileByFile` in `src/quack/retro_collect.go` removes each folder it emptied through the disk's plain `remove`, deepest first, and the caller drops its `removeAll`. A log file the session writes after the listing keeps its folder, since the plain remove takes an empty folder alone. The case `TestRetroCollectKeepsALogFileWrittenWhileItMovesFileByFile` writes a fresh session log during the move and finds it standing. The branch also carries the types-part port from the-engine-fixes-its-faults, which the check on this box needed.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fallback deletes what it moved and nothing past it
- the cleanup it reveals, a cold probe branch left in the source repository, stands as the note cold-probe-leaks-its-branch
- the rule stands once, in the comment on retroCollectFileByFile

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
