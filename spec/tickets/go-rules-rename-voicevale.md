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
    hash_before: 89098a3d0c277933f7e0c83b876e7d7fffcddf90
    hash_after: 01dec7e3f5bf2deea3ccdaa68dcdcbf735248d2c
    answered:
      - name: tests
        exit: 0
        said: green, src/rules passes
      - name: check
        exit: 0
        said: "  119.4  in all"
    inputs:
      - name: ask
        hash: 468be533c0d68164
        size: 356
    def: 4bc7bee7defe0b42
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach keeps the VoiceVale style under spec/config/styles and its name in src/rules/scope.go, src/rules/testdata and every check id, plus Tools.Vale and ValeRuns in src/modules/lsp, so the done_when grep `git grep -il vale -- src test RUNME.sh .github` cannot answer nothing; rename the style and the fields in the build, or narrow the done_when line

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/rules/exempt_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The style keeps the name VoiceVale, and the done_when grep of go-rules-replace-vale narrows to Vale the tool. The bare grep for the word can never answer nothing: the marker keeps Vale's spelling, the cases in src/rules/exempt_test.go hold it, and the tests carry it. A rename moves every check id and every standing marker and changes no behaviour. The narrowed grep meets the binary path, the language server, the Go module and .vale.ini, which is what leaves the box, and it meets the lsp door that feeds Tools.Vale. The same note corrects the stale src/modules/rules path to src/rules. The table stands under Discussion in spec/tickets/go-rules-replace-vale.md, for accept to read.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it takes the second road the ask names, narrowing the done_when line, and says why under Discussion
the cleanup the change reveals is in the change: the stale src/modules/rules path in the same done_when lines is corrected in the same table
every fact stands in one place: the narrowed lines stand in the Discussion of go-rules-replace-vale, and the marker spelling points at spec/design_output/rules#a-marker-quiets-a-rule

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
