---
kind: [[ticket]]
state: open
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
group: the-index-stops-its-tools
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The lsp IO module runs Vale over the whole tree each time an index starts, and the run takes a minute or two of one core. A stop of the index leaves that run going, its parent gone, until it ends on its own. So every contract case and probe starting an index on a full tree leaves a whole-tree lint behind, and the rest of the check runs beside it on fewer cores.

- gain: a stopped index takes its tool runs down with it, so the check's later parts get the box's cores back
- breaks: each index start and stop on a full tree costs the box a core for minutes after the stop, and the slow cases slow further
- done_when: `./RUNME.sh branch test src/modules/lsp/door_test.go` passes a case where a halt ends a running tool at once
- done_when: after `./RUNME.sh index standing` and a stop over a copy of the tree, no Vale process of that copy stands
- done_when: `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The measure, on a cloud box with four cores, over a copy of the full tree.

The check on origin/main, its parts in seconds:

| part | first run, cold caches | after this ticket |
|---|---|---|
| go | 52.2 | 40.4 |
| tests | 33.7 | 31.6 |
| rules | 32.1 | 6.2 |
| level0 | 31.0 | 29.2 |
| in all | 150.2 | 109.1 |

The go part recompiles the packages a change touches, and the rules part reads Vale's cache, so a run beside a run differs by tens of seconds on this box.

A cold start of the index over the copy, `./RUNME.sh index standing`, then `./RUNME.sh index tickets`, in milliseconds:

| gap between spawns | standing | first tickets read |
|---|---|---|
| a quarter second | 3675 to 5085 | 16302 to 25286 |
| a short yield | 4143 to 4774 | 15249 to 27128 |

On the full tree the spawn gap moves nothing a reader sees. The first read waits on the modules' first computation over every ticket, and on the cores a whole-tree Vale run takes.

The calls I took, with nobody to ask:

- A stop call ended the process with a bare exit, so neither the tool runs nor the module processes took the door's stop. The call now wakes main as a signal does, and a bound ends the process where the stop hangs.
- The whole-tree Vale run at each start stays. It draws the rows of closed files in the owner's Problems panel, and a later sweep changes what the owner sees.
- Four Vale runs stood at once on this box during the measure, each left by a stopped index, each taking most of a core.
