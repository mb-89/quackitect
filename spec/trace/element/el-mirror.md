---
minted_in: i1
id: el-mirror
type: "[[element]]"
statement: Shows where the machine stands — the drawing, the forms, the feed — and walks a newcomer through what actually exists, ending at the desk.
kind: existing
realization: make
group: the-account
implements:
  - fn-run-a-governed-walk.show-where-it-stands
  - fn-run-a-governed-walk.teach-the-newcomer
  - fn-run-a-governed-walk.work-the-register
source_refs:
  - req-the-work-editor-needs-no-new-instruction
  - "owner clarification 2026-08-26: the token is markdown, the bucket editor is ours to build"
  - req-oversized-results-remain-recoverable-through-the-lane
  - req-stop-hook-yields-only-at-a-machine-stop
  - req-interrupted-call-names-the-stopping-layer
  - cand-thin-worktree
---

The one surface a person looks at: the machine drawing, the evidence forms,
the live register tables, the note inbox, the archive, the tour, and the BUCKET
EDITOR that puts pieces of work into buckets. It renders what the engine holds
and never advances the walk.

## The bucket editor is a surface that writes, and it is the first one

TWO EDITORS EXIST FOR WORK AND ONLY ONE IS HERE (owner, 2026-08-26). A work
token's BODY is markdown and opens in whatever opens markdown, so this element
draws nothing for it. The BUCKET EDITOR is the one we build.

WHAT IT DRAWS comes from the work offer: what a position owes per slot, and what
is ready for a hand to take.

WHAT A MOVE DOES goes to the work store over [[if-mirror-to-work-store]], because
the store is the only element that writes a piece of work. Dragging a row is a
request rather than a write.

THIS IS THE FIRST SURFACE THAT WRITES WORK AT ALL, and that is why the crossing
is new. Every surface before it drew and did not write.

RENDERING NEVER ADVANCES THE WALK, and a move is not an advance. Where a piece
of work sits is not where the walk stands.

Boundary: the interfaces the element matrix mints for its flows.

Realization: the mirror server and the panel.

## Superseded by i4

TWO REALIZATIONS BECOME ONE. The mirror server goes and the editor panel
stays. Everything this element shows is drawn by the surviving surface or
dropped with a signed reason, one widget at a time.

IT NO LONGER DERIVES WHAT IT SHOWS. el-view-resolver computes the whole view
and this element draws it, so what a person reads and what the engine holds
are the same object rather than two agreeing ones.

NOTHING ELSE MAY DRAW. el-widget-guard refuses any module outside the one
entry point that emits widget markup.

THE NAME IS NOW WRONG and is left alone deliberately. Renaming an element is
not this round's work, and a rename with no other change would cost every
reference for nothing.

Decided at raid-the-surface-repeats-a-computed-view-behind-a-guard.
