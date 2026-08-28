---
form: the-handed-capability
by: agent
signed_off: 2026-08-26T12:30:58.418Z
authors: agent
files: null
---

# Evidence form / the-handed-capability

## current_situation

cand-the-handed-capability carried three drafted sections from build_chart. It is the only line on the chart that removes the problem rather than governing it.

Its first stated assumption was that the composition points are few, marked unmeasured.

That assumption is what the candidate rests on. Nothing had measured it.

## built

spec/trace/candidate/cand-the-handed-capability.md — the three sections rewritten, with the candidate's own load-bearing assumption falsified by measurement.

### The measurement

scratchpad/door-callers.mjs, run 2026-08-26. It walks deliverable/engine, reads every .ts file, and matches each door's reach.

- 178 TypeScript files in the engine.
- disk: 81 modules reach node:fs directly.
- process: 29 modules reach node:child_process.
- web: 17 modules reach node:http, node:https or fetch.
- net: 6 modules reach node:net, node:http, node:dgram or node:tls.
- composition points under deliverable/engine/bin: 29.
- modules importing deliverable/engine/paths.ts: 20.

### What the number does to the candidate

THE ASSUMPTION IS FALSE. The draft said the composition points are few. There are 29. A guarantee resting on 29 assembly sites is 29 places for one of them to reach directly instead, and nothing in the language stops that.

THE TWO SETS OVERLAP. 29 of the 81 disk-reaching modules ARE the entry points. So 52 non-entry modules would be threaded from 29 different roots, and the roots themselves are among the reachers.

NO PARTIAL ADOPTION IS COHERENT. A module that takes the capability as an argument and can still import it directly has bought the whole cost and none of the guarantee. A partial adoption is not a smaller version of this candidate; it is a weaker thing wearing its name.

### The mixed form, corrected

The draft proposed applying this to the version door alone, calling it almost free because that door has few callers.

MEASURED: 16 engine files carry a git token, and deliverable/engine/gitlane.ts carries 8 of the 37 mentions. It is the densest module, not the only one.

So the mixed form is still the cheapest route to a real guarantee on one conversation. It is not free, and the record should stop saying so.

## follow_up

- The per-door caller counts are the first numbers this record has for doors other than disk. They belong in the evaluation, because three of the four doors are an order of magnitude smaller than the disk door. A rule that is impossible for 81 modules may be easy for 6.

- scratchpad/door-callers.mjs is a scratchpad file and will not survive. If the counts matter to a later record, the script belongs in the engine as a check rather than in the workbench.

- The 29 entry points under engine/bin are worth a second look on their own. Nothing in this record asked why the engine has 29 command-line entry points, and that is a question about the tree's shape rather than about doors.

## anything_else

This compose state did what rule 5 asks and it changed the answer.

The draft named the assumption accurately, marked it unmeasured, and carried on. That is the exact failure shape the contract describes: the defect gets named in the right place with the right severity, and the work continues past it as though naming were fixing.

Measuring it took one script and 93 milliseconds. The candidate now loses on its own terms rather than on a guess, which is worth more to the evaluation than a candidate that survived because nobody counted.
