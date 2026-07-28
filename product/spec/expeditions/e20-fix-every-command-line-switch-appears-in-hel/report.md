---
form: expedition-leave
status: done
authored_by: the driving agent, on the owner's explicit instruction to close e20 and name them as the override (2026-07-28)
files: []
---

# e20 — the launcher, the mirror, and what a drawing is allowed to decide

## What was the goal

Two defects in the way a session starts, bundled into one vehicle.

- EVERY COMMAND-LINE SWITCH SHOULD APPEAR IN HELP. `--one-screen` was RUNME's
  own flag, and RUNME's help forwarded to the server's help, which had never
  heard of it. The flag was undiscoverable.
- THE ONE-SCREEN LAUNCH SHOULD SURVIVE ITS WINDOW CLOSING. The terminal host
  ran in the foreground of the launching window. Closing that window killed
  the agent inside it, which had already destroyed one real session.

The expedition then stayed open across three sessions and took on the mirror
work the owner raised while looking at the result. That drift is deliberate and
was the owner's instruction — too many expeditions were being opened.

## What was done

### The help rule became a test

Every entry point's help text is now checked against the flags that entry point
actually parses. `product/deliverable/tests/help.test.ts` reads the switches out
of the source, runs the entry point with `--help`, and demands each one in the
output. It found four real gaps on its first run. `se-pty.ts` had no `--help` at
all and was in scope.

The rule is a test rather than a sentence in a document, which is the general
form the owner asked for.

### The launch detaches

`--one-screen` starts the terminal host as a background process, so the window
that started the session can be closed. Two guards ride it.

- It is SKIPPED when no pseudo-terminal binding is installed. Without one the
  agent would have no terminal at all, and a detached session nobody can type
  into is worse than a window that must stay open.
- It REFUSES when a host already answers on the port, rather than spawning a
  second one that dies unseen.

### The mirror keeps the reader's layout

Pane sizes now survive a page load. Walking into a sub-state is a full page
load, and a dragged width is an inline style, which no page load survives. The
size is stored on release and restored on load.

The left column was sized by the terminal inside it: 650px is 80 columns at the
widest a 13px monospace cell gets, plus the scrollbar. The width and the column
count are one decision, not two.

The sidebar's default is 465px, which is where the owner settled it by dragging.

### A box is sized by the text it shows

The worst defect of the three, and the last found. A generated expedition's box
was 10793 pixels wide in order to display 48 characters.

- The birth size measured the WHOLE subtitle. For a generated expedition that
  subtitle is the entire goal statement, about a thousand characters.
- The drawing painted only the first 48 of them.
- The owner could not correct it in Obsidian, because the node is regenerated
  on every render.

One shortening now feeds both the size and the drawing. The expedition row
geometry followed, because its numbers were hand-tuned for a birth size that had
since been struck.

### The end is shown, not guessed

Quitting at the console left a mirror that looked perfectly alive. Three faults
sat on top of each other.

- The page tried to CLOSE ITS OWN TAB. Browsers that obeyed showed nothing;
  browsers that refused fell through to a message nobody waited for.
- A dropped link sat SILENT FOR TWENTY SECONDS before saying anything.
- Every way of stopping shared ONE SENTENCE, which blamed an end the walk had
  never reached.

The window now stays open, a dropped link says so immediately, and the three
ways a session can stop read differently. The quit itself is ANNOUNCED over the
lane rather than inferred from silence — the engine learns of it when stdin
closes, which is before any watcher could notice.

## What settled it

EVIDENCE, in the order it decided things.

- THE HELP GAPS were settled by the test failing on four real entry points, not
  by reading the sources and judging them complete.
- THE BOX WIDTH was settled by measuring the live drawing rather than reasoning
  about the code. Reading the SVG out of the running mirror returned a rect
  10793 pixels wide next to a subtitle cut at 48 characters. That single
  measurement identified the defect precisely and ended the guessing.
- THE SIDEBAR WIDTH was settled by reading the value the owner had dragged to
  out of the live mirror's stored pane sizes: 465. It was not chosen.
- THE STALE WORKTREE was caught because the measured behaviour did not match
  the code in hand. The worktree stood three commits behind trunk, and one of
  those commits had rewritten the very sizing code this expedition came to
  edit. Editing without checking would have revived deleted code.
- THE WHOLE SUITE is green: preflight passes and 139 tests pass, 0 fail.
- FOUR NEW TESTS pin the rulings that would otherwise decay into comments —
  two in `sizing.test.ts` for the width cap and the shared shortening, two in
  `mirror-contract.test.ts` for the shown end and the separate quit signal.

## What was not done

- THE QUIT FIX WAS NEVER OBSERVED WORKING. A session holds the engine it booted
  with, so the session that built it still ran the old code at its own quit. The
  next launch is the first real proof. This is stated at the top of the
  handover.
- THE DETACH PATH STILL HAS NO TEST. Proving it needs real detached processes
  and a terminal binding, which is flaky across machines. The owner's launch is
  the only proof it gets.
- THE 560px WIDTH CEILING IS UNCONFIRMED. The owner asked for "something
  reasonable, let's hundred pixels". A hundred pixels is below the 200px floor,
  so it was read as a dictation slip and 560 was chosen, because that is where
  the 48-character rule naturally lands. The number is one line to change.
- THE CANVAS COMPACTOR WAS BUILT AND THEN STRUCK. It clustered, squeezed and
  pulled drawings to centre, and it was never run on a real canvas. The owner
  struck it mid-session, and trunk deleted it along with its two test files.
  Nothing about compaction is pending.
- THE EXPEDITION-SYNC LANE TOOL is still missing. There is no merge in
  `se_git`, so syncing the worktree and publishing to trunk both went through
  plain git. `note-d0856ad73654` carries it.
