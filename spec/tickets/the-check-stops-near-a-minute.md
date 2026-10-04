---
kind: [[ticket]]
state: draft
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
group: the-check-takes-a-minute
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The work on the check's span stops here, since the check stands near a minute on a cloud box. This ticket writes down why, and what a later hand reads before it cuts further.

- gain: a later hand starts from the measure and the calls, and spends no turn on a road this one weighed
- breaks: the next box measures again from nothing, and tries the road that loads the clock cases
- done_when: `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh check

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

No code changes. The Discussion holds the stop and the roads left, each with what it costs.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the stop and its reasons stand in the Discussion
- the cleanup it reveals: none
- every fact stands once: the measure stands in [[spec/tickets/the-check-takes-a-minute]], and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The measure before and after stands in [[spec/tickets/the-check-takes-a-minute]]. The battery's span now reads as the tests, then the slower of two roads: the dry probe, or the go and rules parts.

The roads left, and why each waits:

| road | saves | why it waits |
|---|---|---|
| the dry probe starts with the tests | the tests' span, on a run where Go changes nothing | the probe's install builds Go in its clone, and that load lands on the contract cases reading a clock, the flicker [[spec/tickets/the-battery-flickers-under-load]] fixed |
| the cases in `src/quack` run in parallel | most of that package's span, after a Go change alone | the dry probe bounds that run anyway, so the battery gains a few seconds, and every case sharing a working folder or a variable needs proof first |
| the probe's install builds both binaries at once | a few seconds a run | small beside the risk of a change to the install every fresh box walks |

What stands inherent: the dry probe is the one contract test of the start road. It clones the tree, installs, starts a cold index over the whole tree, and runs three verbs. Each of those is the door it proves.

The first check after a binary rebuild reads slower, because the live index restarts on the new binary while the tests run. That run is the box's own, and no check change shortens it.
