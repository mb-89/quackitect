---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-slow-door-spawns-no-second-index/gate
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
group: lsp-door-switches-over
parent: one-index-a-tree
record:
  - step: do
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: e3636ee4584c3f4f532c96843e90049c6a2f16fe
    hash_after: e3636ee4584c3f4f532c96843e90049c6a2f16fe
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/modules/lsp passes
      - name: check
        exit: 0
        said: "spec/tickets/reaches-keeps-the-post-fault.md:82:5: Vocabulary: goroutine stands outside the words this tree writes. Writ"
    inputs:
      - name: ask
        hash: ee4c8b9ecf174aa2
        size: 103
    def: 9d58ba8865b10225
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

In reaches the inner err shadows the post fault. The builder names it apart and tests it for a timeout.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/index/reach_test.go src/modules/lsp/lsp_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The post fault in reaches gets its own name, and a timeout returns it with no spawn. Two more faults kept the check red, and the change fixes both. A claim file in starts lets one caller spawn the index. The lsp writes lets its lock go for the buffer commit, so the commit hook no longer waits on it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the discussion says why the change departs from the ask
the cleanup rides in the change: the binary choice moves to binary.go, so door.go stands under the ceiling
the post wait stands once, as postWait in the const block of src/index/main.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The change departs from the ask twice, because the check stayed red with the post fault alone.

| the fault | the fix |
|---|---|
| callers racing a start each spawn an index | a claim file in `starts`, so one caller spawns and the rest wait |
| the lsp `Handle` holds its lock through the buffer commit, and the commit hook republishes under that lock | `writes` lets the lock go for the commit |

The goroutine dump of the hung index shows the second: every settle waits on a wave, and the wave waits in `Republish`.
