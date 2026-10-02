---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-work-tab-reads-v1/gate
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
group: tui-shell-switches-over
parent: the-work-tab-reads-v1
record:
  - step: do
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 48b9f2c9c9a5c552bbbbf51bf2c33a6dccb98577
    hash_after: 48b9f2c9c9a5c552bbbbf51bf2c33a6dccb98577
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/work passes
      - name: check
        exit: 0
        said: "spec/tickets/work-tab-waits-sends-changes.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 4256038d1a4b3959
        size: 286
    def: b10bf3e839860457
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

PlacesIn marks every unmerged standing branch and its tickets cloud, while tickets/cloud marks only a group carrying the cloud mark and its tickets, so an unmarked standing branch loses its cloud letter; the ask asserts the rows carry the flag already, and no test pins which rule holds

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/work/branches_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cloud letter reads the group's cloud mark alone. That is the rule `cloudOf` in the tickets module holds, and the queue's cloud place reads it too. The window's branch verb marked every unmerged standing branch, a second rule that drew a cloud letter the queue never placed. `TestTheCloudLetterReadsTheGroupsMarkAlone` pins the one rule, so the work tab loses nothing true when it reads the rows alone. The check also met the package table: the log and work tabs now import the registry's catalog, so the table in the design output and its case name it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: it picks the mark as the one rule and pins it with a case
- the cleanup the change reveals, the package table, stands in this change
- the rule stands once, in cloudOf, and the case points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
