---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-rules-replace-vale/gate
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
group: lint-without-vale
parent: go-rules-replace-vale
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 730df7025647a600c063cf90bcbf565a5c39da31
    hash_after: 42a06e70cb91233c0df626fc26bdb9bb6c7ee18a
    answered:
      - name: tests
        exit: 0
        said: green, src/rules passes
      - name: check
        exit: 0
        said: "    2.1  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: c6afe9a47edd497d
        size: 261
    def: 4bc7bee7defe0b42
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/rules/testdata/vale.json holds Vale's Line and Span for every fixture, and rules_test.go reads none of it, asserting presence alone; assert each row's Line and Span against it, since the lsp diagnostics and the fix verb place edits by span, or drop the file

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/rules/corpus_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The corpus keeps vale.json, and the rules tests now read it. TestEachRulePlacesItsFindingWhereValeDid in src/rules/rules_test.go holds each rule's own rows to the Line, Span and Match Vale answered over the same fixture, since the editor's diagnostics and the fix verb place their edits by span. It stands red with the other Lint cases until go-rules-replace-vale builds Lint, and the check skips it through the red list. TestEveryFixtureCarriesOneValeRowOfItsRule in src/rules/corpus_test.go holds green now: every fixture carries an answer with one placed row of its rule, so the span case never passes on a missing row. The comparison takes the rule's own rows alone, since three fixtures also trip a neighbour rule.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it takes the first road, asserting Line and Span against vale.json, and keeps the file
the cleanup the change reveals is in the change: the corpus check guards the file the span case reads, and the neighbour rows in three fixtures stay out of the compare
every fact stands in one place: Vale's places stand in src/rules/testdata/vale.json alone, and both cases read it through embed

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
