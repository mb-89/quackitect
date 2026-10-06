---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: does the work the ask names, and says what came back
    by: person
    to: engine
    input: ask
    evidence:
      - name: result
        form: text
        says: what came back, which the step behind this one reads
  - name: follow
    does: carries the result into the tree, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: result
    needs: ["branch test"]
    checklist: ["the change follows the result, or the discussion says why it departs", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/person]]
process_hash: 781b200dbb69dec3
group: the-fleet-watches-itself
step: do
---

# Ask

<!-- work, as text: what the person does, why no box can do it, and the ticket the work comes from -->
<!-- commands, as list: every command the person runs, one a line, in order -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The owner stores the fleet routine on claude.ai, so one routine checks the fleet on a schedule. A box holds no claude.ai login, so no box stores a routine. The work comes from one-routine-checks-the-fleet.

1. Run `./RUNME.sh cloud trigger`, and copy the prompt it prints under `fleet_check`.
2. On claude.ai, open Routines, and create a routine named `fleet_check` in an environment on this repository. Set it to run hourly, and paste that prompt.
3. In `spec/config/level0.json`, add `"cloud": { "fleetRoutine": "<id>" }` with the routine's id, which opens on `trig_`. Commit it on `main` with `./RUNME.sh commit`, and push, so every box reads it.
4. Run `./RUNME.sh cloud trigger` again.

- `./RUNME.sh cloud trigger` prints `fleet_check checks the fleet on its schedule`, with the stored id.

# do

<!-- does the work the ask names, and says what came back -->

## result

<!-- what came back, which the step behind this one reads -->

<!-- the form is text -->

# follow

<!-- carries the result into the tree, with the test that covers it -->

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
