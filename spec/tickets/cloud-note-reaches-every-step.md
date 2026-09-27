---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-style-carries-the-top/design/review
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: guidance-rides-each-step
parent: the-style-carries-the-top
record:
  - step: do
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: b169909f0674dcf358f19c9313a224bc3136fe20
    hash_after: 9e4f7b77171998444514769af9266cf1c58614ea
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-style-carries-the-top.md:160:3: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

once spec/guidance/cloud.md moves under a subfolder, the tag resolver hands it only at steps tagged cloud, so on a cloud box its session-wide rules (pull first on main, commit and push each finished thing, branch done last) reach no standard-process leaf and no moment before the first pull; hand the note on every leaf where its env binds, or tag every process leaf cloud

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance-tags.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

An env-bound note under a subfolder of spec/guidance now reaches every leaf where its env binds, whatever the leaf tags. Once the cloud note moves under a subfolder, its rules still ride every step on a cloud box, and stay off a desk. readsFor resolves on untagged leaves too, and two test fixtures carry the root a real hand carries. Assumed: the moment before the first pull stays with the cloud routine prompt, since no leaf stands there.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change takes the first road the ask names: the note rides every leaf where its env binds
- the cleanup it reveals, two fixtures lacking a root, rides in the change
- the rule stands once, in the comment on resolved, pointing at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
