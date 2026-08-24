---
id: i63-work-tokens-become-the-unit-of-work-and-
status: seeded
opened: 2026-08-24T14:43:49.793Z
goal: "Work tokens become the unit of work, and the four difficulty ladders collapse to two. Every piece of work the agent does is a work token: a markdown file with open frontmatter, carrying its own guidance to read, its own evidence to produce, a complexity and a priority. A state cannot be left until its tokens are done, and each state shows a count of what it owes. Tokens live in buckets or on states, and either hand can move them. Reading (R0-R4) and the five-name rung (derive, transcribe, apply, author, frame) are removed entirely. Judgement (C0-C4) is renamed to complexity. What survives is complexity and autonomy, and nothing else."
vision: "DONE LOOKS LIKE THIS.\n\nA work token is a markdown file under its own folder, with frontmatter a person can extend and the editor can filter on. It carries a statement, a complexity, a priority and a re-entry flag. It logs when it is opened and logs when it is done.\n\nThe token list is its own editor surface. It shows every token, groups them into buckets, and lets a person drag one between buckets or onto a state. A person can author a token there by hand.\n\nThe options pool renders as a state on the main machine that nobody enters. It holds every undone token not placed elsewhere, so open work is visible from the machine itself. Clicking it opens the editor.\n\nEach state carries a badge with the number of tokens it still owes, the way an unread count works. A state cannot be left until that number is zero.\n\nThe lifetimes are two. An ephemeral token is minted when a state is first entered and disappears when it is done. A durable token is seeded once, and when it is done it stays with the state where that happened, as part of the iteration, no longer displayed.\n\nRe-entry follows four rules. A state left unfinished keeps its ephemeral tokens fresh. A state already finished and submitted is walked straight through. A reopened state reopens its ephemeral tokens and its finished durable tokens both. A late drop onto a running state is accepted, never refused.\n\nSubmachines mostly stop existing. A spike takes tokens instead of seeding a submachine. Build steps take tokens instead of seeding a submachine. An iteration's tokens are seeded into the kickoff, which does not work them but moves them onward. Promoting a spike means not closing its token and moving it to the build step.\n\nThe narration system is gone. The token's own open and done entries produce the graph the update ops build by hand today, so five refusal clauses that exist only to police narration are removed with it.\n\nThe ladders are cut to two. Reading and the rung are removed from the engine, the machines, the guidance and the corpus. Judgement is renamed complexity everywhere it appears. Complexity says how hard the thinking is. Autonomy says whether the agent may decide alone. They are independent: mechanical work can demand hard thinking, and a tactical decision can be easy.\n\nGreen stays computable in advance for everything except a token somebody drops in by hand. That loss is accepted and stated."
inputs:
  - "dsp-the-options-pool"
  - "raid-iss-the-one-door-into-the-pool-is-shut-on-a-fresh-clone"
  - "raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker"
  - "raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated"
  - "raid-asm-a-state-is-equally-hard-at-every-change-size"
  - "i55-narration-gets-lean-the-decision-graph-s"
  - "i38-the-machine-sizes-its-own-driver-every-s"
  - "i17-the-options-pool-triage-a-raw-note-into-"
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
