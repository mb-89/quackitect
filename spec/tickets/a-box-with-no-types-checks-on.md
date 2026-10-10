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
group: the-tui-keeps-its-place
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a box whose `claude` lays no engine types reads the check's types part as untyped and carries on, as a box with no `claude` does.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `typesHold` in `src/quack/check.go` runs `tsc` once `claude` runs at all. Where the lay leaves no `.claude-plugin/types/tsconfig.json`, `tsc` refuses the plugin config and writes a `.js` beside each hook. The stub case then fails on the stray `bridgehead.js`.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/quack/ -run TestCheckParts` passes, with a case where the lay leaves no types and no `tsc` runs
- `./RUNME.sh check` answers 0 on this box

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
