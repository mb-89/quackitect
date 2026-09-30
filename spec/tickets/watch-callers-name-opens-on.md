---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: v1-watch-sends-changes/gate
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
group: tui-shell-switches-over
parent: v1-watch-sends-changes
record:
  - step: do
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 26a3aac7f3128be5c9948e04f122972fedd4e6f9
    hash_after: 26a3aac7f3128be5c9948e04f122972fedd4e6f9
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "spec/tickets/watch-refuses-before-it-streams.md:41:311: Vocabulary: huma stands outside the words this tree writes. Writ"
    inputs:
      - name: ask
        hash: 43dd3fa48f130522
        size: 136
    def: 2e7737b6a696941d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the `OnCommit` hook the approach extends stands in `opensOn` in `src/index/door.go`, not in `Serve`, so the callers line names `opensOn`

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

The watch approach said the OnCommit hook lives in Serve. It lives in opensOn in src/index/door.go, and Serve only calls opensOn with net.Listen. The engine keeps the design fields of v1-watch-sends-changes, so the correction stands under its Discussion, where the implement step reads it. No code changes, so the check covers it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- follows the ask: the correction names opensOn. It sits under Discussion, because the engine refuses a write to the callers field.
- cleanup: no design note repeats the claim, and the closed v1-watch-streams-changes keeps its record.
- one place: the line points at the file and the function, and repeats no code.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
