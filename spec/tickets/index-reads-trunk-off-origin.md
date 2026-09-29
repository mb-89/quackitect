---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-index-reads-standing-branches/accept
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
parent: the-index-reads-standing-branches
record:
  - step: do
    hand: box d857b1c19ed5 · claude-code-remote
    hash_before: 1fd1fd769fdf0857934ae8cb3a1046c43d228651
    hash_after: 1fd1fd769fdf0857934ae8cb3a1046c43d228651
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/git passes; green, src/modules/tickets passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 247f49e6742c2d9a
        size: 304
    def: 55a60120e84bce38
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`answerOf` in `src/scripts/work-answer.js` reads trunk off `origin/main` and adds the working tree. The Go path reads the working tree alone. A ticket minted on trunk after the last `branch sync` draws in cli.js and not in `tickets/branched`. So the shadow log names both verbs again until the next sync.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/git src/modules/tickets src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The git module now writes trunk's ticket files on a second port, `git/trunk`. It reads them off `origin/main`, and again only where trunk moves.

The fold in `tickets/branched` adds each trunk ticket the working tree lacks, with no path. So a ticket minted on trunk after the last `branch sync` draws in both paths.

The working tree's copy still wins over trunk's, as `answerOf` reads it. The contract suite holds the fake and a real clone to the same answer for trunk.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: trunk joins the fold beside the working tree
- no cleanup waits: the batch read now stands once, in `filesAt`
- the trunk ref and the ticket folder stand once, in `src/modules/git/git.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
