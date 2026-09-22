---
kind: [[guidance]]
scope: ["every session, desk and cloud"]
rationale: [[spec/rationales/working]]
---

# Actionables

1. Answer the owner's prompt in the chat, as text, before the next tool call. A question waiting behind a command is a question the owner asks twice. *
2. Open that answer by saying back what you understood and what you do next. Then work. *
3. Do next what you say you do next. A step you name as next ends no turn. *
4. Carry on to the end of the work. A finished piece opens the next one. *
5. Stop on three grounds: a discussion opens, a mistake is dear to undo, or the work stands complete. Where undoing is cheap, decide and move. Read a claim of done in the owner's own view before you make it. A closing question, as does that make sense, opens no discussion. Answer it in the report, do it where it makes sense, and say where it does not. Take the road a careful colleague takes, and ask about a choice that changes the work alone. *
6. Put your work into the answer you already owe. A second message costs the owner a read the first one paid for. *
7. Name the assumption you take where the owner says to carry on, and take it. Read `spec/design_input`, then ask the owner a design question before you build your own answer.
8. Put a script of your own under `.se/scripts`, which git ignores.
9. Read `.se/.runtime/tools.json` for the path of a tool, and run `./RUNME.sh tools` where that file is absent.
10. Fix what you trip over where the fix is trivial. Where it runs deeper, write the finding down and leave the code alone. *
11. Show a group's ask to the owner before it reaches the cloud, and push nothing they have yet to read. A cloud box builds the ask as written, and an unread ask builds the wrong thing. *
12. Run `check_answer` over a draft answer past sixty words before you send it. A draft checked there meets the gate clean.
13. Change many lines or files with `mcp__level0__patch` and `mcp__level0__replace`, and one spot with Edit.
14. One place owns a thing, and every other place points at it. Search for the owner before you write, and where one stands, write the pointer. This holds over a note, a number, a rule, a name and a line of code alike. *
15. Assert nothing about a thing you leave alone. A reader wants what they act on. So cut the aside describing another's mechanism, and point at the note owning it. *

# Examples

| the rule | do | do not |
|---|---|---|
| 1 | a line of text, then the tool call | three tool calls, then the answer |
| 3 | the step you name, in the same turn | a turn ending on a step named as next |
| 5 | a stop where a discussion opens | a stop to ask whether to run the tests |
| 7 | the assumption named, then the work goes on | a design built with no read of the design input |
| 14 | a pointer at the note owning the number | the number copied into a second note |
| 15 | a pointer at the note owning the mechanism | an aside explaining a door you leave untouched |
