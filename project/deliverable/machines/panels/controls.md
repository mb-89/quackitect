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
- `text` — a line edit for free text. Fields: key, placeholder, separator.
- `choice` — one of a named set. Fields: key, then one field per option.
- `toggles` — independent on/off buttons, any combination on at once. Fields:
  one per button, each the button's label. Not a `choice`: a choice is one of
  a set, and these do not exclude each other.
- `actions` — a bank of one-shot buttons: caption then route, repeated.
  Each press posts its route and nothing else. Not an `action`: an action
  joins the row above, and a bank IS its own row, label first.

A type this renderer does not know is a REFUSAL, not a guess. That is the
whole point: the drawing decides, and an unlisted widget cannot appear by
accident.

## Rows

ONE ROW PER CONTROL, AND THE LABEL COMES FIRST. The row is not markup
either — it falls out of the names:

- A parameter WITH a name starts a new row, and that name is the row's label.
- A parameter with an EMPTY name joins the row above it.
- An `action` always joins the row above it, so its button sits beside the
  control it acts on.

No surface writes a label of its own. One that did put the autonomy label on
screen twice, which is the same two-drawings fault the sliders had.

## Parameters

- autonomy | rungs | scale | what the agent may decide alone — each rung is a kind of work, and every rung below it comes with it
- walk | actions | SET TARGET | /target/selected | PULL | /pull | drive the walk by hand — SET TARGET aims at the state whose details are open; PULL advances one instruction, and the answer lands in the details
- updates | int | narration_minutes | min | 0 | 1440 | an update every n minutes at least — 0 stops this clock
- | int | narration_calls | calls | 0 | 1440 | an update every n calls at least — 0 stops this clock
- NOW | action | /narration-now | force an update at the next possibility
- log filter | text | log_filter | filter the logs | | narrow the feed to the lines that match
- shutdown | toggles | block auto-sleep | shutdown at idle | what the machine does about power — neither pressed means it does nothing

THE NOTE ROW IS ITS OWN PANEL (note-entry.md) and the sidebar draws it under
this one. It is a separate control with a separate spec, so it is not
restated here.

## The shutdown row

Two buttons, either or both.

- BLOCK AUTO-SLEEP holds the machine awake, so it does not sleep under a
  running walk.
- SHUTDOWN AT IDLE holds it awake while anything is happening, then shuts the
  machine down once nothing is.

THE ENGINE IS THIS SERVER AND THE MACHINE IS THE COMPUTER. Both buttons act on
the machine; the engine is only what watches.

WHAT IT IS FOR: tell the agent to do its work and return to the front desk,
flip shutdown at idle, and leave. Five quiet minutes later the machine is off.

Neither pressed means nothing is done about power at all. That is the resting
state and what a fresh session starts in.

THE ENGINE DOES THIS, NOT THE AGENT. It is a timer the engine owns. The
language model neither decides it nor triggers it, which is the point: a
shutdown that waited for an agent to notice would never fire, because an agent
that has stopped is exactly what idle means.

IDLE IS THREE CONDITIONS, all of them. The walk stands at a resting place —
idle or the front desk. Nothing has reached the log for five minutes, by any
hand. And nothing this session started is still running.
