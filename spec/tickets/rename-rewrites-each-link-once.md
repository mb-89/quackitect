---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: a45ebee07d4bbfd540add946f7d0f6724aabb06e
    hash_after: 43cd44541781ec80dcaaa8bb2ed23747881f36be
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/holds-leave-with-their-ticket.md:117:1: ListItem: A sentence in a list item holds 20 words, and this one ho"
    inputs:
      - name: ask
        hash: a164c93508add8b0
        size: 532
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A move under a folder of its own name rewrites every link once, so the tree holds no dead link after it.

A rename into a subfolder of its own name rewrites a link already naming the new path a second time. It also rewrites closed tickets, whose fields the ticket door refuses to any hand.

- `./RUNME.sh rename spec/a.md spec/a/a.md` over a fake tree leaves every link at `spec/a/a`, and a case under `test/level0` decides it
- the rename leaves a closed ticket as it stands, and the same case reads it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/rename.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The rename rewrites the path form and the link form of a name in one pass, the longer first. So a move into a folder of its own name leaves each link rewritten once. A closed ticket keeps its text, because the ticket door refuses its fields to every hand.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and one case holds both the single rewrite and the closed ticket
- the cleanup it reveals stands in the change: renamingText skips a closed ticket too
- the rule stands once, in renamedForms and keepsItsText, and the design chapter names both

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
