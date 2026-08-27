---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-every-piece-of-work-is-one-addressable-item
type: "[[requirement]]"
statement: "The system shall carry every piece of work as an item with its own identity, its own place, its own status and its own evidence."
kind: functional
verify_method: inspection
breaks_if_removed: "Work stays a field inside a form, so nothing can point at it, move it or count it, and no surface can say which piece is open and which was skipped."
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-route-outstanding-work-to-where-it-is-done
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "kickoff goal: every piece of work is a work token, one file per item"
  - raid-dec-completeness-beats-flow-at-a-position-boundary
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

FOUR PROPERTIES, AND EACH ONE IS A THING THE PRESENT SHAPE CANNOT DO.

| property | what it buys | what is missing today |
| --- | --- | --- |
| identity | the item can be pointed at from anywhere | a field in a form carries no id |
| place | the item can be moved to where its work belongs | nothing carries work between states |
| status | attempted, rejected and skipped are recordable | a field is filled or it is not |
| evidence | the result lives on the item | the result lives in a second document |
| complexity | it can be routed to a hand that can carry it | a form has one difficulty for all of it |
| priority | what matters most is readable off the row | the column exists and nothing fills it |

THE REGISTER ALREADY LEARNED THIS. Its own method says a table row inside one
iteration's evidence carries no id, so nothing can point at it and a later
iteration cannot pick it up. Work never learned it.

PRIORITY IS HALF-BUILT ALREADY AND THAT IS THE POINT. The survey stamps a
default on every pooled item, so all of them read the same, and the type
carries no priority at all. The column is there and nothing fills it.

IT NAMES NO STORE. Whether the item is a file, a row or a log entry is the
design's to choose. What this row demands is that the four properties exist.
