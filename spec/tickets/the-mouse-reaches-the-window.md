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
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 3d9ef46d62b71ff6800fd2ffd133bdf841b215b6
    hash_after: e65c65de3753b20f593af4454fe3cfcda7db182b
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: 65 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A person reads what the mouse does to a window drawn in the terminal they work
in. The window design asks for a click on a tab, a click on a header to sort,
and a drag on a column edge. Only a person at that terminal answers whether
those land.

Without it the design output guesses. A box in the cloud runs no terminal. So
the mouse stays untested until a person tries it, and the keys carry every move
meanwhile.

- a person runs `./RUNME.sh log` in the editor's terminal, clicks a row, and says whether the click lands
- the same person clicks the header line and says whether the click lands
- the same person holds a drag across a column edge and says whether the motion arrives
- the answer stands in this ticket's Discussion, one line a case

# do

<!-- makes the change, with the test that covers it -->

## tests

    (cd src/viewer && go test ./...) > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

The window asks the terminal for the mouse, and five tests hold what each event reaches.

`main.go` builds the program with `tea.WithMouseCellMotion()` beside the alt screen, so the terminal reports a press, a drag and the wheel. `ui.go` hands a `tea.MouseMsg` to `mouse.go`, which is the one place reading where an event lands:

| the event | what it reaches |
|---|---|
| a press on row 0 | the tab under it, or the help at the strip's right end |
| a press on a list row | that row, as the selection |
| the wheel over the list | the log, three rows a notch |
| the wheel over the open pane | the pane's own scroll |
| any event while the filter takes letters | nothing, so typing stands undisturbed |

The new file reads the geometry the window already holds, so the split moves and the mouse follows it:

| what it reads | where it comes from |
|---|---|
| `firstRow()` | `headWide` and `namesWide` |
| `overPane` | `listWidth()` |

Two names moved so one fact stands in one place. `helpKey` names the strip's right-hand key, which `renderStrip` draws and `pressStrip` measures. `tabName` builds a tab's text, which `renderStrip` draws and `tabAt` measures.

The cost stands in the Discussion: a window holding the mouse takes the terminal's text selection.

## checked

- the change follows the ask. The Discussion carries the owner's reading, and the owner then asked for the mouse itself.
- the cleanup stands in the change. The strip held two literals, and the hit tests would have copied both.
- every fact stands in one place. `mouse.go` holds where an event lands, reading the geometry from `ui.go`.

# Discussion

The owner ran the window and read each case. The mouse reached nothing, in the editor's terminal and in a standalone window alike.

| case | what the owner did | what the owner read |
|---|---|---|
| 1 | clicked a row | the click lands nowhere |
| 2 | clicked the header line | the click lands nowhere |
| 3 | dragged across a column edge | the motion arrives nowhere |
| 4 | pressed `q` | the window quits |

Two facts in the code stood behind that reading, and either one alone accounts for it:

| the fact | where it stood |
|---|---|
| `main.go` built the program with `tea.WithAltScreen()` alone, so the window asked the terminal for no mouse event | `src/viewer/main.go` |
| no file under `src/viewer` named `MouseMsg`, so an arriving event met no hand | `src/viewer` |

Bubble Tea reports the mouse where the program asks with `WithMouseCellMotion` or `WithAllMotion`, and the window asked with neither. The terminal was answering correctly the whole time.

The owner asked for the mouse, and named the work editor as where it pays. So this ticket turns from a reading into the change, and `src/viewer/mouse.go` carries it.

One cost rides with it. A window holding the mouse takes the terminal's own text selection, so a drag marks rows. Most terminals give the selection back under a held shift.
