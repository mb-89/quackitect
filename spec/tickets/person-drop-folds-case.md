---
kind: [[ticket]]
state: closed
point: gate
todo: false
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: v1-takes-a-run-secret/gate
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
process_hash: 2a00b62f7c4bc60b
group: hooks-v1-hold-the-line
parent: v1-takes-a-run-secret
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 53d63007e1350c930240c5c3f375317a75feca88
    hash_after: 53d63007e1350c930240c5c3f375317a75feca88
    answered:
      - name: tests
        exit: 0
        said: green, src/q/tool passes
      - name: check
        exit: 0
        said: "   99.0  in all"
    inputs:
      - name: ask
        hash: 5f7023c3be17af3b
        size: 103
    def: be9d938c0443b338
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`tool.Input` drops the `person` key, but `json.Unmarshal` folds case, so `Person` still marks a person.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/q/tool

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`tool.Input` clears the person mark on the decoded input, in place of a key of the raw map. A key in any case, `Person` or `PERSON`, then drops. `TestAnAgentsCallDropsThePersonMark` holds the three spellings. The change landed in 9e5aadc17 and 411abd680.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the mark clears off the decoded value, as `unmarked` in `src/q/tool/tool.go` reads it
- the cleanup the change reveals: the field name stands again in `tool.go`, since q imports no index, and the comment names the twin
- the field name stands as `personField`, beside a pointer at `MarksPerson`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
