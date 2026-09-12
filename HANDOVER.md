---
kind: [[handover]]
status: held
urgency: soon
depends_on: [the-answer-gate-bites, the-schema-projects-vale]
---

# Where it stands

The funnel note `spec/funnel/a-paragraph-has-a-schema.md` names six branches,
and this is the fifth. Read its two chapters on the question and the bottom
line first. The note stands on the branch `claude/friendly-brown-k6kohy` until
the owner merges it, so take that branch in where `work sync` leaves the note
absent.

The gate from the fourth branch re-prompts over the ceiling and carries a
warning forward, and `check_answer` lints a draft. The projector from the
second branch writes the answer register's rules. `lib/answer.js` holds the
door that reads a person's prompt and refuses the first tool call before a
readback. This branch gives the answer register its two opening blocks.

# What waits

| the piece | where | proves it |
|---|---|---|
| the question count | `lib/answer.js`, at `prompt.submit` | a prompt with two questions counts two, and a question inside a fence counts none |
| the question table | `lib/answer.js`, read by the gate and by `check_answer` | an answer opening with prose refuses under a count of two |
| the TL;DR list | the answer register, in the schema and its projection | an answer opening with a heading refuses |
| the guidance line | `spec/guidance/voice.md` | the note stays under its cap |

# The question table

`prompt.submit` from a person, by the kinds `opensATurn` names, counts the
sentences of the prompt closing on `?` outside a fence. The count holds for the
turn, and a plugin prompt leaves it as it stands.

At the turn's end, and in `check_answer`, the first block of the answer has to
be a table. Its header row reads `question` and `answer`, and its body holds at
least as many rows as the count. A count of zero demands no table. This check
lives in `lib/answer.js` beside the door, because Vale reads no session state.

A question the session cannot answer still gets its row, and the answer cell
says what blocks it.

# The TL;DR list

After the question table, or first where no table stands, the answer opens
with a list. Each item is one sentence, and no heading stands before the list.
The schema's answer register names this under `opens`. The projection writes
it as a rule in the answer variant of `Shape.yml`, so the same rule reads a
draft and the answer.

The rest of the answer follows under headings, and the rules the tree holds
already read that part.

# How to build it

Test the count as a pure function over prompt text. Test the table check as a
pure function over answer text and a count. Test the list rule through Vale
with a fixture answer that opens with a heading, and one that opens with a
list. Then run one session under this branch and read its first three answers
by eye. The shape is the point, and the numbers say little about it.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
