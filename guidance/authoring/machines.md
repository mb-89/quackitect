# How to write machine canvases

Lives in `guidance/authoring/`. The three layers are:

- guidance — the method layer
- spec — the project record
- the engine — code

The authoring rules for drawn machines. Written after the first canvas
shipped with paths Obsidian could not resolve (owner fix 2026-07-26) — so
the mistakes stay fixed. Follow this EVERY time a canvas is created or
edited; the compiler enforces most of it and refuses loudly, but layout and
paths it can only partially check.

## Paths — the rule that was broken

**The Obsidian vault root is the repository root.** Every `file` reference in
a canvas is VAULT-RELATIVE, and since the folder levels collapsed that is the
same spelling as root-relative — one form, right in both places:

- right: `"file": "deliverable/machines/states/idle.md"`
- wrong: `"file": "states/idle.md"` (canvas-relative — Obsidian shows a
  broken node)

THIS USED TO BE THREE FORMS. The vault root was a folder one level down, so a
root-relative path carried its name in front and Obsidian could not follow it.
That trap is gone, and the page keeps the note because a reader meeting an old
canvas will still find the prefixed form in it.

The compiler accepts the fallbacks, Obsidian does not. Author vault-relative,
always.

## start and end are MECHANICAL

Every machine has exactly ONE start and ONE end state. They are machinery,
not content: the machine enters at start, the machinery walks out of it on
the first pull, and the machine is done when everything before end has
transitioned into it.

ALL machines share the SAME two notes
(`deliverable/machines/states/start.md` / `end.md`, `state_kind: start` /
`end`). Never write machine-specific content into them, and never create
per-machine start/end notes.

Draw both as pills. The end state is called END — that is its state-machine
name, not "done".

## The drawn form

- A machine is one `.canvas` file. `metadata.frontmatter` carries `reentry`
  (`restart` | `resume`); the entry is NOT declared — it is the machine's
  start state, found mechanically.
- **States are file nodes onto state notes** (`.md`). A file node onto
  another `.canvas` nests that machine as a sub-machine state (its id is the
  canvas filename).
- **Edges**: the role rides `styleAttributes.role` (absent = `normal`;
  others: `alternative | fallback | recovery | approval | error`). The edge
  **label is the guard** (`<counter> <op> <int>`) — nothing else goes in a
  label. Always set `fromSide`/`toSide` so the drawing stays readable.
- **Hub rule**: a state's inbound NORMAL edges form an AND-join — it waits
  for all of them. RETURN edges to a hub (idle) must be `alternative`, or
  the hub becomes unreachable. Found twice: v2's gate_inputs, v3's idle.
- **Text nodes are comments** — annotate freely, the compiler skips them.
- **Groups are geometric**: a state whose center sits inside a group
  rectangle carries its label. Presentation only.
- **Escape and ask-human edges are never drawn** — the executor owns them.
- Every machine needs exactly one start and one end (its terminal) or it
  refuses to load.

## State notes

Agent-facing lives in FRONTMATTER; the body is prose for humans. First
`# heading` is the statement.

