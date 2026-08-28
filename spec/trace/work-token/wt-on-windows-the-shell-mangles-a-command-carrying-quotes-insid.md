---
id: wt-on-windows-the-shell-mangles-a-command-carrying-quotes-insid
type: "[[work]]"
statement: "On Windows the shell mangles a command carrying quotes inside quotes, and the engine hands the string straight through without looking at it. The spawning function is twelve lines and does nothing else. Neither repair the owner named exists: no escaping, and no spilling the command to a temporary file and running that. The only advice anywhere is a card telling the author to write the file by hand, which puts the work on the caller for something the engine could do once."
place: i39-the-lane-tells-the-truth-about-itself-de
ready_when: "ready when an engine round takes the shell verb — on Windows, a command carrying a nested quote is spilled to a temporary script and run from there, and the answer says it was spilled"
source: "note-398f7d55ab1c"
---

## Why it stands

On Windows the shell mangles a command carrying quotes inside quotes, and the engine hands the string straight through without looking at it. The spawning function is twelve lines and does nothing else. Neither repair the owner named exists: no escaping, and no spilling the command to a temporary file and running that. The only advice anywhere is a card telling the author to write the file by hand, which puts the work on the caller for something the engine could do once.

## When it comes back

ready when an engine round takes the shell verb — on Windows, a command carrying a nested quote is spilled to a temporary script and run from there, and the answer says it was spilled
