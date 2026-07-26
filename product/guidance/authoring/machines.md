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
tags: review                 # optional; joins the state to guidance (the pull's tag rule)
entry:                       # optional DICTIONARY — same shape as exit
exit:                        # optional DICTIONARY: key = condition TYPE, value = args
  read: workspace/AGENTS.md, product/guidance/voice.md
  script: product/deliverable/engine/bin/preflight.ts
---

# Statement of the state

Prose for the human reader: why this state exists, how it will grow.
Optionally `## Evidence form` with lines "- name | description | required".
```

`legal_tools` is about TOOLS only — legal STATES are the machine's edges.
Keep `guidance` short and imperative; it is served verbatim in packets.

Conditions: every `entry:`/`exit:` KEY is a condition TYPE, defined by its
note in `deliverable/machines/conditions/<type>.md` — the compiler refuses
a key without a note and an engine evaluator. All keys of a dictionary must
hold (SCXML: the edge's effective cond is exit of its source AND entry of
its target). Types today: `read` (args: documents whose confirmed reading
is the evidence) and `script` (args: scripts the engine runs; exit 0 is the
evidence — the STATE names what runs, e.g. boot's preflight script).

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
3. Every state note has `state`, `state_kind`, and (unless terminal)
   `legal_tools` + `guidance` in frontmatter.
4. Node sizes fit their content; start/end are pills.
5. `node --test "tests/*.test.ts"` green — the compiler test loads the
   shipped canvases.
