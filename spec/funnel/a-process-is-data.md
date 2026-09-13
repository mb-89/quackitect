---
kind: [[funnel]]
about: processes as data, work items as their steps, and a canvas that draws them
---

# Scope

v4 carries a process system this tree lacks. A process there is a file of data.
A work token names the process that shapes it. The states that token moves
through belong to the process, and the code holds none of them.

This note collects that work, and it carries the rulings v4 leaves behind. It
also says what the move costs here. The owner settles none of it yet.

One rename comes with it. A work token becomes a work item, and every line
below takes the new name.

# SIPOC names six slots

v4 authors a process as a note of slots, and `src/engine/process.go` reads
them. Each activity carries all six:

| slot | what it holds | v4 field |
|---|---|---|
| supplier | who hands the step its input | `supplier` |
| input | what the step takes | `input` |
| process | what the step does | `does` |
| output | what the step answers | `output` |
| customer | who takes that output | `customer` |
| enabler | what the step needs and leaves whole | absent from the code |

`spec/processes/standard.process.yaml` shows one. An activity also names `by`,
which says who can run it, and `to`, which says the state it moves the item to.
It carries `criteria` as well, each one a `says` line and a word on whether it
asks for evidence.

The enabler slot stands in the ruling and stands outside the engine. So a move
here either writes it or drops it on purpose.

# The orphan check earns it

`.se/dev_guide/levels/level-3-design.md` holds the rulings, and one of them is
the reason the model exists:

> A step whose output nothing consumes is an orphan.

The other direction holds too. A step whose input has no supplier stays still
for good. Both checks run mechanically, because a step names its output and a
later step names its input.

| the ruling | what it gives |
|---|---|
| P is every step, and a step alone | uncertainty attaches to a step, so a register anchors |
| an output nothing consumes is an orphan | the check the model exists for |
| an input with no supplier is an orphan | a step that stalls, found by standing in it |
| enablers are the dependency layer | guidance, a skill, an engine, a licensed source |

An enabler nobody can reach reads as a register issue, and it stands outside
the work.

# A process is a form

v4 rules a process a note, and that ruling cuts against a canvas. Six slots
settle the layout, so a drawing of one step adds nothing.

That holds for one step. Six slots want a form, and a picture of six labelled
boxes tells a reader what the form already says.

# The steps make a graph

The ruling covers a step. It leaves the whole open, and the whole is where a
drawing pays.

A process names states, and an activity names the state it moves an item to.
So the transitions answer a graph nobody authors. A reader meets that graph as
a picture, or walks it by hand.

Both stand together: the step is a form, and the run is a graph.

# v4 designs the canvas

`.se/dev_guide/design-doc-executable-workflows.md` holds 286 lines of it:

| piece | what v4 picks | licence |
|---|---|---|
| the canvas | `@xyflow/react`, which is React Flow | MIT |
| the layout | `@dagrejs/dagre`, because the file carries no coordinates | MIT |
| the host | a VS Code webview under `CustomTextEditorProvider` | the client |
| the bundler | Vite, answering one JS file | MIT |
| a guard | `google/cel-go`, for a condition on a transition | Apache 2.0 |
| the machine | `qmuntal/stateless` | Apache 2.0 |

Two pieces of that design pay as well as the picture. The file carries its own
fixtures, so a test run holds the process to its own specification. And the
runtime says what it does as it goes, so the canvas draws a run while it runs.

# Work items run a process

v4's `spec/schemas/work-token.schema.yaml` ties the two together:

| field | what it does |
|---|---|
| `process` | names which process shapes this item |
| `status` | takes its values from that process, by `x-enum-from: process.states` |
| `guidance` | the rules for filling it, which the template writes on |

So the process owns the states and the item reads them. A new process is a new
file, and the code stays still.

That schema carries two rulings this tree wants. A field stands there because
something reads it. And a hold belongs to an agent and dies with the session,
so it lives under `.se` and stays off the item.

# Shape and movement

A schema holds a shape, and a process holds a movement. A work item takes both,
because it stands still as a note and moves as a run.

| the shape | its instance | how the instance names it |
|---|---|---|
| `guidance.schema.yaml` | `spec/guidance/voice.md` | `kind: [[guidance]]` |
| `standard.process.yaml` | a work item | `process: [[standard]]` |

v4 wires the second row with one field. A work token reads `status` from
`x-enum-from: process.states`, so the process owns the values and a new process
costs one file.

A process is a note as well, under `kind: process`, so a schema shapes it too.
Then one rule covers the tree. A file names its kind, the kind names a schema,
and a kind that moves names a process.

# The item carries its progress

The item marks a step done in its own file as it goes. The evidence for that
step stands beside the mark, and the evidence system holds that shape.

So a session that stops halfway hands the next one a file saying which steps
stand done. Whoever picks the item up reads the marks and carries on from
there.

Only a work item takes a process for now:

| the thing | does it take a process |
|---|---|
| a work item | yes, and it carries its own progress |
| a funnel item | no, and it settles by a ruling |
| the write door | no, it finishes inside one call |
| the stop hook | no, it holds one turn |

# This tree holds one already

The work verb is a process with the data burned in:

| what v4 holds as data | what this tree holds in code |
|---|---|
| states, one set per process | `todo`, `held`, `done` |
| activities with a supplier and a customer | `new`, `take`, `done`, `release`, `merge` |
| criteria, and the evidence each one asks for | `batterySays` alone |
| which chapters a note of this kind carries | the handover schema |

v4 runs four processes: `funnel`, `note`, `standard` and `trivial`. This tree
runs one, so every piece of work pays a full brief.

# What it costs here

| the thing | the cost |
|---|---|
| the runtime | v5 runs on Node, so `cel-go` and `stateless` want replacing |
| a guard | a condition runs on data, so it wants a reader that is safe |
| the canvas | `src/extension` stands here, so the host is up |
| the schema | `spec/schemas` stands here, so a process schema joins it |
| the orphan check | it reads across steps, so `lint` holds it beside the tree rules |

The extension lands today, and that is what opens this question now. The
webview host, the watcher and the projection all stand.

# What stands open

| the question | what hangs on it |
|---|---|
| Where a done mark sits | The frontmatter reads at a glance, and the body holds the evidence |
| Does the work verb become one of several | Whether a small fix stops paying a full brief |
| Does the canvas draw, or draw and animate | Animation wants a runtime saying what it does |
| Which reader holds a guard | A guard runs on data, so it wants a safe reader |
| Does the enabler slot come over | v4 rules it in and writes it nowhere |
| Supplier and customer, or source and consumer | v4's code says customer and its ruling says consumer |
| Does a process file carry its own fixtures | It makes the process testable, and it makes the file long |
