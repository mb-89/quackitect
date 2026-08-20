---
minted_in: i1
id: uc-get-work-routed
type: "[[use-case]]"
statement: Turn a sentence about wanted work into the right vehicle to hold it.
actor: stk-engineer-driving-agents
trigger: the person has work in mind and no record open for it
precondition: the front desk is reachable
guarantee: the work sits in exactly one vehicle, chosen by the person, with the reasoning recorded
refines:
  - sty-next-iteration
  - sty-hand-over-and-walk-away
priority: must
---

## Main scenario

1. The person says what they want, in their own words, with no format asked of them.
2. The desk reads the live system: every open record, every pending note, the doors that stand this minute.
3. It judges the size first, then the vehicle that fits that size.
4. It recommends the smallest vehicle that still honours the gates, says why in a sentence or two, and names the second-best option with its cost.
5. The person chooses.
6. The desk carries the paperwork, filling the record from what was just said so the person confirms rather than composes.

## Extensions

- 1a. Several pieces of work arrive in one message. The desk sorts them and recommends per piece, rather than bundling them into one record.
- 3a. The work is a single small fix. The desk refuses to open a record for it and puts it in the open one instead.
- 3b. The work is a doubt or an idea rather than a task. It becomes a note, and no record opens.
- 5a. The person rejects the recommendation. The desk takes the word without arguing and does what they chose.
- 6a. Nothing the person said fits any vehicle. The desk says so and asks, rather than seeding something and hoping.
