---
kind: [[ticket]]
state: closed
urgent: true
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-tree-names-its-things
step: do
record:
  - step: do
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 4bff5917bfbdb3d848e8d465c65d28481c2234cf
    hash_after: 4bff5917bfbdb3d848e8d465c65d28481c2234cf
    answered:
      - name: tests
        exit: 0
        said: green, src/viewer passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

The tree view takes its columns from whoever builds it. The design input asks
for a declaration, in the base format the vaults write, so a folder under
`spec` holds the views. [[spec/design_input/the-tree-view-editor]]

The gain is a view that costs a file. A person adds a view, moves a column or
narrows a set of rows by writing the file, and no Go changes.

Without it every view stands in code. A person then waits on a build to see a
column move, and the views spread over the tabs that draw them.

- a file names several views, each with its columns and their room
- a view's own key wins over the file's, and the tests join with `and`
- a file saying too little answers the one reason it reads no view
- `go -C src/viewer test ./...` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test src/viewer/base_test.go

## check

    ./RUNME.sh check

## says

`ReadBase` reads a base file and answers its views. A view carries its columns,
their room, what it nests by, what stands collapsed, the tests a row passes and
what a click opens. A view's own key wins over the file's, and the tests join
with `and`. So the file says what a row is, and a view narrows it.

Reading it wants the YAML reader, which stood inside the server's module and
reached no other. `src/yaml` now holds that reader as a module of its own, and
the server and the viewer both take it. So one subset stands, and no module
copies it.

Two things follow the move. The viewer's stamp hashes every folder it builds
from, so a change in the shared module rebuilds the binary. The check runs the
shared module's tests beside the viewer's.

## checked

- the change follows the ask: a file says the view, in the format the design input names
- the cleanup it reveals: the YAML reader moves out of the server's module. The stamp and the check follow it
- the reader stands in one module, and both notes point at it

# Discussion

`groups`, `counts` and `sort` stand in the format, and the reader reads past
them. Each waits for the ticket that uses it.

No tab reads a file yet, because the folder of views and the source of items
both wait for the work browser.
