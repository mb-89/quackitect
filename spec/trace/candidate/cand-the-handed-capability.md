---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: cand-the-handed-capability
type: "[[candidate]]"
name: The handed capability
statement: no rule at all, because a module nobody handed the capability cannot reach it
picks:
  - "[[opt-the-capability-is-handed-to-a-module-rather-than-imported-by-it]]"
---

## Why this one

It is the only line on the chart that removes the problem rather than governing
it, and the heuristics catalogue asks for exactly that — make the illegal
unrepresentable, not merely checked.

WHAT IT IS FOR. A guarantee rather than a check. No departure list, no reason
field, no sweep, no expiry, because none of those has anything to govern.

WHAT IT TRADES AWAY. Everything is paid at once. Nothing part-way is coherent,
and a probe put the number at 81 engine modules reaching the filesystem
directly with no partially-adopted seam to build on.

## How it works

One module reaches the capability. Every other module takes what it needs as a
parameter, from whoever composes it, up to the entry points.

### The seam is the composition

Where the system is assembled is where the capability is handed out.
Enumerating what a rule governs stops being a search and becomes a reading of
that assembly, which has an exact answer.

That is the whole appeal. No departure list, no reason field, no sweep, no
expiry, because none of them has anything to govern.

### What stays unchanged

The lane, the walk, the record and every surface. This is an internal change to
how engine modules obtain what they reach with.

## What it costs

### The measurement that decides it

[scratchpad/door-callers.mjs](scratchpad/door-callers.mjs) counted the engine,
2026-08-26. 178 TypeScript files.

| door | modules reaching it directly |
| --- | --- |
| disk | 81 |
| process | 29 |
| web | 17 |
| net | 6 |

Composition points under `deliverable/engine/bin`: **29**.

### The assumption this candidate leaned on is false

The draft said the composition points are few, and marked it unmeasured. It is
measured now, and the answer is 29.

THE CAPABILITY WOULD BE HANDED OUT IN 29 PLACES. A guarantee resting on 29
assembly sites is 29 places for one of them to reach directly instead, and
nothing in the language stops that.

WORSE, THE TWO SETS OVERLAP. 29 of the 81 disk-reaching modules ARE those entry
points. So 52 non-entry modules would be threaded from 29 different roots, and
the roots themselves are among the reachers.

### The size

The largest change on the chart, by a wide margin. 81 modules and every caller
above them, in one go.

A module that TAKES the capability as an argument and can STILL import it
directly has bought the whole cost and none of the guarantee. So a partial
adoption is not a smaller version of this candidate. It is a different, weaker
thing wearing its name.

### No intermediate state is green

The frozen-count option is on this chart precisely because 81 modules cannot
move at once. This candidate cannot use it.

### Make, reuse or buy

Make, and it is the only line where that is the whole answer.

## The mixed form, and what the measurement did to it

The draft proposed applying this to the version door alone — few callers, no
history, a real guarantee on one conversation for almost nothing.

THE COUNT DOES NOT SUPPORT "FEW". 16 engine files carry a git token, and
[deliverable/engine/gitlane.ts](deliverable/engine/gitlane.ts) carries 8 of the
37 mentions. It is the densest module, not the only one.

So the mixed form is still the cheapest way to get a real guarantee on one
conversation. It is not free, and the record should stop describing it that
way.

## What it leans on

- That the composition points are few. **FALSIFIED.** 29 entry points under
  `engine/bin`, measured 2026-08-26.
- That the language enforces it. It does not. Nothing stops a module importing
  the capability anyway, so the guarantee rests on nobody doing so — which is a
  rule again, wearing a structure's clothes.
- That the mixed form is coherent. One conversation handed and three governed
  by a rule is two mechanisms in one system. No finder examined what that costs
  a reader, and this record did not either.
- [[raid-asm-every-export-in-this-tree-is-declared-statically]] — probed, and
  it holds. It is what made the count above possible in one pass.
