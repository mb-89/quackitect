# How to write machine canvases

(Lives in guidance/authoring/ — guidance is the method layer, spec is the
project record, the engine is code.)

The authoring rules for drawn machines. Written after the first canvas
shipped with paths Obsidian could not resolve (owner fix 2026-07-26) — so
the mistakes stay fixed. Follow this EVERY time a canvas is created or
edited; the compiler enforces most of it and refuses loudly, but layout and
paths it can only partially check.

## Paths — the rule that was broken

**The Obsidian vault root is `product/`.** Every `file` reference in a
canvas is VAULT-RELATIVE:

- right: `"file": "deliverable/machines/states/idle.md"`
- wrong: `"file": "states/idle.md"` (canvas-relative — Obsidian shows a
  broken node)
- wrong: `"file": "product/deliverable/machines/states/idle.md"`
  (root-relative — resolves in the engine, broken in Obsidian)

The compiler accepts the fallbacks, Obsidian does not. Author vault-relative,
always.

## start and end are MECHANICAL

Every machine has exactly ONE start and ONE end state — they are machinery,
not content: the machine enters at start (the machinery walks out of it on
the first tick) and is done when everything before end has transitioned
into it. ALL machines share the SAME two notes
(`deliverable/machines/states/start.md` / `end.md`, `state_kind: start` /
`end`) — never write machine-specific content into them, and never create
per-machine start/end notes. Draw both as pills. The end state is called
END (that is its state-machine name), not "done".

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
                             # se_tick is ALWAYS legal — it is the machinery)
guidance: One or two short sentences the agent gets in its packet. Never empty.
priority: 0.25               # HUMAN INVOLVEMENT: the weight of ENTERING this
                             # state, 0.01 .. 1 (required — see the scale below)
tags: review                 # optional; joins the state to guidance (the pull's tag rule)
exit_read:                   # conditions are FLAT keys: <entry|exit>_<type>.
  - workspace/AGENTS.md      # YAML lists render as chips in Obsidian —
  - product/guidance/voice.md    # comma strings are accepted too
exit_script:
  - product/deliverable/engine/bin/preflight.ts
---

# Statement of the state

Prose for the human reader: why this state exists, how it will grow.
Optionally `## Evidence form` with lines "- name | description | required".
```

`legal_tools` is about TOOLS only — legal STATES are the machine's edges.
Keep `guidance` short and imperative; it is served verbatim in packets.

Conditions: every `entry_<type>`/`exit_<type>` key names a condition TYPE,
defined by its note in `deliverable/machines/conditions/<type>.md` — the
compiler refuses a type without a note and an engine evaluator, and refuses
a nested `entry:`/`exit:` dictionary (Obsidian renders those as JSON
blobs). All of a state's conditions must hold (SCXML: the edge's effective
cond is exit of its source AND entry of its target). Types today: `read`
(args: documents whose PROVEN reading is the evidence — the agent sends
each doc's current hash on the tick, the human checks each doc once per
version in the mirror; see the condition note) and `script` (args: scripts
the engine runs; exit 0 is the evidence — the STATE names what runs, e.g.
boot's preflight and selftest scripts).

THE PULL GATES ENTRY (owner ruling 2026-07-26): outside boot, entering a
state also demands its pulled guidance proven read, the same way — hashes
from the agent, checks from the human. Boot is exempt (it is where the
first reads happen); a state's own `exit_read` list is excluded from its
entry demand (that is the state's assignment, read inside it).

## Priority — the human-involvement scale

Every state carries a `priority`, the weight of the DECISION TO ENTER it.
The session runs with an AUTONOMY (CLI at launch, the mirror's slider,
live): the agent enters a state by itself only when
`priority <= autonomy`; the human always may, and work INSIDE a state is
never gated — only entering is. So autonomy 0 is manual mode (the human
clicks through everything, even mechanical steps), 0.5 is everyday work,
1 is fully autonomous — at 1 even the killers are the agent's.

The scale (calibrate against these anchors, don't invent new bands):

- **0.01 — mechanical.** No decision content at all: start/end pills,
  boot's steps, idle. The floor is 0.01, not 0, so that autonomy 0 blocks
  even these.
- **0.25 — routine.** A step anyone would take the same way: listing,
  archiving, picking from an obvious set.
- **0.5 — everyday decision.** Judgment involved, wrong choice is cheap to
  undo: starting an expedition, choosing which one to continue.
- **0.75 — consequential.** Hard to undo or shapes what follows: closing
  and merging an expedition, accepting a design.
- **0.9 — killer / milestone.** The decisions the whole walk exists to
  surface. 0.9 does NOT mean "always human" — it means the human holds it
  until they deliberately slide there.
- **1 — ideation.** No state carries priority 1; it is the slider's last
  notch. At 1 the agent, left idle, finds its own work — pending notes,
  backlog, research. (The behavior ships later; until then 1 acts as 0.9.)

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

- Size a state node to DISPLAY its whole note: state notes as written here
  need roughly **620 × 640**. Compute, don't guess: ~28px per rendered line
  plus ~120px chrome, and keep nodes square-ish.
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
