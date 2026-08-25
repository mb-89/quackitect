---
id: controls
statement: The control bar, as parameters rather than markup. The engine READS this file; edit it here.
---

# The control bar

A PANEL IS A LIST OF PARAMETERS, never a piece of markup. Each line below
names one control, says what TYPE it is, and the type decides which widget
gets drawn. Nobody places pixels, and nothing here can invent a slider —
the renderer only knows the types listed under Types.

This is the same shape the repo already uses twice. `deliverable/machines/scale.md` holds
the autonomy rungs as a list, and `deliverable/machines/lint/voice-lint.md` holds the lint
thresholds.

Markdown rather than JSON, because the WHY lives beside the WHAT. A person
edits it in the real world, and Obsidian reads it.

## Types

- `rungs` — a bank of cumulative switches. Fields: source.
  The source names where the rungs come from; `scale` is deliverable/machines/scale.md and
  `stopat` is deliverable/machines/stopat.md.
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
- `table` — rows of plain text under named columns. Fields: key.
  - The key names which table in the values gets drawn.
  - It is READ-ONLY and nothing in it can be pressed.
  - ONE LINE PER ROW. The last column is the wide one and the surface
    truncates it, so short scannable facts go first and the long description
    goes last.
  - THE FULL TEXT OF EVERY CELL IS ON ITS TOOLTIP, which is where a truncated
    line can still be read.
  - The label stands whether or not there are rows, like every other row. An
    empty table is the ordinary case and says so in words.

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
- stop @ | rungs | stopat | how far the agent walks before handing back — agent judgement is the default, and the two above it unlock one press at a time
- go on | action | /release | let the agent take ONE more state — only does anything at stop @ state end, where the engine holds every transition
- walk | actions | SET TARGET | /target/selected | PULL | /pull | drive the walk by hand — SET TARGET aims at the state whose details are open; PULL advances one instruction, and the answer lands in the details
- updates | int | narration_minutes | min | 0 | 1440 | an update every n minutes at least — 0 stops this clock
- | int | narration_calls | calls | 0 | 1440 | an update every n calls at least — 0 stops this clock
- NOW | action | /narration-now | force an update at the next possibility
- log filter | text | log_filter | filter the logs | | narrow the feed to the lines that match
- shutdown | toggles | block auto-sleep | shutdown at front desk | what the machine does about power — neither pressed means it does nothing

THE NOTE ROW IS ITS OWN PANEL (note-entry.md) and the sidebar draws it under
this one. It is a separate control with a separate spec, so it is not
restated here.

## A panel whose height changes goes last

THE BACKGROUND TABLE IS ITS OWN PANEL (tasks.md) and the sidebar draws it
under everything, including the note row. Its height follows how many jobs are
running, so anywhere else it would push the controls below it up and down
while a person is reaching for one.

A NEW CONTROL BELONGS IN THIS FILE, not after that one. `renderSidebar` in
`deliverable/engine/params.ts` fixes the order, so adding a row here can never
push the table off the bottom.

## The stop-at row

IT SITS UNDER AUTONOMY AND ANSWERS THE NEIGHBOURING QUESTION. Autonomy says
what the agent may decide alone; stop-at says how far it may walk before
handing back.

THE LABEL IS THE ROW'S, NOT THE BUTTONS'. `stop @` sits in front, once, the way
`autonomy` does. Repeating it on each notch would make four long buttons out of
four short ones, and the row already carries its own name by the rule above.

THE NOTCHES ARE deliverable/machines/stopat.md, which holds what each one means and why the
control exists at all. Editing that file moves the buttons on the next reload;
nothing here restates them.

## The shutdown row

Two buttons, either or both.

- BLOCK AUTO-SLEEP holds the machine awake, so it does not sleep under a
  running walk.
- SHUTDOWN AT FRONT DESK holds it awake while anything is happening, then shuts
  the machine down once nothing is.

THE ENGINE IS THIS SERVER AND THE MACHINE IS THE COMPUTER. Both buttons act on
the machine; the engine is only what watches.

WHAT IT IS FOR: tell the agent to do its work and return to the front desk,
flip shutdown at front desk, and leave. Five quiet minutes later the machine is
off.

IT SAID "AT IDLE" UNTIL 2026-08-23, and there is no idle state any more. The
control named a place the walk cannot stand in, which is the kind of label a
reader trusts and should not.

Neither pressed means nothing is done about power at all. That is the resting
state and what a fresh session starts in.

THE ENGINE DOES THIS, NOT THE AGENT. It is a timer the engine owns. The
language model neither decides it nor triggers it, which is the point: a
shutdown that waited for an agent to notice would never fire, because an agent
that has stopped is exactly what resting means.

RESTING IS THREE CONDITIONS, all of them.

- The walk stands at the front desk, which is the only resting place there is.
- Nothing has reached the log for five minutes, by any hand.
- Nothing this session started in the last hour is still running.

THE HOUR ON THE THIRD ONE IS NEW and it is why this never fired.
A background job that hangs stays "running" for ever, and one of those held the
machine awake indefinitely. A job silent for an hour is a leak rather than
work, and a shutdown that any leak can veto is a shutdown that never happens.
