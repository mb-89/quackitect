---
kind: [[ticket]]
state: closed
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
step: do
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 23d68ac64299bc59a513a9a3169fe747feb3267c
    hash_after: 2adc87e058b4e609198f4fa22b2255b30cc37e09
    def: 56deac2301e48d9e
reason: done
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

src/modules/index/manager.go declares watchdog/beat and watchdog/lease through q.CfgIn, reads both off the store at start, and holds its lease or ticks at a new span where a commit moves either one. Its spanOf goes, so the Go spanOf stands in src/index/beats.go alone. The find verb also answers a spanOf in the JavaScript engine, a separate function. Surprise one: a catalog name takes lowercase segments alone, so the keys read watchdog/beat, and src/modules/config now reads the segments of a key as nested members, and spells its variable with dots. Surprise two: the import rule refuses a module case importing another module, so the override case stands in src/quack/manager_test.go, and the module case seeds config/values straight. Surprise three: the door starts the watch after the manager, so a span read once at start never meets the files.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
