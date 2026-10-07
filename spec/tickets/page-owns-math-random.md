---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-guard-refuses/gate
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
group: doors-declare-what-they-own
parent: the-guard-refuses
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 925f709245f5e960e00c99fc9667e957e3ee1ed9
    hash_after: fd7cca1a61a7d648b9fe70b5b50b235accf41e73
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   61.9  in all"
    inputs:
      - name: ask
        hash: 7b3ad3dd928a26a3
        size: 282
    def: 1ba1f1de37804f52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/extension/drawing/route.mjs calls Math.random, and the page door holding it as its own outside leaves Math.random out of its js list. Once the random door owns Math.random, that call walks around random and the check goes red. Add Math.random to src/extension/drawing/owns.yaml.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The page door in src/extension/drawing/owns.yaml stands as its own outside: the webview bundle reaches the clock where no node door reaches. The bundle also calls Math.random, and the page list left it out. Once the random door of the-guard-refuses owns Math.random, that call would walk around random and turn the check red. The page now owns Math.random beside the clock names, and its header names chance beside time. Because an outside door owns a name in its own files alone, a use of Math.random elsewhere reads as a walk only once the random door stands. Until then TestEveryDoorNamesAPlantedWalk in src/owns reads no walk for it, and the implement step of the-guard-refuses turns that test green with the random door. The check answers green on the commit.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: Math.random joins the js list of the page in src/extension/drawing/owns.yaml
the cleanup it reveals is in the change: the header of the declaration names chance beside time; the planted-walk test that leans on the random door is named in says for the implement step
the name stands once, in the page declaration, and no note repeats the list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
