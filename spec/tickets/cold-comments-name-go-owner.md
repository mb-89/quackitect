---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: probes-leave-node/gate
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
group: javascript-leaves
parent: probes-leave-node
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: ecb025199749f6ebc3bc2963c2e85e7aef5fd34e
    hash_after: ecb025199749f6ebc3bc2963c2e85e7aef5fd34e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   78.9  in all"
    inputs:
      - name: ask
        hash: 74a2347c13eab846
        size: 338
    def: d515cfd5f58dfdeb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`src/quack/probe_cold.go` says its numbers and the cold prompt stand `as probe-cold.js` and `COLD.prompt in src/scripts/probe-cold.js` name them, and the `coldPath` comment moving from `commit.go` says the script owns `COLD_PATH`; each points at a deleted file once the scripts go, so the implement hand rewrites them to name the Go owner

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_cold_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cold probe's comments now name the Go file as the owner of its numbers, its prompt and its cold path. Each comment pointed at src/scripts/probe-cold.js, which leaves under probes-leave-node.

The cold path also drops its probe-cold.js entry. The Go verb runs the cold probe, and probe-dry.js alone imports the script, so a change to it starts no cold run. That entry kept the check red on TestTheColdPathNamesNoScriptOfItsOwn, a red case probes-leave-node wrote into a file its red list leaves out.

Assumed: probes-leave-node removes the script inside this group, so the comments stand true once the group merges.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change rewrites the two probe_cold.go comments and the commit.go cold path comment the ask names
- the cleanup it reveals, the stale cold path entry, lands in this change, since it held the check red
- each comment now points at the cold probe section of the level0 design note, and adds no fact of its own

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
