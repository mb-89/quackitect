---
kind: [[handover]]
status: done
urgency: soon
depends_on: [the-answer-gate-bites, the-schema-projects-vale]
---

# Where it stands

The answer register holds its two opening blocks, and `./RUNME.sh check` passes
over 746 tests. The fifth branch of
[[spec/funnel/a-paragraph-has-a-schema]] stands complete.

| the piece | where it lives | what proves it |
|---|---|---|
| the question count | `questionsIn` in `lib/answer.js`, called at `prompt.submit` | `test/level0/answer.test.js`, and the hook test drives it to the gate |
| the question table | `tableFaults` in `lib/answer.js`, read by the gate and by `check_answer` | `test/level0/hooks.test.js`, over a prompt carrying two questions |
| the TL;DR list | `opening` in `lib/paragraph.js`, which writes `ShapeAnswer.yml` | `test/contract/paragraph.test.js`, through the real Vale |
| the guidance line | rule 13 of `spec/guidance/voice.md` | the note stands at 13 rules under a cap of 15 |

The design chapters stand under `spec/design_output/level0.md` and
`spec/design_output/projection.md`, and the code points at them.

# What waits

| the thing | why |
|---|---|
| the sixth branch | `BottomLineFirst` and `ShapeFits` join `VoiceJudged`, and `spec/requirements` takes its modals |
| the measurement | `.se/scripts/measure.sh` reads the delta this branch makes, over the answers of a session running under it |
| the funnel row | the branch table of the funnel note carries no status, so a reader counts the branches by hand |

# What surprises me

- The write door lints an edit fragment alone, so an edit adding rule 13 to
  `spec/guidance/voice.md` meets `GuidanceChapter`. Write the whole note instead.
- `CodeComment` refuses a comment line carrying no `[[link]]`, so a two line
  comment needs the link on both lines. One pointer line does the job.
- The commit door refuses the attribution trailer a harness asks for. The
  address reads as private, and the angle brackets stand outside the character
  set, so every commit here carries the message alone.
- `check_answer` and the gate now score one finding from `lib/answer.js` beside
  the findings of Vale. The score is a rate over words, so a short answer with
  no table reads far over the ceiling.

# The dead ends

- The first plan hands the TL;DR list its own rule file. That costs four edits
  to `.vale.ini`, one per section standing the answer rules off, so the check
  lands in `ShapeAnswer.yml` the way the brief says.
- Folding the check into `ShapeAnswer.yml` breaks two fixtures that open an
  answer with a heading or with prose. Both now open with a list, which is the
  shape the rule asks for.

# Read it by eye

Run a session under this branch and watch the first three answers. A prompt
carrying a question mark demands the table, and every answer opens with a list.
The gate names `QuestionTable` where the table goes missing, and `ShapeAnswer`
where the list does.
