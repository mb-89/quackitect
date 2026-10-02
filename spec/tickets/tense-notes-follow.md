---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-prose-checks-stand-alone/gate
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
group: node-leaves-the-boxes
parent: go-prose-checks-stand-alone
record:
  - step: do
    hand: box 10b884eb9cae · claude-code-remote
    hash_before: e9f865c0c7249b3a8b6be0c83256546807072d61
    hash_after: 018a374776c6774999b2a72c26a3b75192389ba7
    answered:
      - name: tests
        exit: 0
        said: green, src/prose passes
      - name: check
        exit: 0
        said: "spec/tickets/the-webview-ships-prebuilt.md:262:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: cfd59919404ca9e1
        size: 106
    def: 3199a5dc27f6d7b0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/lsp.md, spec/vocabulary/terms.yml and four Go comments still name tense.js or wink-nlp.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/prose/prose_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lsp note, the terms and the Go comments name the Go tense reader, and none names `tense.js` or wink. The Vocabulary projection drops the word the term carried. The token comment in `src/prose/prose.go` still compared the Go tokenizer to wink, so it now says what a token is.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `git grep -n wink -- spec/design_output/lsp.md spec/vocabulary/terms.yml 'src/**/*.go'` answers nothing
- the cleanup stands in the change: the comment in `prose.go` the ask missed changes too
- the Go tense reader stands in `src/prose`, and the notes point at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
