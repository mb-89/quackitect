---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-one-rule-fits-all-four-conversations-whatever-their-caller-count
type: "[[raid]]"
kind: assumption
statement: One predicate and two lists govern all four conversations equally well, so a door with 6 callers and a door with 81 want the same strictness, the same departure list and the same sweep interval.
owner: the driving agent
trigger: the first conversation whose departure list is written, if setting it forces a rule change the other three do not want
status: open
impact: One rule fitted to the disk door's 81 callers is loose enough to be useless on the network door's 6. One fitted to 6 refuses 81 modules on day one and gets turned off.
breaks_how_badly: crippling
how_likely: plausible
probe: holds, by 8 modules — the disk list would be 81 of 178, and the bar was over half
probed: 2026-08-26
source_refs:
  - evidence/gate-architecture.md — named as the kill criterion and deferred rather than answered
  - "[[opt-one-rule-per-conversation-rather-than-one-rule-for-every-reach]]"
  - "[[raid-dec-the-door-rule-governs-who-may-reach-and-never-what-the-reach-does]]"
  - "measured 2026-08-26: 81 disk, 29 subprocess, 17 web, 6 network, across 178 engine files"
---

## Probe

BUILD THE DEPARTURE LIST FOR THE TWO EXTREMES AND COMPARE THEM.

- Take the network conversation, 6 modules. Write the list that would let the
  tree pass on day one.
- Take the disk conversation, 81 modules. Write the same list.

THE QUESTION THE TWO LISTS ANSWER: does the same predicate produce a usable
list at both ends, or does one of them come out as a list of nearly every
module in the tree.

WHAT COUNTS AS FALSE. A day-one disk list holding more than half the governed
set. At that point the rule is not governing anything; it is recording that
almost everything is exempt.

WHAT COUNTS AS HOLDING. Both lists are short enough that a reader can read them,
and neither needs a rule change the other rejects.

IT IS CHEAP. Both lists are derivable from the counts already measured, and the
script that measured them is written.

## Why it was deferred rather than answered

The third decision rejected one-rule-per-conversation on the grounds that four
mechanisms cost more than one predicate and two lists.

THAT IS AN ARGUMENT ABOUT MECHANISM COUNT, and this assumption is about
STRICTNESS. The gate said so and named the gap rather than closing it.

## What it does NOT ask

IT DOES NOT ASK WHETHER FOUR DOORS ARE THE RIGHT FOUR. The neighbours walk
settled that, and it is not reopened here.

IT DOES NOT ASK ABOUT THE SWEEP INTERVAL as a separate question, although the
statement names it. The interval is unset for every conversation, so there is
nothing yet to compare.

## Probe result, 2026-08-26

HOLDS, AND THE MARGIN IS EIGHT MODULES.

`scratchpad/spikes.mjs` counted the governed set at 178 engine TypeScript files
and the reach per conversation.

| conversation | reaches it | share of the governed set |
| --- | --- | --- |
| disk | 81 | 45.5% |
| subprocess | 29 | 16.3% |
| web | 17 | 9.6% |
| network | 2 | 1.1% |

THE FALSIFICATION BAR WAS OVER HALF. The disk list comes in at 45.5%, so the
rule still governs more modules than it exempts. Eight more disk-reaching
modules would put it over.

WHAT THE NUMBERS ALSO SAY, and it was not what the probe asked. The spread is
81 against 2, which is forty to one rather than the thirteen to one this record
had been quoting. An earlier count put the network door at 6 by folding
`node:http` into it; that belongs to the web conversation and this count keeps
them apart.

SO THE ASSUMPTION SURVIVES ON THE LIST SIZE AND IS UNDER MORE PRESSURE ON THE
SPREAD. A rule fitted to 81 callers and a rule fitted to 2 are being asked to be
the same rule, and nothing here has yet asked whether their STRICTNESS wants to
match.
