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
    hash_before: a0464c40e589f01b5140837ad36e6548c8763bd6
    hash_after: a0464c40e589f01b5140837ad36e6548c8763bd6
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/lsp passes
      - name: check
        exit: 0
        said: "spec/tickets/the-webview-ships-prebuilt.md:262:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: ca09025ac428a070
        size: 79
    def: 3199a5dc27f6d7b0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/modules/lsp/tools_test.go fills Node and Tense in its shared Tools fixture.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/lsp/tools_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The shared Tools fixture in `src/modules/lsp/tools_test.go` fills neither Node nor Tense. The Go prose checks answer the tense rows now, so a fixture field for the JavaScript tense reader proves nothing. The change rode in with the commit that drops wink, since that commit took the two fields off `Tools`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fixture fills neither Node nor Tense
- the cleanup rides in the go-prose-checks-stand-alone commit, which took the two fields off `Tools`
- the fact stands in `tools.go`, and the fixture reads it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
