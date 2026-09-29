---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/standard]]
group: tui-shell-lands-in-shadow
step: do
---

# Ask

The model puts the renderers inside the `ioonly` analyzer, and `isCore` in `src/imports/imports.go` holds `src/q` alone today. Each renderer below reaches the outside through its `door.go`:

- `src/tui`
- `src/tui/frame`
- `src/tui/log`
- `src/tui/work`

Each renderer reads what it draws off the index, and the analyzer holds `src/tui` under the same rule as the core.

A renderer then draws the same frame on every box, and its tests need no outside.

Without it, a renderer can read a file or a process outside the index, and the check stays green.

- `isCore` holds the renderers, and `go vet` with the analyzers passes over the tree
- a case adds an `os` import to a renderer, and reads the analyzer refuse it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
