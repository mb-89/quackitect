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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: 10cd3a8472aa9719908a8fdc11126f250a5e2668
    hash_after: 10cd3a8472aa9719908a8fdc11126f250a5e2668
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes; green, src/yaml passes
      - name: check
        exit: 0
        said: "   94.8  in all"
    inputs:
      - name: ask
        hash: 886cff197dd8c76d
        size: 429
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: take, dispatch, free and list read one `depends_on`, through one parser.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `dependsOnText` in `src/branches/stands.go` strips `work/` and stops at a multi-line flow list, and `dependsOn` in `src/branches/group.go` does neither. Take then runs a group that dispatch reads as waiting.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestEveryDependsOnSpellingReadsOneWay` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/group_test.go src/yaml/yaml_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`dependsOn` in `src/branches/group.go` reads every `depends_on`. It strips brackets, quotes and the `work/` prefix through `groupNamed`. This change deletes the raw-row reader `dependsOnText`. `waitingOn` and the list rows now call `dependsOn(frontOf(text))`. The yaml map reader in `src/yaml/yaml.go` joins a flow list open at its row's end with the deeper rows until its bracket closes. A multi-line flow list then reads whole. One table case holds every spelling, and it replaces the three older cases.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: take, dispatch, free and list read through one parser
- the change carries its cleanup: the duplicate test cases leave with the duplicate reader
- the fact stands once: `dependsOn` alone reads the field

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
