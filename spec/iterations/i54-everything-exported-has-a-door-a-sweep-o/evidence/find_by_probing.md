---
form: find_by_probing
by: agent
signed_off: 2026-08-26T12:19:30.066Z
authors: agent
files: null
---

# Evidence form / find_by_probing

## current_situation

Six finders read. This one runs, and it earned its place immediately.

Two probes ran against the real tree with nothing stubbed. One confirmed an assumption. The other FALSIFIED a claim this record had already written into its own context drawing and had almost scored as its cheapest option.

That is the whole argument for a finder that runs rather than reasons.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| Does every engine module that reaches the filesystem go through the path resolver? | two searches | Nothing. Both counts ran over the real tree at its current head. The one approximation is that the reach was counted by import rather than by call site, so a module importing node:fs and never calling it counts as reaching. That direction flatters the resolver, and the result is bad for it anyway. | FALSE, and decisively. 81 engine modules import node:fs directly. 20 import the resolver. 15 appear in both lists, so 66 reach the filesystem with the resolver having nothing to say. Worse, the 15 do not pass THROUGH it — importing both means asking for an address and then reaching for the bytes. The resolver hands out addresses and has never mediated a reach. |
| Can a regular expression enumerate this tree's exports without adding a parser? | one search | Nothing. It ran over the real engine tree. The pattern covers the six declaration forms and would miss a computed export, which the sibling probe already established does not occur here. | HOLDS. One expression found 984 exported declarations across 156 files. No parser, no dependency, and the same technique the widget guard already uses at widgets.ts line 136. |

## options

- none

## dead_ends

- Giving the path resolver the second job of judging the reach. It is not dead as an option but it is dead as the CHEAP option, and the number that killed that reading is 15 of 81. Its node now carries the measurement rather than the belief.
- The claim that paths.ts is the tree's one well-adhered seam. This record's own draw-context said so on the strength of its 20 importers, and nobody set that against the 81. An importer count is not an adherence figure, which is the second time this record has made that exact mistake.

## follow_up

THE FALSIFIED CLAIM HAS TO REACH THE CONTEXT DRAWING, not just the option node. draw-context calls paths.ts the one soft edge that is already load-bearing, and a later reader would take that as measured when it was counted from one side.

EVERY OTHER OPTION ON THE CHART NOW STARTS FROM THE SAME PLACE. There is no partially-adopted door to extend. 81 modules reach the filesystem and 81 would have to change, whichever option wins.

THAT MAKES THE RATCHET AND THE FROZEN COUNT MORE IMPORTANT rather than less, because no option can now claim a cheap start.

WHAT WAS NOT PROBED AND SHOULD BE. Whether the 81 imports are 81 real reaches. The count is by import, and a module that imports and never calls inflates it. One pass over the call sites would tighten the number that every option is now sized against.

## anything_else

WHY THE OPTIONS FIELD SAYS NONE, since a finder producing no option looks like a finder that did not run.

Probing can produce an option or a dead end, and its own card says a probe that failed is evidence nobody has to pay for twice and is worth more than an option nobody tried.

BOTH PROBES HERE JUDGED OPTIONS THAT ALREADY STOOD rather than proposing new ones. One killed a reading of an existing option. The other confirmed the mechanism two other options depend on.

THAT IS THE HONEST OUTPUT and inventing an option to fill the field would be the fabrication the method warns about.

ONE THING THE PROBE CHANGED ABOUT HOW THIS RECORD READS ITSELF. It counted 20 importers of the resolver at M1 and called that adherence. It counted 5 importers of files.ts at M1 and correctly retracted that as an adherence figure. The same mistake was made twice in one record, caught once by reasoning and once by measurement, and only the measurement caught it before it reached a score.
