---
kind: [[handover]]
status: todo
urgency: whenever
depends_on: [the-schema-projects-vale]
---

# Where it stands

The funnel note `spec/funnel/a-paragraph-has-a-schema.md` names six branches,
and this is the last. Read its chapters on the bottom line, on the list and on
the registers first. The note stands on the branch `claude/friendly-brown-k6kohy`
until the owner merges it, so take that branch in where `work sync` leaves the
note absent.

The judge in `lib/judge.js` asks a model one question per span and holds one
rule today, `Actionable` in `spec/config/styles/VoiceJudged`. A judged rule
carries `ask`, `message`, `labels`, `refuses` and `reads`, and `refuses` names
one label. The schema's meaning layer names two more rules, and its requirement
register names a modal set no path reads yet.

# What waits

| the piece | where | proves it |
|---|---|---|
| the two rules for the judge | `VoiceJudged/BottomLineFirst.yml`, `VoiceJudged/ShapeFits.yml` | a fake judge labels a fixture, and the door refuses the refused label |
| `refuses` as a list | `lib/judge.js`, and `VoiceShape/JudgedRule.yml` | a rule refusing two labels refuses both |
| the judge over a paragraph | `lib/judge.js` | `ShapeFits` reads one paragraph per question |
| the requirement register | `.vale.ini`, and the projection | `shall` passes under `spec/requirements` and refuses elsewhere |
| one requirement note | `spec/requirements` | the check stays green with it |

# The judge's two rules

The projection writes both from the schema's meaning layer, in the shape
`Actionable.yml` holds:

| rule | asks | labels | refuses | reads |
|---|---|---|---|---|
| `BottomLineFirst` | does the first block state the outcome, or does the outcome arrive late? | `first`, `late` | `late` | an answer, and a chapter of a note |
| `ShapeFits` | do these sentences give the same fields for different things, say what reaches what, or neither? | `prose`, `table`, `diagram` | `table`, `diagram` | a paragraph, anywhere |

`ShapeFits` refuses two labels, so `refuses` takes a list, and `JudgedRule.yml`
admits one. The judge's sampling in `level0.json` holds, so a session pays for
these the way it pays for `Actionable`.

# The requirement register

A requirement says `shall` where it binds and `should` where it advises, as
RFC 2119 gives them. The schema's requirement register admits both on
`spec/requirements/*.md`, and the prose register admits neither. The projector
writes the modal rule in two variants, the way it writes `Shape.yml` in two,
and `.vale.ini` names the requirement variant on that path.

Add one requirement note under that folder. Three of its lines use `shall`,
`should` and `must`. Then the register has a reader on the day it lands.

# How to build it

Test the judge with a fake model answering a fixed label, the way the judge's
tests do today. Test the register through Vale with one fixture under
`spec/requirements` and one outside it. Count in the handback how many
paragraphs the two rules read in one session, and how many they refuse. The
owner then decides on the sampling with a number.

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
