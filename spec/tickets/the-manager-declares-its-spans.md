---
kind: [[ticket]]
state: draft
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/standard]]
group: the-foundation-closes-its-gaps
---

# Ask

`spanOf` stands twice, in `src/index/beats.go` and in `src/modules/index/manager.go`, since neither package imports the other. The manager reads `watchdog.beat` and `watchdog.lease` off the files at start.

The config module now resolves each declared key off its layers. The manager declares both spans through `q.CfgIn`, and reads them as inputs, so its copy of `spanOf` goes.

A span then takes every layer a key takes, a context and an override among them, and one reader owns the rule.

Without it, the two copies drift, and the manager's spans ignore the environment, contexts and overrides.

- `spanOf` stands in one file of the tree, which `./RUNME.sh find spanOf` decides
- a case sets `watchdog.beat` through an override, and reads the manager tick at that span
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
