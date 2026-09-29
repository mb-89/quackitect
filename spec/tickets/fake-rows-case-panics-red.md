---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-work-view-gains-actions/gate
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
group: tui-shell-lands-in-shadow
parent: the-work-view-gains-actions
record:
  - step: do
    hand: box d856db450bd7 · claude-code-remote
    hash_before: 086dd415d8c643749ecd7aa865f5462e9d1173b2
    hash_after: 086dd415d8c643749ecd7aa865f5462e9d1173b2
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/registry passes
      - name: check
        exit: 0
        said: "spec/tickets/work-view-awaits-log-parse.md:41:118: Vocabulary: readbase stands outside the words this tree writes. Write"
    inputs:
      - name: ask
        hash: 9981dd6e08752741
        size: 248
    def: cf945a4d0451086e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestTheWorkViewDrawsOverAFakeWorkRows panics in tree.Header on the empty tree the ViewOver stub hands back, so it fails on no assertion of its own and stops the rest of src/tui/work; give the stub the base file columns so the case fails on its want

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/registry

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The ViewOver stub reads the base file and hands back a tree with its columns, so the fake rows case reaches its own assertion in place of panicking in the header of an empty tree, and the rest of src/tui/work runs. A case holds the header columns.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the stub in shadow.go and its test alone
- no door is touched
- the stub holds no fact stated elsewhere

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
