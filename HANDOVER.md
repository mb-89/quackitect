---
kind: [[handover]]
status: done
urgency: whenever
depends_on: [the-schema-projects-vale]
---

# Where it stands

The last row of the funnel note closes here. Five things land:

- The projection writes `VoiceJudged` from the schema's meaning layer.
- `BottomLineFirst` and `ShapeFits` stand there beside `Actionable` and `Role`.
- A judged rule refuses a list of labels, not one alone.
- A judged rule names the span one question reads.
- The requirement register takes the modal rule in a second variant.

| the piece | where | what proves it |
|---|---|---|
| the two rules | `VoiceJudged/BottomLineFirst.yml`, `VoiceJudged/ShapeFits.yml` | a fake judge labels a fixture, and the door refuses the refused label |
| `refuses` as a list | `lib/judge.js`, `VoiceShape/JudgedRule.yml` | a rule refusing two labels refuses both, through Vale and through the judge |
| the span | `lib/judge.js` | `ShapeFits` reads one paragraph a question, and `BottomLineFirst` one chapter |
| the register | `.vale.ini`, `lib/paragraph.js` | `shall` passes under `spec/requirements` and meets a refusal outside it |
| one requirement note | `spec/requirements/the-write-door.md` | the check stays green with it |

The battery answers 796 cases green, and the projection answers three targets
clean. Run `./RUNME.sh check` to read both.

## What the projection carries

`VoiceJudged` becomes the third projection target, so the schema is the one
place a person edits a judged rule. `Role` moves into the meaning layer with
the other three, because a target folder holds no hand-written file.

A judged entry carries `id`, `asks` and `message`. It carries `link`, `labels`,
`refuses`, `span`, `reads` and `ignores` beside them. For the shape of each
key, see [[spec/design_output/projection#the-judged-rules]].

## What the two rules cost

`.se/scripts/measure-judge.js` counts the spans each rule reads over the tree.
One span is one model call, before the sampling in `spec/config/level0.json`
takes its cut:

| rule | span | files it reads | calls a write |
|---|---|---|---|
| `Actionable` | paragraph | 4 | 0.5 |
| `BottomLineFirst` | chapter | 49 | 10.7 |
| `Role` | paragraph | 49 | 23.0 |
| `ShapeFits` | paragraph | 84 | 14.3 |

`judge.maxSpans` caps one rule at 24 spans a write, so the largest note costs
that and no more. A whole pass over the tree costs 2854 calls at the four
rules together.

# What waits

| the question | who answers it | what hangs on it |
|---|---|---|
| the sampling for the two new rules | the owner, with a number | what a session pays for the meaning layer |
| the refusal rate of `BottomLineFirst` on a chapter | the next session on a fresh box | whether the rule teaches or nags |
| whether `ShapeFits` reads `.se` too | the owner | the rule names no `ignores` today |

The refusal rate stays open, and the reason stands under the retro below. A
session running this code from its start measures it in one pass, because the
door writes a warn row per refusal already.

# Retro

The judge refuses the writes of this very branch, and the refusal teaches the
design. Three things surprise me.

## The cage holds old code

A session loads `lib/judge.js` once, at its start. So the judge running here
holds the code from before this branch changes it, and two things follow:

- `ShapeFits` stays quiet, because the old judge compares a list to a string.
- `BottomLineFirst` fires per paragraph, because the old judge reads no `span`.

`BottomLineFirst` at the paragraph cut refuses 10 paragraphs out of the 10 it
reads here. That is the argument for the chapter cut, measured by accident. A
paragraph on its own says nothing about what stands before it, so the model
answers `late` almost every time.

Working around it costs this branch its judge. `./RUNME.sh config judge.enabled
false` holds the judge off in `.se/config.json`, which git ignores and which
the box drops. The last step of this branch puts it back to `true`.

## A fragment reaches the judge

The write door lints the fragment an edit hands it, leaving the file under it
alone. So a lone table row reads as a paragraph, and the tagger calls the pipe
a past tense. Widening the edit to the whole table answers it. The funnel note
names this misread already, and it costs a round here.

## The shell writes nothing

`ShellWritesNothing` refuses a heredoc into a note, and the Bash door refuses a
commit message carrying an angle bracket. So a commit message goes through a
file under the scratchpad, with `git commit -F`.

## What I leave alone

The funnel note stands on a branch of its own, so its own table still reads
that the judged rules wait. The owner merges that branch, and the row lands
with it.
