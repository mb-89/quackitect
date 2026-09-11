---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The funnel note `spec/funnel/a-paragraph-has-a-schema.md` names six branches,
and this is the fourth. Read its chapter on the doors first. The note stands on
the branch `claude/friendly-brown-k6kohy` until the owner merges it, so take
that branch in where `work sync` leaves the note absent.

`turn.complete` in `hooks/level0.js` already runs Vale over the answer under
the `*answer.md` section of `.vale.ini`. It hands the findings back as text
under the answer, and the turn ends. Over 212 answers from four days, three in
four carry a finding, so that text changes nothing. The tooth in `lib/stop.js`
already re-prompts through `$.prompt.submit`, and `claim_stop` already
registers a tool at `session.start`. This branch joins those three.

# What waits

| the piece | where | proves it |
|---|---|---|
| the two bands in the config | `spec/config/level0.json`, and its schema | `./RUNME.sh config` names `answer.warnAt` and `answer.ceiling` |
| the re-prompt over the ceiling | `hooks/level0.js`, at `turn.complete` | a fake session over the ceiling meets one re-prompt, and one alone |
| the carry under the ceiling | `hooks/level0.js`, at `prompt.submit` | the next prompt from a person carries one line naming the findings |
| the `check_answer` tool | `hooks/level0.js`, beside `claim_stop` | the tool answers the findings of a draft |
| the guidance line | `spec/guidance/working.md` | the note stays under its cap |

# What the bands do

The score of an answer is its findings per thousand words, the number
`voice measure` prints. Two values in `level0.json` cut it into three bands:

| the score | what happens |
|---|---|
| under `warnAt` | nothing |
| from `warnAt` to `ceiling` | the findings wait, and the next prompt a person sends carries them as one line |
| over `ceiling` | one re-prompt saying rewrite, naming the findings, once per turn |

A re-prompt is a `$.prompt.submit` from the hook, the way the tooth does it.
The prompt carries the findings in the wording `refusal` in `lib/refuse.js`
already uses. The answer door reads `e.origin.kind`, and a plugin prompt is a
machine, so the door owes it no readback. `stop.mostInARow` caps the re-prompts
the way it caps the tooth, and a lock per turn holds the count at one.

Start both values at `warnAt: 5` and `ceiling: 15`. The owner tunes them, and
the funnel note holds the ceiling open.

# What the tool does

`check_answer({ text })` runs the draft through `lintText` as `level0-answer.md`
and answers the findings, in the same wording the re-prompt carries. A draft
that comes back clean meets the gate clean. The guidance carries one line:
check a draft over sixty words before you send it.

# How to build it

Test through the fakes in `src/doors/fake`, with a fake session that ends a
turn with a known answer. Assert one re-prompt over the ceiling, none under
it, and one line on the next prompt. Assert that a second turn end inside the
same turn submits nothing. Run `./RUNME.sh voice measure` over the transcripts
of a session under this branch, and write the number into the handback beside
the number from before.

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
