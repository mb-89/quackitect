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
    hash_before: 6502399b9aaf666d82a58e06f1789a1d5554445e
    hash_after: 6502399b9aaf666d82a58e06f1789a1d5554445e
    answered:
      - name: tests
        exit: 0
        said: green, 21 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-webview-ships-prebuilt.md:262:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: b8dbefeba539bcc0
        size: 82
    def: 3199a5dc27f6d7b0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the start road and the modules item both read wink's folder, so both changes stay.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/start-road.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Both widenings the gate weighed stay in. The start road in `.claude/skills/level0/hooks/start.js` probed `node_modules` to learn whether a fresh clone needs the install, and `node_modules` held wink alone, so the road now probes the index binary. The modules item in `src/scripts/install.sh` checked for `node_modules/wink-nlp` and ran a root npm install for it, so the item leaves with wink. Either probe left in place reads a folder no box fills, and installs on every start.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both changes stand in `8fc394f66`, and the start road case covers the probe
- the cleanup stands in the change: reason 6, the modules failure, leaves with the probe
- the probe stands once in `START`, and the reasons table points at its codes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
