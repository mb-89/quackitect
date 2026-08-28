---
id: i63-work-tokens-become-the-unit-of-work-and-
status: shipped
closed: 2026-08-27T21:15:05.412Z
carried_count: 2
carried:
  - tsp-a-person-steers-the-work-by-looking-and-dragging — raid-risk-a-state-must-mint-its-own-tokens-and-that-machinery-is-undesigned (verification.md)
  - tsp-the-corpus-models-work-the-way-it-says-it-does — raid-risk-a-state-must-mint-its-own-tokens-and-that-machinery-is-undesigned (verification.md)
started: 2026-08-25T13:07:39.976Z
opened: 2026-08-24T14:43:49.793Z
goal: "Work tokens become the unit of work, and the four difficulty ladders collapse to two. Every piece of work the agent does is a work token: a markdown file with open frontmatter, carrying its own guidance to read, its own evidence to produce, a complexity and a priority. A state cannot be left until its tokens are done, and each state shows a count of what it owes. Tokens live in buckets or on states, and either hand can move them. Reading (R0-R4) and the five-name rung (derive, transcribe, apply, author, frame) are removed entirely. Judgement (C0-C4) is renamed to complexity. What survives is complexity and autonomy, and nothing else."
vision: |-
  DONE LOOKS LIKE THIS.

  A work token is a markdown file under its own folder, with frontmatter a person can extend and the editor can filter on. It carries a statement, a complexity, a priority and a re-entry flag. It logs when it is opened and logs when it is done.

  The token list is its own editor surface. It shows every token, groups them into buckets, and lets a person drag one between buckets or onto a state. A person can author a token there by hand.

  The options pool renders as a state on the main machine that nobody enters. It holds every undone token not placed elsewhere, so open work is visible from the machine itself. Clicking it opens the editor.

  Each state carries a badge with the number of tokens it still owes, the way an unread count works. A state cannot be left until that number is zero.

  The lifetimes are two. An ephemeral token is minted when a state is first entered and disappears when it is done. A durable token is seeded once, and when it is done it stays with the state where that happened, as part of the iteration, no longer displayed.

  Re-entry follows four rules. A state left unfinished keeps its ephemeral tokens fresh. A state already finished and submitted is walked straight through. A reopened state reopens its ephemeral tokens and its finished durable tokens both. A late drop onto a running state is accepted, never refused.

  Submachines mostly stop existing. A spike takes tokens instead of seeding a submachine. Build steps take tokens instead of seeding a submachine. An iteration's tokens are seeded into the kickoff, which does not work them but moves them onward. Promoting a spike means not closing its token and moving it to the build step.

  The narration system is gone. The token's own open and done entries produce the graph the update ops build by hand today, so five refusal clauses that exist only to police narration are removed with it.

  The ladders are cut to two. Reading and the rung are removed from the engine, the machines, the guidance and the corpus. Judgement is renamed complexity everywhere it appears. Complexity says how hard the thinking is. Autonomy says whether the agent may decide alone. They are independent: mechanical work can demand hard thinking, and a tactical decision can be easy.

  Green stays computable in advance for everything except a token somebody drops in by hand. That loss is accepted and stated.
inputs:
  - dsp-the-options-pool
  - raid-iss-the-one-door-into-the-pool-is-shut-on-a-fresh-clone
  - raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker
  - raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated
  - raid-asm-a-state-is-equally-hard-at-every-change-size
  - i55-narration-gets-lean-the-decision-graph-s
  - i38-the-machine-sizes-its-own-driver-every-s
  - i17-the-options-pool-triage-a-raw-note-into-
depends_on: []
---

# i63-work-tokens-become-the-unit-of-work-and-

## Goal

Work tokens become the unit of work, and the four difficulty ladders collapse to two. Every piece of work the agent does is a work token: a markdown file with open frontmatter, carrying its own guidance to read, its own evidence to produce, a complexity and a priority. A state cannot be left until its tokens are done, and each state shows a count of what it owes. Tokens live in buckets or on states, and either hand can move them. Reading (R0-R4) and the five-name rung (derive, transcribe, apply, author, frame) are removed entirely. Judgement (C0-C4) is renamed to complexity. What survives is complexity and autonomy, and nothing else.

## Rough vision

DONE LOOKS LIKE THIS.

A work token is a markdown file under its own folder, with frontmatter a person can extend and the editor can filter on. It carries a statement, a complexity, a priority and a re-entry flag. It logs when it is opened and logs when it is done.

The token list is its own editor surface. It shows every token, groups them into buckets, and lets a person drag one between buckets or onto a state. A person can author a token there by hand.

The options pool renders as a state on the main machine that nobody enters. It holds every undone token not placed elsewhere, so open work is visible from the machine itself. Clicking it opens the editor.

Each state carries a badge with the number of tokens it still owes, the way an unread count works. A state cannot be left until that number is zero.

The lifetimes are two. An ephemeral token is minted when a state is first entered and disappears when it is done. A durable token is seeded once, and when it is done it stays with the state where that happened, as part of the iteration, no longer displayed.

Re-entry follows four rules. A state left unfinished keeps its ephemeral tokens fresh. A state already finished and submitted is walked straight through. A reopened state reopens its ephemeral tokens and its finished durable tokens both. A late drop onto a running state is accepted, never refused.

Submachines mostly stop existing. A spike takes tokens instead of seeding a submachine. Build steps take tokens instead of seeding a submachine. An iteration's tokens are seeded into the kickoff, which does not work them but moves them onward. Promoting a spike means not closing its token and moving it to the build step.

The narration system is gone. The token's own open and done entries produce the graph the update ops build by hand today, so five refusal clauses that exist only to police narration are removed with it.

