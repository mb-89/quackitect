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
    hand: box 77f4c295c43a · claude-code-remote
    hash_before: fe76e30fa4e32ae4862f9085dd96de01e23b2dea
    hash_after: fe76e30fa4e32ae4862f9085dd96de01e23b2dea
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-webview-ships-prebuilt.md:262:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e8dd52be59c5e3c0
        size: 110
    def: 3199a5dc27f6d7b0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/hooks.test.js plants node_modules/wink-nlp as its boot fixture, and that fixture leaves with wink.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The boot cases plant the plugin manifest alone. `boots` in `src/scripts/boot.js` reads the manifest and nothing else, so the wink folder in the fixture proves nothing. The case naming that folder leaves, and the case where both stand now names the manifest alone. The twin golden of the check module takes the two pointers the webview red cases add, until that ticket writes its chapter.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fixture plants no wink folder
- the golden regenerates through its own flag, and the webview ticket writes the chapter its pointers name
- the fact stands in `boot.js`, and the cases point at the design input

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
