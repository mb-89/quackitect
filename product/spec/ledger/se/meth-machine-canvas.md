---
id: se.meth-machine-canvas
kind: method
statement: How to author a state machine as an Advanced Canvas drawing in the ledger - the canvas plus its state notes are the single source; a load-time compiler feeds the engine.
provenance:
  iteration: i2f-machines-are-canvases
  ai_involvement: agent-drafted
---

## The form

- One machine = one canvas file in the ledger plus one note per state.
- The canvas frontmatter carries the machine identity: `id`, `kind: machine`, `statement`, `entry` (the initial state), `reentry` (`restart` or `resume`).
- A state is a file node pointing at its `machine_state` note. The note carries the details.
- A text node is a comment. The compiler skips it; annotate drawings freely.
- A file node pointing at another machine's canvas nests that machine (turn the portal on to see it inline).
- An edge's role rides the edge popup menu (the custom style attribute `role`; no selection means `normal`).
- An edge's label is the guard, nothing else: `<counter> <op> <int>`, e.g. `verify_attempts < 3`.
- A group node's label becomes the diagram group of the states drawn inside it (presentation only).
- Never drawn, owned by the executor: escape-to-parent, ask-human, and the priority order `authored > fallback > escape > ask-human`.
- The feature tour lives in [machine-tutorial.canvas](machine-tutorial.canvas).

## The state note
- Frontmatter: `id`, `kind: machine_state`, `machine`, `state`, `state_kind` (`work` | `gate` | `terminal`), `filled_by` (`agent` | `engine`), `command` (engine-filled only), `statement`.
- Body section `## Guidance`: the method slice served with the step.
- Body section `## Evidence form`: one field per line, `name | description | required` (or `optional`). Absent section means an empty form.
- Optional `submachine`: a machine's ledger id, or `iteration` - the iteration may provide its own drawing in its own directory. One-shot sub-machines (a build list) stay with the iteration as events; they are never templates.

## The compiler
- Runs at load, writes nothing. The compiled machine exists only in memory - a committed intermediate form would be a second source of truth.
- The canvas version is pinned (Advanced JSON Canvas `1.0-1.0`); unknown versions and shapes refuse loudly with the offending element named.
- Validation at compile: entry exists, edges target drawn states, every state reaches a terminal, engine-filled states declare a command, guards parse, roles are known.

## First instances
- [machine-systematic.canvas](machine-systematic.canvas)
- [machine-session.canvas](machine-session.canvas)
- [machine-offer.canvas](machine-offer.canvas)
