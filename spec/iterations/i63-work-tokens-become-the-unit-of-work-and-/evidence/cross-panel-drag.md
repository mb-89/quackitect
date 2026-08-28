---
form: cross-panel-drag
by: agent
signed_off: 2026-08-26T14:16:58.958Z
authors: agent
files: null
---

# Evidence form / cross-panel-drag

## current_situation

The register entry asks whether a row can be dragged out of the editor panel and dropped on the state machine panel. That is not the drag this design needs.

THE DESIGN'S DRAG IS INSIDE ONE EDITOR. The bucket editor has two panes side by side and a row moves between them. Two panes of one editor render together, so that gesture crosses nothing.

THE EXTENSION'S SURFACES ARE GENUINELY SEPARATE. Three view providers and two panels, each its own document. A gesture spanning two of THOSE is the risky one.

AND NO GOAL ASKS FOR IT. Goal eleven says clicking a count opens the editor. Clicking, not dragging.

## built

- exp-can-a-drag-cross-two-panels

## follow_up

The bucket editor's pane-to-pane drag proceeds as ordinary work, inside one webview, with no spike owed and nothing blocking it.

The cross-surface drag belongs to a later record, and it starts by reading the vendor's API documentation rather than by building. Nothing this record ships depends on the answer.

ONE THING IS HONESTLY NOT ESTABLISHED and is recorded as not established: whether two webviews can exchange a drag at all. The documentation was not read, so the experiment asserts only what the code shows, which is that they are separate documents.

THE TIMEBOX WAS A DAY AND WAS NOT SPENT. The question resolved once the two gestures were told apart. The remaining hours would have bought a prototype of something no goal asks for, and that is worth saying rather than filling the box.

## anything_else

