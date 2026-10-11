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
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 1cc469e64cf414547836c5d4a5baba9a1d4eb72c
    hash_after: 11e56b110e6dd9c9b0f0fc7b38cf6840f5da0c23
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   67.7  in all"
    inputs:
      - name: ask
        hash: 89920c0777b35944
        size: 477
    def: df12650931d480c9
reason: done
---

# Ask

retro chapters reads commits through an injected git door and says so when git fails, so its tests fake the commits and a reader tells no commits apart from a failed git.

Where git fails, every chapter record carries commits [] with exit 0, and the tests run real git in a temp dir and assert nothing about commits.

- go test ./src/quack -run TestRetroChapters passes a case asserting commits off a fake git door, and one where a failing git warns
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/retro_chapters_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`retro chapters` runs git through the box's run door, where it called the real process door. A git that fails warns on the error stream with its exit and its last line, and the record carries no commits. The case `TestRetroChaptersReadCommitsThroughTheRunDoor` hands a fake door a log and a failure, and asserts the commits and the warning. The pull cases seed their config through the shared seed helper, which keeps the package's test lines under its code lines.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup the ratio guard asked for rides in the second commit
- the warning stands once, in `retroCommitsIn`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
