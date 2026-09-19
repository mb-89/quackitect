---
kind: [[guidance]]
scope: ["refactor: the hand a session starts to drain the warnings"]
rationale: [[spec/rationales/refactoring]]
---

# Actionables

1. Take the one file your prompt names, and leave every other file alone. The session beside you holds them.
2. Run `./RUNME.sh lint <file>` first, and `./RUNME.sh fix <file>` for what a program fixes.
3. Fix what the rules name, and change what they pass nowhere. A rewording nobody wants costs the reader a read.
4. Keep the meaning the line carries. A rule names the shape, and the shape serves what the line says.
5. Commit that one file, and push nothing. The session beside you holds the branch.
6. Write what stands after you, where a rule outlives your hand. The next hand takes the file from there.
