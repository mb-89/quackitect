---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-outstanding-work-is-listed-narrowed-and-grouped-in-one-place
type: "[[requirement]]"
statement: "The system shall narrow the list of outstanding work by any field that work carries, and shall gather chosen rows into a group that carries them to a destination."
kind: functional
verify_method: demonstration
breaks_if_removed: "Deciding what happens next means reading three stores by hand, so browsing the backlog ends in a survey rather than in a decision."
breaks_how_badly: crippling
refines:
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - "uc-route-outstanding-work-to-where-it-is-done steps 1 to 3 and extensions 1a and 2a"
priority: should
weighs_with:
  - none
weighs_against:
  - req-a-states-outstanding-count-is-read-at-a-glance > one place to see every open thing is the capability; reading a single count quickly is the polish on it
  - none
---

## Detail

THE LIST ITSELF ALREADY STANDS. req-the-pool-answers-a-person-and-an-agent-from-one-source
serves it from one source, req-table-rows-derive-from-notes derives its rows
on every look, and req-grouping-and-sorting-hold keeps the counts whole. This
row adds the two acts none of them demands.

| act | what it means |
| --- | --- |
| narrow | on any field the work carries, not on a fixed set somebody chose in advance |
| group | the rows a person intends to act on together, held as one thing that carries them |

WORK THAT DOES NOT EXIST YET IS ADDED HERE. A person writes a row, and from
that moment it is a piece of work like any other.

A NARROWING THAT MATCHES NOTHING IS WIDENED. The surface says the narrowing
found nothing rather than reporting that there is no work.

FILTER, FOLD AND SCROLL CODE ALREADY EXISTS ACROSS SEVEN SURFACE FILES.
Whether that is one mechanism or seven copies is not known. If it is
several, this round folds them rather than adding an eighth.
