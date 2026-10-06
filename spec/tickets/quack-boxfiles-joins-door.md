---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-reaches-the-box-through-doors/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: quack-reaches-the-box-through-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 7cfe67e105846f33f2f893f5e3eeb5a77e9d3ba7
    hash_after: 7e7afb1c3d582e5e01f049110f1f863a31d615ab
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes
      - name: check
        exit: 0
        said: "    1.9  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 75721b9d519df5b3
        size: 190
    def: 6a55bc0a7781afef
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/quack/boxfiles.go reaches os for stands and readText, and the draft's door file list leaves it out; the change moves those reads onto the hand or names the file in the root's declaration

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/owns/tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The root declares itself a door in src/quack/owns.yaml, owning os, os/exec, net, net/http and syscall over its door files, and boxfiles.go stands among them. That file holds the small reads every box verb shares, which is a door file job, so its reads stay in place. The declaration stands at report, so no walk-around turns into a refusal before the parent move lands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change takes the second road the ask names: the file joins the declaration
the cleanup stands in the change: the four gate points lose the todo tag that put them ahead in every pull
the door files stand once in src/quack/owns.yaml

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
