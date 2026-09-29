---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: prose-checks-run-in-go/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-land-in-shadow
parent: prose-checks-run-in-go
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: a0b8f48d97ac711d400a65246949f2af0a7a9ea3
    hash_after: a0b8f48d97ac711d400a65246949f2af0a7a9ea3
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 4 file(s); green, src/prose passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: ask
        hash: f6d853756a8f2a9d
        size: 264
    def: 76c1d849e1b5a0b5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

findingsOver in src/bridge/findings.js reads each walked file through readsText, and readThrough reads only the rows the walk passes over, so a shadow hooked on readThrough misses most findings of a check run; hook it once over what findingsOver and voiceOver read

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/prose-shadow.test.js test/level0/prose-shadow-wiring.test.js test/level0/findings.test.js test/level0/cli-read.test.js src/prose

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The prose shadow now runs over what the check reads: findingsOver gathers every document it reads through readsText and readThrough, and runs one quack prose process over them in past mode, voiceOver runs it over its one document, and readsProse runs it once a draft in all mode. The Go vetoes in src/prose answer beside wink, with golem and an embedded exception list for the lemma, and quack prose prints the findings they keep. A live run over spec wrote PastTense rows alone, on participles such as detached and retired, which wink reads as their own lemma and golem reads as past: the disagreements the shadow exists to show. Weighed: readsProse and voiceOver return at once, so their shadow runs unawaited and swallows its fault, where findingsOver awaits it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the shadow hooks findingsOver and voiceOver, and readThrough rides inside findingsOver.
The cleanup the change reveals rides in it: findingsDoors in cli-read.js builds the check doors once, the config and the log among them, and a case reads them.
The domain words stand in the vocabulary lists, and src/prose/words.go reads them there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
