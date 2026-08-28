---
id: wt-make-the-engine-able-to-upgrade-itself-across-a-state-rename
type: "[[work]]"
statement: "Make the engine able to upgrade itself across a state rename. The running server refuses to restart onto new sources unless the position matches one literal name. A later version gave that position a different name, so an older server on a newer checkout can never meet its own condition, and the banner telling it to restart points at something that no longer exists. Two candidate fixes: decide by what a position IS for rather than by its spelling, or treat a version mismatch as authority to restart from anywhere. Either turns a dead session into a working one."
ready_when: ready when an engine round takes the server's own lifecycle, and before the next version bump that renames a position
source: note-ac97694379e5
---

## Why it stands

Make the engine able to upgrade itself across a state rename. The running server refuses to restart onto new sources unless the position matches one literal name. A later version gave that position a different name, so an older server on a newer checkout can never meet its own condition, and the banner telling it to restart points at something that no longer exists. Two candidate fixes: decide by what a position IS for rather than by its spelling, or treat a version mismatch as authority to restart from anywhere. Either turns a dead session into a working one.

## When it comes back

ready when an engine round takes the server's own lifecycle, and before the next version bump that renames a position
