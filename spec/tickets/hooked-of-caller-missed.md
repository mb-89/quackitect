---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-mcp-module-lands/gate
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
group: go-cage-lands-in-shadow
parent: the-mcp-module-lands
record:
  - step: do
    hand: box d85490c97110e · claude-code-remote
    hash_before: 5ad67e61252149be4dc74fc17c8c4afd640b203a
    hash_after: 16ecf84d49e58540b61545785b5e223c3369f089
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 3023a22903586703
        size: 175
    def: 831a3e612565a250
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft changes `hookedOf` to take the module type. Its callers list misses `src/quack/hooks_test.go`, whose line 33 calls it, so the implement step changes that caller too.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/hooks_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

hookedOf in src/quack/main.go takes the module type it looks for, so the mcp module reads its own instance the way the hooks door reads its. Both callers pass hooksModule: wired in main.go, and the wiring case in src/quack/hooks_test.go, which the draft of the-mcp-module-lands left off its callers list.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the signature takes the type, and the hooks_test.go caller passes it
- the change reveals no cleanup beyond itself
- the change adds no fact standing elsewhere: hooksModule stays the one name of the hooks type

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