```
---
state: idle                  # the state's id (required)
state_kind: work             # work | gate | terminal | start | end (required)
legal_tools: all             # THE STATE GATE: tools legal here (`all` opens the lane;
                             # se_pull is ALWAYS legal — it is the machinery)
guidance: One or two short sentences the agent gets in its packet. Never empty.
priority: operational        # HUMAN INVOLVEMENT: the weight of ENTERING this
                             # state, as a RUNG WORD (required — see the scale
                             # below). Never a number.
tags: review                 # optional; joins the state to guidance (the pull's tag rule)
exit_read:                   # conditions are FLAT keys: <entry|exit>_<type>.
  - AGENTS.md      # YAML lists render as chips in Obsidian —
  - guidance/voice.md    # comma strings are accepted too
exit_script:
  - deliverable/engine/bin/preflight.ts
---

# Statement of the state

Prose for the human reader: why this state exists, how it will grow.
Optionally `## Evidence form` with lines "- name | description | required".
```

`legal_tools` is about TOOLS only — legal STATES are the machine's edges.
Keep `guidance` short and imperative; it is served verbatim in packets.

Conditions: every `entry_<type>`/`exit_<type>` key names a condition TYPE,
defined by its note in `deliverable/machines/conditions/<type>.md`. The
compiler refuses a type without a note and an engine evaluator, and refuses
a nested `entry:`/`exit:` dictionary, because Obsidian renders those as
JSON blobs.

All of a state's conditions must hold. In SCXML terms the edge's effective
cond is exit of its source AND entry of its target.

Two types exist today:

- `read` — args are documents whose PROVEN reading is the evidence. The
  pull serves them to the agent and credits what it served. The human
  checks each doc once per version in the mirror. See the condition note.
- `script` — args are scripts the engine runs, and exit 0 is the evidence.
  The STATE names what runs, as boot does with its preflight and selftest.

THE PULL GATES ENTRY (owner ruling 2026-07-26): outside boot, entering a
state also demands its pulled guidance proven read, the same way — hashes
from the agent, checks from the human. Boot is exempt (it is where the
first reads happen); a state's own `exit_read` list is excluded from its
entry demand (that is the state's assignment, read inside it).

## Priority — the human-involvement scale

Every state carries a `priority`, the weight of the DECISION TO ENTER it.
The session runs with an AUTONOMY (CLI at launch, the mirror's rungs,
live). The agent enters a state by itself only when the state's rung sits
at or below the dial. The human always may. Work INSIDE a state is never
gated — only entering is.

THE RUNGS ARE WORDS, and the words are the truth (owner cut-over ruling
2026-08-12). The ladder LIVES in deliverable/machines/scale.md; the engine reads it,
and the numbers beside the rungs are transitional anchors for the
weighing. Author `priority:` as a rung word:

- **mechanical** — what mainly the engine does, carried out as decided:
  start/end pills, boot's steps, idle, the route.
- **operational** — single steps and submitting: the work and find
  states, frame, diverge, converge.
- **tactical** — running iterations and expeditions, seeding and
  delegating sub-work.
- **strategic** — seeding iterations, retros, overhauls and planning;
  delegating downward; draining the backlog.
- **ideation** — filling the backlog and producing the new; everything
  but the axiomatic vision. The dial's last notch, and the dangerous one
  — scale.md says why.

**blocked** is the sixth word, and it sits ABOVE every rung rather than
below them. A state authored `blocked` can never be entered by the agent,
at any setting. The person always may. The archives are drawn that way.

THE TWO SIDES OF THE WORD SIT AT OPPOSITE ENDS. On the control, blocked
is the position where no rung is pressed. On a state, it is above the top
rung. The gate refuses when priority is GREATER than autonomy, so
"nothing gets through" is the bottom of one range and the top of the
other.

NEVER AUTHOR A STATE AT 0. It would do the opposite of what the word
says: 0 > 0 is false, so the state would run at the blocked setting. The
engine reads a state's blocked above the ladder for exactly that reason.

A sub-machine state's priority lives in the SUB-CANVAS's
`metadata.frontmatter.priority` (the canvas is the state); the compiler
refuses a canvas without one. Reaching `end` of the MAIN machine ends the
whole session: the server shuts down and the Mirror turns red.

The pull: the machine DERIVES each state's relevant guidance (`pulled` in
every packet — path, hash, sources). Rules: guidance-root docs and
`applies: always` docs pull everywhere; a doc's `applies_to:` selectors
(state id, `machine/*`, `kind: x`) pull where they match; `tags:` on the
doc joins `tags:` on the state; `read` arguments always appear. Pulling is
visibility — only conditions gate. Never author `pulled`.

## Layout and sizing

- A NEW NODE IS BORN THE SIZE OF ITS LABEL. Make it just big enough for the
  title and the subtitle. Nothing more.
- The old rule sized a node to display its whole NOTE, around 620 × 640. It
  is struck (owner ruling 2026-07-28). A note-reading box is far too big for
  what a machine drawing shows.
- THE SIZE YOU DRAW IS THE SIZE THAT RENDERS. The render takes the geometry
  verbatim now. Adjust a node in Obsidian and the mirror agrees on reload.
- **Start and terminal states are pills**: `"styleAttributes":{"shape":"pill"}`,
  around **320 × 160** — the state-machine start/end glyph. (Advanced Canvas
  shapes: `pill`, `diamond`, `parallelogram`, `circle`, `predefined-process`,
  `document`, `database`.)
- Flow left → right, ~140px gutters between nodes; comments above the flow.

## Checklist before shipping a canvas

1. Every `file` ref vault-relative (starts with `deliverable/` or, later,
   `spec/`) and resolves in Obsidian — open it and look.
2. `entry` names a drawn state; a terminal is reachable.
3. Every state note has `state`, `state_kind`, `priority`, and (unless
   terminal) `legal_tools` + `guidance` in frontmatter; every sub-canvas
   has `priority` in its `metadata.frontmatter`.
4. Node sizes fit their content; start/end are pills.
5. `node --test "tests/*.test.ts"` green — the compiler test loads the
   shipped canvases.
