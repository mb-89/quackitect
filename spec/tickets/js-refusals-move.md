---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failures-and-the-sentinel/gate
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
group: failures-stand-registered
parent: failures-and-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 6b6fe1de41af7aeb1daa0e189596d03002c4c815
    hash_after: 6b6fe1de41af7aeb1daa0e189596d03002c4c815
    answered:
      - name: tests
        exit: 0
        said: green, 42 test(s) pass in 3 file(s); green, src/modules/hooks passes; green, src/modules/hooks/command passes; green, sr
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: a4415be199484601
        size: 157
    def: 16e0bdd9a976b893
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/scripts/pull.js deskRefused and src/bridge/bash.js deskRefusal keep their refusal text past the door, and the design note defers the twins with no ticket

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/bash-desk.test.js test/level0/commit-guards-cases.test.js test/level0/cloud-desk.test.js src/modules/hooks/commits_test.go src/modules/hooks/command/trunk_test.go src/failure/tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The desk guard now raises its refusal through the failure door, in both twins. The node desk-works-on-trunk carries the remedy. deskSaid in cloud.js and DeskSaid in the hooks command package build the message alone. The bash bridge raises through src/doors/failure.js, which writes the row. The Go hooks door raises through failure.Raise and answers the lines alone, since it decides in the bridge shadow. The shared commit cases seed the node and expect the door lines. The design note names the bash guard among the refusals that move, and says the JavaScript pull and work twins run under tests alone, which the note js-twins-retire parks.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the live twin moves through the door with its Go twin, which the shared cases hold to it, and the test-only twins stand named in the note
- the removal of the test-only twins is the note js-twins-retire, and the commit verb desk refusal in src/quack/commit.go stays for the last slice
- the remedy stands in spec/failures/desk-works-on-trunk.md, and the message in deskSaid and DeskSaid, the Go one pointing at the JavaScript one

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
