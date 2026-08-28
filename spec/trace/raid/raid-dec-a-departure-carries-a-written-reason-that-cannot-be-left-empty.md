---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-dec-a-departure-carries-a-written-reason-that-cannot-be-left-empty
type: "[[raid]]"
kind: decision
statement: A module allowed past the door rule is recorded in one central list with a reason in the author's own words, the entry is refused when that reason is empty, and no refusal pre-fills the slot with placeholder text.
owner: the maintainer
trigger: the first departure recorded whose reason nobody can act on, or a later record that wants departures to cite a decision instead
status: decided
impact: If this proves wrong, the departure list fills with entries that look answered and say nothing, and the rule reports a governed tree while the reasons behind every exception are unreadable.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - "[[raid-iss-the-refusal-hands-the-author-a-placeholder-where-the-reason-goes]]"
  - "[[raid-asm-an-author-refused-at-write-time-states-a-usable-reason]]"
  - evidence/graft-onto-the-winner.md — graft 1 adopted, graft 2 measured at three axes down
  - https://biomejs.dev/analyzer/suppressions/ — the explanation is part of the suppression syntax
---

## What was decided

THE REASON IS MANDATORY AND IT IS FREE TEXT.

- One central list holds every departure, one entry each.
- An entry with no reason is REFUSED, not ignored.
- The refusal that sends an author to the list hands them no placeholder to
  leave in place.

## Why the reason is mandatory

BIOME'S SUPPRESSION SYNTAX ALREADY WORKS THIS WAY, and it is stricter than what
this tree does today. `// biome-ignore-all lint/rule: <explanation>` refuses a
suppression carrying no explanation.

THE TREE'S OWN MECHANISM DOES THE OPPOSITE.
[deliverable/engine/widgets.ts](deliverable/engine/widgets.ts) line 166 hands
the refused author a ready-made patch whose reason slot is literal placeholder
text, and
[deliverable/machines/widget-exemptions.md](deliverable/machines/widget-exemptions.md)
line 30 concedes that a bullet with no reason is ignored on purpose.

So the one mechanism that would produce evidence about whether refused authors
write usable reasons invites a non-answer. The whole tree carries one departure.

## Rejected options

### A departure cites a DECISION NODE rather than carrying prose

This is the shape ruled at `adr-grandfathers-historical`, readable at ref `v2`
under `product/spec/ledger/se/`. Every exemption marker carried a decision id,
and `test-grandfathers-decided` failed an exemption whose citation did not
resolve.

IT IS STRICTER THAN WHAT WAS CHOSEN. A sentence can be copied down a column and
nothing notices; a citation either resolves or it does not.

WHY IT LOST, AND IT WAS MEASURED RATHER THAN ARGUED. A clean-context hand scored
the design carrying it: the one-copy axis fell 4 to 3, coverage fell 3 to 2, and
exactness fell 3 to 2, against two axes gained. Net minus one.

ITS REASONS, in the scorer's own words: the citation splits a departure's
justification across the list entry and a decision document; a legitimate
departure cannot be recorded until that document exists; and the day-one
pressure is toward fabricated citations.

THE MECHANISM IS ALSO ABSENT FROM THIS TREE. A search for its four names returns
13 hits, all inside this record's own spec folder, none in engine code or a
test. There are no decision documents to cite yet, which is what makes the
day-one problem real rather than theoretical.

NOT JUDGED WRONG FOREVER. A tree that already carried decision documents would
score it differently, and the scorer's own reasons say so.

### The departure is declared at the site rather than in a central list

Biome's route, and it keeps the reason next to the code it excuses.

WHY IT LOST. It scatters the list across every file holding a departure, which
turns one coverage answer into a gathering pass followed by a judging pass.
Coverage is what the record was for.

### Leave the reason optional, as today

WHY IT LOST. It is the standing behaviour and it produced one departure and one
documented rule that a reasonless bullet is ignored.

## Consequences

- [deliverable/engine/widgets.ts](deliverable/engine/widgets.ts) line 166 stops
  pre-filling the reason slot. That is the first task and it is small.
- The exemption reader refuses an empty reason instead of ignoring it, which
  changes an existing behaviour that was deliberate.
- NEITHER CHANGE BUYS A REASON WORTH READING. No machine can check that, and no
  candidate in this record claimed otherwise. What they buy is that the easiest
  path stops producing a non-answer.
- [[raid-asm-an-author-refused-at-write-time-states-a-usable-reason]] remains
  the named kill criterion, with a sample of one. This decision is what makes a
  larger sample possible.
- A later record wanting the citation shape must answer the day-one problem
  first. Re-proposing it without that answer re-runs a measurement already on
  the record.
