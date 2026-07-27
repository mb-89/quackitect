---
form: expedition-leave
status: done
by: agent
files:
---

# e7 — the seeded container

## What was the goal

continue_expedition redesigned per the owner's model: no pick state — the machine's states ARE the open expeditions, generated from the records at entry; clicking one is the pick; one coming home completes the machine; empty runs start to end.

## What was done

- engine/expmachine.ts: the generator. States instantiated from the AUTHORED notes (states/work.md, states/leave.md — the single source; ids, statements and edges overridden per expedition). Statement = the record's goal. Synthetic drawing: one labeled group box per expedition, work → leave inside, start and end as pills.
- Kernel finding folded in: multiple normal edges into end AND-join — one expedition finishing would never have activated end. The leave→end edges are ALTERNATIVE (the kernel's OR path).
- Session: seeding intercepts continue_expedition and generates; entering an expedition's states AUTO-BINDS its worktree (the click is the pick); the mirror serves the generated drawing both while walking and when browsing. The drawn canvas is now a stub carrying the frontmatter; pick.md is retired.
- Owner redlines from the live e6 look, folded in: the note input styled like the filter, tools render as LINKS everywhere (never buttons) with a short "tool disabled" toast outside their state, "all" expands into the human-callable links (pull-style collapsible), the escape button sits right-aligned beside expand, locked-button tooltips list one missing item per line.

## What settled it

61/61 selftests green. New coverage: empty container runs start→end; two expeditions generate [start, e1, e1-leave, e2, e2-leave, end] with goals as statements and the leave gate on every instance; entering binds the worktree; the gate refuses until the page passes; close + end + return to idle with one expedition home; re-entry regenerates without the closed one and draws gray. The client-script parse guard caught a tooltip escaping bug before it shipped.

## What was not done

- The container's own mirror redline round — the owner sees the generated drawing next reconnect.
- Sub-machine states inside expeditions (true nesting) — the flattened per-expedition states carry the semantics for now; the kernel's token model is ready when machines grow richer.
- Archive browsing of closed records in the mirror — still the next round (retro lane).

## Files

Verification is the selftest suite in-tree; no separate evidence files.
