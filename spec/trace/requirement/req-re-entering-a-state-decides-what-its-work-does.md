---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-re-entering-a-state-decides-what-its-work-does
type: "[[requirement]]"
statement: When the walk reaches a state it has stood in before, the system shall decide what happens to that state's work from how the state stands, and shall accept work dropped onto a running state rather than refusing it.
kind: functional
verify_method: test
breaks_if_removed: Re-entry is the ordinary case rather than the exception, and with nothing ruling it a second entry either loses finished work or asks for it twice.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - "record.md line 40: re-entry follows four rules"
  - "record.md lines 156 to 165: green stops being fully knowable in advance, and the owner accepted that — we are not gonna refuse a late drop"
  - req-a-work-token-survives-its-methods-rewording
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

FOUR CASES, AND EACH IS A DIFFERENT ANSWER.

| how the state stands | what happens to its work |
| --- | --- |
| left unfinished | its temporary work stays as it was, still open |
| finished and signed | the walk goes straight through and nothing is remade |
| reopened | its temporary work reopens, and so does the finished work that belongs to the record |
| running, and something is dropped onto it | the drop is accepted, never refused |

THE LATE DROP IS THE ONE THAT COSTS SOMETHING, and the cost was accepted
rather than discovered. What a state owes stops being fully knowable in
advance, because a person can add to it at any moment. Everything else is
still computed on first entry, so the loss is bounded to what somebody places
by hand.

GREEN IS RECOMPUTED RATHER THAN REFUSED. That is the whole of the ruling: a
drop never bounces, and whatever the surface said a moment ago is worked out
again.

THE TWO KINDS OF WORK BEHAVE DIFFERENTLY ON A REOPEN, which is why the row
names both. Temporary work is remade; work belonging to the record is
reopened where it stands.
