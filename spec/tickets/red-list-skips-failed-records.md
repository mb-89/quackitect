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
    hash_before: a02985e1b24656745628c3ab3d2d70059b677552
    hash_after: fd95f7d0747f54b4348bd080cbf96c4840679a7e
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/tickets passes
      - name: check
        exit: 0
        said: "   66.4  in all"
    inputs:
      - name: ask
        hash: c5254ce846e551cb
        size: 527
    def: df12650931d480c9
reason: done
---

# Ask

The check keeps a ticket's red test files out until tests-green truly passes, and the work tab counts only passed steps, because a record entry carrying returns or why counts as no pass.

A tests-green handed back with --fail turns the red list off while the tests stay red, so the next commit on the change step meets a red check. The work tab reads a failed step as done.

- go test ./src/modules/tickets -run 'TestRedList|TestProgress' passes cases for a failed tests-green and a failed tests-red
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/tickets

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A record entry carrying returns, or a why with no skip, reads as a failed hand-back. `failedEntry` in `src/modules/tickets/tickets.go` holds that rule, and the red list and the progress both call it. A failed tests-green keeps the red files out of the check, a failed tests-red names none, and the work tab counts neither as done. The progress reads the record through the yaml reader now, entry by entry, where a line scan lost which entry a field stood under.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the rule of a failed entry stands once, in `failedEntry`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
