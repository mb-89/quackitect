---
kind: [[ticket]]
state: closed
step: do
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
group: the-foundation-closes-its-gaps
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: f25df542d668cb14f74135db2ddcff8d84c5eac5
    hash_after: f25df542d668cb14f74135db2ddcff8d84c5eac5
    def: 56deac2301e48d9e
reason: done
---

# Ask

The tickets come off the tickets module the wiring loads, and a tree with no `spec/wiring.yaml` loads none. A project the vehicle drives carries no wiring file today, so its index answers no ticket. `the-foundation-closes-its-gaps` met it once `tickets-becomes-a-module` closed.

The owner decides the road:

- a built-in wiring the index loads where a tree carries none
- the stub copying the wiring file into each project it drives

- a driven project's work tab and badge read no ticket
- `./RUNME.sh stub` writes a project that loads the manager alone

- a case starts the index over a driven tree, and reads its tickets
- `./RUNME.sh check` exits 0

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->
<!-- the form is text -->

A tree with no `spec/wiring.yaml` now loads its vehicle's file. `wired` in `src/quack/main.go` reads the work root's file first, then the file of the vehicle whose runtime bin folder holds the index binary. A binary anywhere else loads nothing, as before. The box decided the question, as the cloud guidance asks: the built-in road keeps `spec/wiring.yaml` the one place that knows the layout, where a stub copy would need an edit per project for each new module. `TestATreeWithNoWiringLoadsTheVehicleWiring` builds into a vehicle layout and reads `tickets/all` loaded, and the empty-tree case now reads `TestAnIndexReachingNoWiringLoadsTheManagerAlone`. What surprised: the earlier door change had pushed `src/index/door.go` past the file ceiling, so `answers` moves to `src/index/answers.go` with a case of its own, and the `os` seams stay in the door. Two successor names held six words, and each took a shorter name.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
