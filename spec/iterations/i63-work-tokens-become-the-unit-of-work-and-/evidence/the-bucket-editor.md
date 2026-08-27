---
form: the-bucket-editor
by: agent
signed_off: 2026-08-26T15:59:12.543Z
authors: agent
files:
---

# Evidence form / the-bucket-editor

## current_situation

The work card rendered rows and nothing could be done with them. No bucket folded, no row moved, and nothing could be added by hand.

The design names four things as genuinely new, and says so plainly so nobody promises reuse that is not there.

- Grouping rows into buckets, and folding a bucket by its header.
- Two panes side by side.
- Dragging a row from one pane to the other.
- A plus that mints a piece of work from a template.

### Two of the four were already standing

The two panes and the bucket grouping came with the previous chunk. Each position renders two buckets, one per slot.

WHAT WAS MISSING was the behaviour: folding, the drag, the reveal, and the plus.

### An owner ruling arrived mid-chunk and is built

IN EMERGENCY THE WALK MOVES WHEREVER IT WANTS, independent of what work stands open. Work must never hold a transition while emergency is armed.

IT FITS WHAT EMERGENCY ALREADY IS. The engine describes it as every tool being legal in every state, so a work gate surviving it would be a second cage the same switch does not open.

## built

ONE CLIENT SCRIPT, TWO ROUTES, AND THE STYLE THAT REVEALS A BUCKET.

### The client

`deliverable/engine/workclient.ts`. Document-level listeners and `closest`, which is the same shape the column reorder already uses. Inside one document there is nothing exotic about a drag, and that is the whole reason the two surfaces share a document.

It is served on BOTH pages that show the card: the card grid and the expanded widget.

### Folding, and the reader keeps their place

Clicking a bucket's header folds it. The state is remembered per position and per slot, so a redraw does not undo it.

EVERY READ AND WRITE OF THAT MEMORY IS GUARDED. A private window keeps nothing, and a throw there would take the whole script down.

A CLICK ON THE PLUS IS NOT A CLICK ON THE HEADER. Without that one line, adding work would fold the bucket you were adding to.

### The drag

A row is picked up. A state in the drawing is what it lands on, matched as `g.clickable[data-detail^="state:"]`, which is what the machine already draws.

THE REVEAL IS THE PART WITH NO PRECEDENT. An empty bucket is hidden the rest of the time and appears while a row is in the air. Without it the one place the row most wants to go is the one place it cannot see.

BOTH ENDINGS CLEAR THE REVEAL. A drop and a cancelled drag, and a case counts them, because clearing only on the drop would leave the card revealed forever after an escape.

### A move is a request, never a write by the surface

The drop NAMES the move. `/work/move` calls the work store, which is the only module that writes a piece of work.

A REFUSED MOVE SAYS WHY. The row is exactly where it was and the engine's own reason is shown. A row snapping back with nothing said is the failure the design names.

### The plus

A plus per bucket opens a one-line input in that bucket. Enter mints, escape drops it.

NO BROWSER DIALOG. `prompt()` is a browser affordance and the surface is the editor panel.

THE SLOT DECIDES THE SOURCE. The take-in bucket mints a reading; the produce bucket mints a hand-added item. That keeps the slot derived from the source rather than stored beside it.

AN UNNAMED PIECE OF WORK IS REFUSED, because one nobody named cannot be judged later.

### Emergency lifts the work gate

`leavingHeldBy(home, position, emergency)` in the offer. With emergency armed it never holds, and it STILL REPORTS what is open — lifting a gate is not hiding what was behind it, and a person reaching for emergency should see what they are moving past.

Four cases hold it, including that the open list survives the lift.

### What the tests prove, and what they deliberately do not

`deliverable/tests/bucket-editor.test.ts`, 14 cases.

THE DRAG ITSELF IS DEMONSTRATED, NOT TESTED. Its spec is a demonstration because whether a person can steer by dragging is a thing a person judges.

WHAT IS TESTED IS THE WIRE, and each case asserts BOTH ENDS. The payload the surface sends, and the field the engine reads back out of it. Two green halves are not a green wire.

ONE CASE ASSERTS THE SURFACE DOES NOT WRITE. The move route reaches the store's one writer and writes no file itself.

## follow_up

One chunk left: the corpus pass. It is the last and the biggest by volume.

### What the corpus pass owes

MARK THE REMAINING CARDS. 73 of 74 method cards are unmarked, and the format is proven on the two that disagree.

A MARKED LIST ITEM NEEDS A SHORT NAME on its opening line. That is per-item rework and it only bites on list-shaped cards, of which 7 carry five or more numbered items.

TWO WORD COLLISIONS ARE OWED THERE TOO. `token` names the walk's marker in 41 places, and `account` names the job account. Both are renames, and the list is recorded with its counts.

### Two things the owner named that outlive this record

WHETHER A STATE'S PILLS CAN CHANGE WITHOUT A WHOLE-PAGE REDRAW is unanswered. The surface redraws by navigating today, which is not a pill moving.

THE FIRST RECORD DRIVEN UNDER THIS MODEL is where that shows, along with whatever else does not work on a first run. Both are recorded with that moment as the ready-when.

### One red still stands at HEAD

The read-once guard, measured and recorded, waiting for `fix-findings`. Its fix has an order and the note carries it: find the per-node cause first, then reshape the ceiling with both terms measured.

## anything_else

THREE GUARDS REFUSED THIS CHUNK AND EACH NAMED A REAL FAULT. Two were rules I had just quoted at myself, which is worth recording as a shape rather than as three incidents.

### The page must morph, not reload

`mirror-contract.test.ts` counts the sanctioned reloads and allows exactly two. My client added a third as a fallback.

A RELOAD THROWS AWAY THE READER'S PLACE. The scroll, the open details pane, the machine's zoom. That is the rule the whole surface is built on and I broke it in a fallback branch nobody would have looked at.

WITH NO MORPH AVAILABLE IT NOW SAYS SO. The move went through and the card will show it when reopened, which is honest rather than destructive.

A CASE HOLDS IT, so the fallback cannot come back.

### The comment rule bit twice, in two trees

The engine tree stands at ZERO comment lines carrying a date or an owner attribution. I added one, writing down the ruling that had just arrived.

THE REASONING BELONGS IN THE DESIGN DOCUMENT and the code carries a pointer. So the ruling moved into the offer's design spec and the comment became one line naming its section.

THE TESTS TREE ROSE BY ONE the same way, for the same sentence.

### The shape, said once

I WROTE THE RULING DOWN WHERE I WAS STANDING rather than where it belonged. Both comment failures are that, and the reload was the same move: solving the problem in front of me rather than in the place that owns it.

THE GUARDS ARE WHAT CAUGHT IT, not review. Three mechanical checks, three real faults, and the tree stands at 1974 cases.
