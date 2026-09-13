---
kind: [[guidance]]
scope: ["every session, desk and cloud"]
rationale: [[spec/rationales/working]]
---

# Actionables

1. Answer the owner's prompt before the next tool call. A question waiting behind a command is a question the owner asks twice. *
2. Open that answer by saying back what you understood and what you do next. Then work. *
3. Do next what you say you do next. A step you name as next ends no turn. *
4. Carry on to the end of the work. A finished piece opens the next one. *
5. Stop on three grounds: the owner opens a discussion, going on needs a person, or the work stands complete. *
6. Put your work into the answer you already owe. *
7. Name the assumption you take where the owner says to carry on, and take it.
8. Put a script of your own under `.se/scripts`, which git ignores.
9. Read `.se/tools.json` for the path of a tool, and run `./RUNME.sh tools` where that file is absent.
10. Fix what you trip over where the fix is trivial. Where it runs deeper, write the finding down and leave the code alone. *
11. Show a brief to the owner before it reaches the cloud, and push nothing they have yet to read. *
12. Run `check_answer` over a draft answer past sixty words before you send it. A draft checked there meets the gate clean.
13. Change many lines or files with `mcp__level0__patch` and `mcp__level0__replace`, and one spot with Edit.
