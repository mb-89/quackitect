---
kind: [[guidance]]
scope: ["every session, desk and cloud"]
rationale: [[spec/rationales/working]]
---

# Actionables

1. Answer the owner's prompt in the chat, as text, before the next tool call. A question waiting behind a command is a question the owner asks twice. *
2. Open that answer by saying back what you understood and what you do next. Then work. Give each owner question its own row in the opening table until it closes. *
3. Do next what you say you do next. A step you name as next ends no turn. *
4. Carry on to the end of the work. A finished piece opens the next one, and takes one `mcp__level0__report` line. Land each helper's work through `./RUNME.sh commit` once its report and tests pass. One review then reads it, and one undo takes it back. *
5. Stop on three grounds: a discussion opens, a mistake is dear to undo, or the work stands complete. Where undoing is cheap, decide and move. Read a claim of done in the owner's own view before you make it. A closing question, as does that make sense, opens no discussion. Answer it in the report, do it where it makes sense, and say where it does not. Take the road a careful colleague takes, and ask about a choice that changes the work alone. *
6. Put your work into the answer you already owe. A second message costs the owner a read the first one paid for. *
7. Name the assumption you take where the owner says to carry on, and take it. Read `spec/design_input`, then ask the owner a design question before you build your own answer.
8. Put a script of your own under `.se/scripts`, which git ignores.
9. Read `.se/.runtime/tools.json` for the path of a tool, and run `./RUNME.sh tools` where that file is absent.
10. Leave a line at warning as it stands, and carry on with the ask. The refactoring hand drains the warnings list, and a rewrite for form spends the turn the ask pays for. Fix any other fault you trip over where the fix is trivial. Write a deeper one down as a finding. *
11. Push nothing from a desk until the owner says push, and ask no question about a push. Commit your work, and show a group's ask to the owner before it reaches the cloud. An unread ask builds the wrong thing on a cloud box. A push question spends a read the owner keeps for the work. *
12. Run `check_answer` over a draft answer past sixty words before you send it. A draft checked there meets the gate clean.
13. Change many lines or files with `mcp__level0__patch` and `mcp__level0__replace`, and one spot with Edit.
14. One place owns a thing, and every other place points at it. Search for the owner before you write, and where one stands, write the pointer. This holds over a note, a number, a rule, a name and a line of code alike. *
15. Assert nothing about a thing you leave alone. A reader wants what they act on. So cut the aside describing another's mechanism, and point at the note owning it. *

# Examples

| the rule | do | do not |
|---|---|---|
| 1 | a line of text, then the tool call | three tool calls, then the answer |
| 3 | the step you name, in the same turn | a turn ending on a step named as next |
| 4 | one commit a helper, through the commit verb | one batch commit over many helpers' work |
| 5 | a stop where a discussion opens | a stop to ask whether to run the tests |
| 7 | the assumption named, then the work goes on | a design built with no read of the design input |
| 10 | the write lands at warning, and the next step of the ask runs | a second write of the same file to clear its warning |
| 11 | a commit, and the report naming it | a push, or a row asking whether to push |
| 14 | a pointer at the note owning the number | the number copied into a second note |
| 15 | a pointer at the note owning the mechanism | an aside explaining a door you leave untouched |
