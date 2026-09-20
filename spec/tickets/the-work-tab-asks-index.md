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
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-work-tab-reads-tickets
step: do
record:
  - step: do
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 5ded9bf48ea823f61d47b756a335a9bab91b11f6
    hash_after: 5ded9bf48ea823f61d47b756a335a9bab91b11f6
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 3 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The work tab draws off the index query and redraws on the index callback, so it is live on any box, and `work.json` goes.

<!-- breaks, as text: what breaks if it is never done -->
The tab waits for `branch answer`, and a person opening the TUI reads an empty tab or a stale one.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/tui/work.go` reads the index and no file, which `go -C src/tui test ./...` covers
- `.se/.runtime/work.json` stands nowhere in the tree, which `grep -rn work.json src` decides
- `spec/design_output/tui.md` says what the tab draws, and no longer says it stands empty

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The work tab reads the index and no file. It asks `tickets` for its rows and
holds a `changes` call for the redraw. So a change under the tree reaches the
tab through the index, and the tab polls nothing. For the road and the rows,
see [[spec/design_output/tui#the-work-tab]].

| what went | what stands in its place |
|---|---|
| `branch answer`, and the file it wrote | `answerOf` stays for `branch list --queue`, and writes nothing |
| the poll on the file's time | the tick the index answers, held until a sweep |
| the columns the pull scored | `standing` and `step`, off what the index answers |

The base file names what the index answers and nothing more. So the queue
place, the progress and the person letter go, because a branch informs a
ticket's standing and nothing more. The cases stand a fake door up on a port
the standing file names, so `go -C src/tui test ./...` reads no binary.

## checked

- the change follows the ask: the tab reads the index, no file stands under `src`, and the note says so
- the cleanup it reveals: the answer verb and its reader go, and the listing keeps the one reading it needs
- every fact stands once: the road stands in the TUI note, and the rows point at the index note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
