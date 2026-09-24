---
kind: [[guidance]]
scope: ["refactor: the hand a session starts to drain the warnings"]
rationale: [[spec/rationales/refactoring]]
---

# Actionables

1. Work the one file the engine hands you, and leave every other file alone. The session beside you holds them.
2. Run `./RUNME.sh lint <file>` first, and `./RUNME.sh fix <file>` for what a program fixes.
3. Fix what the rules name, and change what they pass nowhere. A rewording nobody wants costs the reader a read.
4. Keep the meaning the line carries. A rule names the shape, and the shape serves what the line says.
5. Stage nothing and push nothing. The session beside you lands what you leave.
6. Call `mcp__level0__refactor_next` once a file stands clean, and take the file it hands you. End once it answers that no file waits.
7. Write what stands after you, where a rule outlives your hand. The next hand takes the file from there.