The ladders are cut to two. Reading and the rung are removed from the engine, the machines, the guidance and the corpus. Judgement is renamed complexity everywhere it appears. Complexity says how hard the thinking is. Autonomy says whether the agent may decide alone. They are independent: mechanical work can demand hard thinking, and a tactical decision can be easy.

Green stays computable in advance for everything except a token somebody drops in by hand. That loss is accepted and stated.

## Inputs

- dsp-the-options-pool
- raid-iss-the-one-door-into-the-pool-is-shut-on-a-fresh-clone
- raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker
- raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated
- raid-asm-a-state-is-equally-hard-at-every-change-size
- i55-narration-gets-lean-the-decision-graph-s
- i38-the-machine-sizes-its-own-driver-every-s
- i17-the-options-pool-triage-a-raw-note-into-

## What was settled in conversation, 2026-08-24

The owner dictated this design at the front desk. Everything below is a ruling,
not a suggestion. It is written here because the conversation itself does not
reach version control.

### The name collision, and the ruling that clears it

THE WALK'S MARKER IS CALLED A TOKEN TODAY. `SE-C-123` in `guidance/refusals.md`
says "a three-way join used to be unreachable by a single token". The engine
and the guidance both use the word that way.

THE OWNER RULED IT: rename the walk's marker to THE POSITION. It was called a
token because several agents walking at once were expected, and that
expectation is dropped.

SO "TOKEN" MEANS WORK TOKEN, everywhere, once this lands. Every other use is
renamed rather than qualified.

### A token can be in work, and that is what replaces narration

A TOKEN HAS AN IN-WORK STATE. Before the agent does anything with a token, it
says it is working on that token.

THAT IS THE CHECKLIST. What the agent is doing is always known, from the token
itself, so the decision graph stops being a second machine driven by hand.

FIVE REFUSAL CLAUSES GO WITH IT, and they exist only to police narration:

- `SE-C-040` — the narration toll is due.
- `SE-C-120` — the update is malformed.
- `SE-C-121` — the node is unknown or resolved.
- `SE-C-122` — done over open children.
- `SE-C-133` — the checklist stopped moving.

This is what answers `i55-narration-gets-lean-the-decision-graph-s`.

### Gates read tokens

A GATE LOOKS AT THE TOKENS MINTED AND FINISHED BEFORE IT. That is the basis it
judges on, in place of the evidence it reads today.

### The pool has no exit door today, and this iteration builds one

`deliverable/engine/pool.ts` exports exactly two acts: `mintToken` at line 145
and `standingTokens` at line 255. Nothing removes a token, edits one, or merges
two. `spec/trace/design-spec/dsp-the-options-pool.md` lines 87 to 92 say that
was deliberate: no merge, no wake, no delete, no surface.

THE DOOR OUT IS ASSIGNMENT. Either hand moves a token onto a state, and that is
how it leaves the pool.

MOVING IS THE ORDINARY ACT. A token moves between states as normal work, not as
an exception.

### Priority is half-built already

`deliverable/engine/survey.ts:77` stamps `DEFAULT_PRIORITY` on every token, so
all 49 standing tokens read "could". The `WorkToken` type carries id, statement,
ready_when and source, and no priority at all (`pool.ts:7-12`).

The survey already has the column. Nothing fills it.

### Removing the two ladders costs nothing to migrate

NOT ONE MATRIX CELL IS RATED. A search for a `<column>_complexity` carrying a
`C0-4/R0-4` value across all 53 rows in `deliverable/machines/rigor_matrix/rows/`
returns zero hits. The word "complexity" appears twice in that whole folder and
neither is a rating.

SO THE REMOVAL IS A CODE AND PROSE CHANGE, with no data behind it. The pair is
declared at `rigor-matrix.ts:98-99`, parsed at `rigor-matrix.ts:104-123`, and
reduced to a rung at `sizing.ts:55-66`. The rung vocabulary is `sizing.ts:52`.

REMOVE ALL OF IT. Reading goes. The rung goes. Judgement is renamed to
complexity, because the letter C already stands for complexity and the name
"judgement" was a mistake.

WHAT SURVIVES IS TWO INDEPENDENT LADDERS, and the iteration must keep them
independent:

- COMPLEXITY — how hard the thinking is.
- AUTONOMY — whether the agent may decide alone.

THEY DO NOT TRACK EACH OTHER. Mechanical work can demand hard thinking. A
tactical decision can be easy.

THIS ALSO DISSOLVES `raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker`.
A submachine takes the maximum complexity over its rows today, so one hard item
drags every easy one onto an expensive hand. When each token declares its own
complexity there is no maximum left to take.

AND IT CLEARS `raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated`,
which is waiting on 154 cells nobody has rated.

### One thing the iteration must decide, and the owner accepted the cost

GREEN STOPS BEING FULLY KNOWABLE IN ADVANCE. A state seeds its tokens on first
entry, so almost everything is still computable ahead of the walk. What cannot
be predicted is a token a person drops in by hand.

THE OWNER ACCEPTED THAT: "we're not gonna refuse a late drop", and dropping in
is expected to be occasional and small.

SO A LATE DROP IS NEVER REFUSED. Green is recomputed instead.

### One correction the corpus still owes

`dsp-the-options-pool.md` still teaches the retired noun. It says the node lives
at `spec/trace/option/opt-<slug>.md` with type `[[option]]` at lines 34, 45 and
46. The engine writes `spec/trace/work-token/` with the `wt-` prefix
(`pool.ts:17` and `pool.ts:22`).

`i44-the-corpus-resolves-duplicate-headings-a` already owns that rename. Do not
do it here, and do not be misled by it while reading the design spec.
