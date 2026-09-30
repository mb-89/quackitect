---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-verbs-switch-over/accept
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
group: quack-verbs-switch-over
parent: quack-verbs-switch-over
record:
  - step: do
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: f1abe6fae2530bd027225f13cc841b8c780b0b22
    hash_after: ccb4af29e491b3294c7865826c8d5f10ce1c8ee5
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/verb-tools-keep-spaced-args.md:41:148: Vocabulary: mcp stands outside the words this tree writes. Write a c"
    inputs:
      - name: ask
        hash: 00c2a7255ed59056
        size: 265
    def: 2c96f754ab948dbc
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the index verb tools lose an argument holding spaces. mcp__level0__index_ticket_note answers that it needs a name and a line when handed both, and mcp__level0__index_ticket_pull refuses a --fields hand-back that ./RUNME.sh takes, so an agent falls back to the shell

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/index-tools.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The host spreads a tool call's arguments on the event beside `tool`, as `src/bridge/bash.js` reads `e.command`. `callsIndexTool` in `.claude/skills/level0/lib/index-tools.js` read `e.input`, found nothing, and posted `{}`, so every verb tool ran with no words past its verb. It now reads each property the tool's input schema declares off the event, and a bare tool its one `input` property. The running plugin reloads at the turn's end, so the live call proves the fix from the next turn on.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the ask blamed spaces, a call with one word failed the same way, and the cause is the lost input, which the discussion of the fix names
the cleanup the change reveals: the test fixture carried the same wrong event shape, and the change corrects it
every fact stands in one place: the schema owns the argument names, and the function reads them off it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
