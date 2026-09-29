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
group: tui-shell-lands-in-shadow
step: do
record:
  - step: do
    hand: box d857a59424d7 · claude-code-remote
    hash_before: b729c476537f3ab0132a45d670d5e19126a253ce
    hash_after: b729c476537f3ab0132a45d670d5e19126a253ce
    def: 56deac2301e48d9e
reason: done
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

The ioonly analyzer now holds every package under src/tui through a second rule, drawOnly, beside the core rule: a renderer imports no os, os/exec, net or net/http outside its door.go, and its tests stand apart. The tree test reads the same rule through RendererFaults. The two net/http reaches that stood outside a door moved into work/door.go (postJSON) and a new registry/door.go (get), each with a test. A planted renderer case in the analyzer test names an os import beside the door and spares the door. It surprised me that the rule reads files and not packages, because the door.go files import os inside the same package.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
