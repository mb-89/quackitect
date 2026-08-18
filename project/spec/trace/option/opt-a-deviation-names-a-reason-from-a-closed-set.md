---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-deviation-names-a-reason-from-a-closed-set
type: "[[option]]"
cluster: the-bootstrap
question: how a copy's own changes are represented
statement: a departure is void until its reason is filed from a fixed vocabulary, with the change and the reason each pointing at the other, and something with standing may reject it
found_by: analogy
source: "California Building Code § 1.8.6.2, local modification by ordinance or regulation, implementing California Health and Safety Code § 17958.7 — read at up.codes/s/local-modification-by-ordinance-or-regulation"
---

## Mechanism

THE CODE'S OWN SENTENCE IS THE DESIGN. A local government amending the state
building code must make express findings, and "No modification shall become
effective or operative unless the following requirements are met: The express
findings shall be made available as a public record. A copy of the modification
and express finding, each document marked to cross-reference the other, shall be
filed with the California Building Standards Commission… The California Building
Standards Commission has not rejected the modification or change."

THREE THINGS ARE DOING WORK THERE, and they are separable.

- THE COUPLING IS MECHANICAL AND BIDIRECTIONAL. The change and the reason each
  carry a pointer to the other, so neither can be found without the other. A
  reason filed somewhere else is a reason nobody reads.
- THE REASON COMES FROM A CLOSED SET. Only three categories are permitted:
  climatic, geological, or topographical. A departure that is not one of those
  cannot be made at all.
- SOMETHING MAY SAY NO. The modification does not take effect while a central
  body has rejected it.

## What transfers

THE CLOSED VOCABULARY IS THE PART WORTH TAKING, and it is the part a software
design would skip. An open text field for "why" fills with "needed for our use
case" within a month. A fixed set forces the copy's owner to say which KIND of
departure this is, and makes the set itself arguable — if a real departure fits
no category, the categories are wrong and that is a finding.

THE BIDIRECTIONAL POINTER is cheap and load-bearing. It is the difference
between a reason that travels with the change and a reason in a document nobody
opens.

AND THE VOID-UNTIL-FILED ORDERING matters more than it looks. The reason is
captured when the change is made, while the intent is still known, rather than
reconstructed at update time from a diff. That is the same separation IN TIME
this iteration's contradiction pass recorded.

## What breaks in translation

VOID-UNTIL-FILED NEEDS A REJECTING AUTHORITY, and most software has none.
California's mechanism works because the Building Standards Commission can
refuse. Remove the body with standing to say no and the requirement degrades
into a mandatory text field, which is a form without a mechanism.

THAT LEAVES TWO HONEST CHOICES HERE. Either the machine itself is the authority
and refuses on rules it can check — the category is not in the set, the pointer
does not resolve — or there is no authority and the filing is a record rather
than a gate. The first is real and much smaller than California's. The second is
Chromium's `Local Modifications` field, checked for format only, which its own
presubmit cannot stop from lying.

AND THE THREE CATEGORIES DO NOT CARRY. Climatic, geological and topographical
are the right closed set for buildings and say nothing about method artifacts.
The transfer is the CLOSEDNESS, not the contents, and deciding the contents is
work this option hands to record-adrs.

## How it relates to the option beside it

[[opt-an-undeclared-change-refuses]] CAME FROM SOFTWARE and says the machine
refuses while a difference is undeclared. This came from law and says what a
declaration must LOOK like to be worth having.

THEY ARE ONE MECHANISM AND TWO HALVES. The first is the gate; the second is the
form the gate accepts. A candidate taking one without the other gets either a
refusal nobody can satisfy meaningfully, or a vocabulary nothing enforces.
