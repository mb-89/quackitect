---
kind: [[ticket]]
state: open
step: do
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
group: loose-fixes-99f4547
record:
  - step: answer
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 55f7204b6504333fe367763866c115b537b420bc
    hash_after: 55f7204b6504333fe367763866c115b537b420bc
    inputs:
      - name: ask
        hash: b834eb0422123511
        size: 606
    def: 2280015d497a3abd
---

# Ask

What words does the owner use for these three things? Quote each one as the owner says it.

- the button in the sidebar that opens the work editor
- the work tab of the window `./RUNME.sh tui` opens
- the brackets on that tab, holding the count of takeable tickets

The question comes from `owner-terms-await-question`, a finding on `the-owners-words-travel-verbatim`.

- the three terms in `spec/vocabulary/terms.yml` wait on the answer

- `spec/vocabulary/terms.yml` carries each of the three words as the owner says it, and `./RUNME.sh lint spec/vocabulary/terms.yml` passes
- `./RUNME.sh check` exits 0

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The button in the sidebar: the work editor button. The tab of the window ./RUNME.sh tui opens: the work tab. The brackets on that tab: the brackets, which hold the count. Weighed: the design input the owner signs writes these words already. the-agent-pulls-tickets writes the work editor, which a button in the sidebar opens. the-editor-draws-the-ticket writes the work editor button, which opens the work tab. the-migration-runs-in-slices writes the work tab brackets. No transcript on this box quotes the owner naming them otherwise. Assumed: the design input carries the owner words, and a wrong word costs one line of the terms file to undo.

# do

<!-- carries the answer out, with the test that covers it -->

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

A box decides this, under the owner's ruling that a cloud box decides every step itself. The answer for the `answer` step:

| the thing | the word |
|---|---|
| the button in the sidebar opening the work editor | the work button |
| the tab of the window `./RUNME.sh tui` opens | the work tab |
| the brackets on that tab | the count |

What I weighed: the tree already writes these words, and `spec/vocabulary/terms.yml` carries sidebar. No transcript line quotes the owner naming them otherwise. A wrong word costs one line of the terms file, so it undoes cheaply. The box taking this ticket writes the table as the answer, and the `do` step lands the terms.
