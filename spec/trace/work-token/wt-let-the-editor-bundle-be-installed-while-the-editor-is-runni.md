---
id: wt-let-the-editor-bundle-be-installed-while-the-editor-is-runni
type: "[[work]]"
statement: "Let the editor bundle be installed while the editor is running. The install wipes its destination folder from empty first, and the editor holds a lock on it, so the step throws and the served copy stays old. The wipe exists for a real reason: a deleted source file has to leave the install too. Fix it per entry, or diff instead of wiping, and say plainly that the window must be reloaded after."
place: backlog
ready_when: ready when a building milestone pulls hygiene work
source: note-db9a081c4d4a
---

## Why it stands

Let the editor bundle be installed while the editor is running. The install wipes its destination folder from empty first, and the editor holds a lock on it, so the step throws and the served copy stays old. The wipe exists for a real reason: a deleted source file has to leave the install too. Fix it per entry, or diff instead of wiping, and say plainly that the window must be reloaded after.

## When it comes back

ready when somebody next touches the build script, which is where the failing step lives
