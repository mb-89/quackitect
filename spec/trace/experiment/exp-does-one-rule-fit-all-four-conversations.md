---
unreachable_citations:
  - scratchpad/spikes.mjs
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-does-one-rule-fit-all-four-conversations
type: "[[experiment]]"
statement: Does one predicate govern the 81-caller disk door and the 2-caller network door alike, measured as the share of the governed set each door's day-one departure list would hold?
probes:
  - raid-asm-one-rule-fits-all-four-conversations-whatever-their-caller-count
timebox: one script and its printed output
form: script
chunk: none — the whole governed set was counted, not a sample
faked: none. The real engine tree was walked and the real import graph read. What was NOT measured is strictness, which the assumption's statement also names and no count can answer.
fallback: pre-agreed at seeding. If the disk list came out over half the governed set, the third decision reopens and one rule per conversation goes back on the table.
verdict: holds
measured: 2026-08-26. The governed set is 178 engine TypeScript files. Disk reaches 81, or 45.5 percent. Subprocess 29, web 17, network 2. The falsification bar was over half, so the margin is 8 modules.
folds_to: The kill criterion the architecture gate deferred is now answered, and the deferral closes. The spread correction from thirteen-to-one to forty-to-one goes into any later argument about mechanism count, because the third decision reasoned from the wrong figure. Nothing reopens.
promote: none - the finding is the product, and the counting script is throwaway
source_refs:
  - rank-unknowns, the seeded pick
  - evidence/gate-architecture.md — where the kill criterion was named and deferred
---

## Setup

`scratchpad/spikes.mjs` walked every TypeScript file under `deliverable/engine`, excluding declaration files, and read each one's imports.

Four conversations were counted separately: disk, subprocess, web and network. A module counts once per conversation it reaches, so the four counts overlap.

The day-one departure list for a conversation is every module that reaches it. Nothing is exempt on day one, so the list size IS the reach.

## Result

HOLDS, AND THE MARGIN IS EIGHT MODULES.

| conversation | reaches it | share of the governed set |
| --- | --- | --- |
| disk | 81 | 45.5% |
| subprocess | 29 | 16.3% |
| web | 17 | 9.6% |
| network | 2 | 1.1% |

The bar was a disk list holding more than half. At 45.5 percent the rule still governs more modules than it exempts. Eight more disk-reaching modules would put it over.

### The spread was also corrected

The spread between the widest door and the narrowest is 81 against 2, which is forty to one.

This record had been quoting thirteen to one. That earlier figure put the network door at 6 by folding `node:http` into it. `node:http` belongs to the web conversation, and this count keeps them apart.

### What the run did not settle

The assumption's statement names STRICTNESS as well as list size. A rule fitted to 81 callers and a rule fitted to 2 are being asked to be the same rule, and no count answers whether their strictness wants to match.

That half is still open, and the widened spread puts more pressure on it than the original figure did.
