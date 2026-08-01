---
id: controls
statement: The control bar, as parameters rather than markup. The engine READS this file; edit it here.
---

# The control bar

A PANEL IS A LIST OF PARAMETERS, never a piece of markup. Each line below
names one control, says what TYPE it is, and the type decides which widget
gets drawn. Nobody places pixels, and nothing here can invent a slider —
the renderer only knows the types listed under Types.

This is the same shape the repo already uses twice: machines/scale.md holds
the autonomy rungs as a list, machines/lint/voice-lint.md holds the lint
thresholds. Markdown rather than JSON because the WHY lives beside the WHAT,
a person edits it in the real world, and Obsidian reads it.

## Types

- `rungs` — a bank of cumulative switches. Fields: source.
  The source names where the rungs come from; `scale` is machines/scale.md.
- `int` — a line edit that takes whole numbers only. Fields: key, unit, min, max.
- `action` — a button that posts and does nothing else. Fields: post.

A type this renderer does not know is a REFUSAL, not a guess. That is the
whole point: the drawing decides, and an unlisted widget cannot appear by
accident.

## Parameters

- autonomy | rungs | scale | what the agent may decide alone — each rung is a kind of work, and every rung below it comes with it
- updates | int | narration_minutes | min | 0 | 1440 | an update every n minutes at least — 0 stops this clock
- | int | narration_calls | calls | 0 | 1440 | an update every n calls at least — 0 stops this clock
- NOW | action | /narration-now | force an update at the next possibility
