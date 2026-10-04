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
    hand: box f5bd7e8a1f6e · claude-code-remote
    hash_before: 52ee7c48223532e8d38fba024cac1607d3796f2d
    hash_after: 52ee7c48223532e8d38fba024cac1607d3796f2d
    answered:
      - name: tests
        exit: 0
        said: green, 83 test(s) pass in 6 file(s)
      - name: check
        exit: 0
        said: "   86.5  in all"
    inputs:
      - name: ask
        hash: 56e416af64659b9c
        size: 777
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Every push and every hand-back waits on `./RUNME.sh check`, so its length sets the pace of all work. The level zero dry probe costs the most part on every run, and it spends most of its span waiting on the processes it starts. The battery runs it beside the parts after the tests, so its wait overlaps theirs.

- gain: a check spends the dry probe's span once beside the go and rules parts, and a push waits on the slower of the two
- breaks: every check pays the probe's wait on top of every other part
- done_when: `./RUNME.sh test test/level0/cli-stamp.test.js test/level0/check-server.test.js test/level0/battery.test.js` passes
- done_when: `./RUNME.sh check` twice on one box, and the second run's `battery.total` in `.se/.runtime/check.json` reads under its sum of parts

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/cli-stamp.test.js test/level0/battery.test.js test/level0/check-server.test.js test/level0/probe-dry.test.js test/level0/probe-cold.test.js test/contract/cli-verbs.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check ran its parts one after another, and the level zero dry probe cost the most part on every run while it mostly waited on its processes. Now the probe starts once the tests end and runs beside the go, doors, projections, plugin, server and rules parts, in a process of its own. The battery waits for it before it stamps, and its red reads red. The probe's clone commits the working change, so a check over a dirty tree no longer reads level zero red.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: level zero runs beside the parts after the tests, and the stamp's total reads under the sum of its parts
- the cleanup it reveals: the dirty-tree red in the dry probe is in the change, since the overlap measured red without it
- every fact stands once: the word --working lives in WORKING in probe-dry.js, and deltaOf moved beside the probe

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The measure, on a cloud box with four cores, on origin/main at the merge of #87.

The check's parts, in seconds, from `.se/.runtime/check.json`:

| part | first run, the binary rebuilt | second run, nothing changed |
|---|---|---|
| tests | 45.2 | 20.2 |
| go | 38.2 | 4.5 |
| level0 | 27.3 | 28.9 |
| rules | 6.5 | 6.5 |
| plugin | 1.0 | 1.0 |
| in all | 118.4 | 61.3 |
| wall time of `./RUNME.sh check` | 129.7 | 62.4 |

A run beside a run reads differently, for three causes:

- `go test` keeps a package's result while its inputs stand, so the go part costs seconds on an unchanged tree and the full test time after a Go change.
- The first run rebuilt the index binary, and the live index restarted on it while the tests ran.
- The parts run one after another, so every part's time adds into the total.

The Go part after a change, per package, in seconds:

| package | package time | sum of its cases |
|---|---|---|
| src/quack | 21.1 | 18.3 over 157 cases, none parallel |
| src/index | 10.5 | 9.5 over 119 cases |
| src/imports | 8.9 | 5.4 over 21 cases |

The slowest test cases in `.se/.runtime/tests.jsonl` sit near two seconds each, so no single case dominates the tests part.

The level0 dry probe costs the most on every run, and nothing caches it. It goes first.

The calls I took, with nobody to ask:

- Level zero starts after the tests, not with them. The probe's install builds Go in its clone, and that load landing on the contract cases risks the flicker [[spec/tickets/the-battery-flickers-under-load]] fixed. Starting it with the tests would save the tests' span again, and costs that risk.
- A first try ran the probe inside the check's own process, and the total held still while the probe slowed. The probe waits on synchronous spawns, which hold the loop, so it runs apart now.
- The same try read red: the probe over a dirty tree failed its clear, on main as well. The clone commits the change now.

The check after the change, on the same box, in seconds:

| part | first run, Go tests rerun | second run, nothing changed |
|---|---|---|
| level0 | 34.6 | 31.0 |
| go | 32.7 | 5.0 |
| tests | 20.4 | 20.6 |
| rules | 6.5 | 7.1 |
| in all, the battery's span | 61.4 | 51.5 |
| sum of the parts | 97.0 | 66.8 |
| wall time of `./RUNME.sh check` | 62.4 | 53.0 |

The work on the check's span stops here, since the check stands near a minute on this box. The battery's span now reads as the tests, then the slower of two roads: the dry probe, or the go and rules parts.

The roads left, and why each waits:

| road | saves | why it waits |
|---|---|---|
| the dry probe starts with the tests | the tests' span, on a run where Go changes nothing | the probe's install builds Go in its clone, and that load lands on the contract cases reading a clock, the flicker [[spec/tickets/the-battery-flickers-under-load]] fixed |
| the cases in `src/quack` run in parallel | most of that package's span, after a Go change alone | the dry probe bounds that run anyway, so the battery gains a few seconds, and every case sharing a working folder or a variable needs proof first |
| the probe's install builds both binaries at once | a few seconds a run | small beside the risk of a change to the install every fresh box walks |

What stands inherent: the dry probe is the one contract test of the start road. It clones the tree, installs, starts a cold index over the whole tree, and runs three verbs. Each of those is the door it proves.

The first check after a binary rebuild reads slower, because the live index restarts on the new binary while the tests run. That run is the box's own, and no check change shortens it.
