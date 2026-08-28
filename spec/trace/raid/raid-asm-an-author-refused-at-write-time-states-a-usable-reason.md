---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-an-author-refused-at-write-time-states-a-usable-reason
type: "[[raid]]"
kind: assumption
statement: An author refused at write time writes a reason a later reader can act on, rather than the shortest text that clears the check.
owner: the maintainer
trigger: the first sweep of the departure list for reasons that say nothing
status: open
impact: The list fills with reasons that pass the check and answer no question, so the whole regime costs the write and returns nothing to the reader.
breaks_how_badly: corrosive
how_likely: expected
probe: not settled — the tree holds one departure, its reason is a good one, and one is not evidence
probed: 2026-08-26
source_refs:
  - req-an-exemption-without-a-reason-is-refused-at-write-time
  - fn-govern-a-conversation-under-a-stated-rule.record-a-departure-with-its-reason
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

The check that exists is thin by construction. `deliverable/engine/widgets.ts`
line 136 demands one non-space character after the dash, so the single letter
`x` is a legal reason today.

The probe is to read every reason already standing in
`deliverable/machines/widget-exemptions.md` and grade each one against a
single question: does it tell a reader who did not write it why this file is
not a second surface?

A majority answering yes holds it. A majority answering no falsifies it, and
the finding is that the write-time check has to demand a shape rather than a
character.

The sample is small, and that is itself the caveat. The exemption list holds
ONE declared departure today, measured 2026-08-26. One line cannot settle a
question about how authors behave, so the honest probe result here is a
scheduled one — re-read the list once the rule governs a second thing and the
list has grown.

## Probe result, 2026-08-26

NOT SETTLED INSIDE THE BOX, and the box was reading every departure the tree
holds.

THERE IS ONE. `deliverable/machines/widget-exemptions.md` line 51:

> deliverable/engine/bin/mermaid-check.ts — a diagnostic page a maintainer
> opens to see whether the diagrams in a document parse. It renders nothing
> about the walk and the panel never reaches it.

THAT IS A USABLE REASON. It says what the file is, what it does, and why the
rule does not apply to it. A reviewer deciding whether the exemption still
holds can act on it without opening anything.

SO THE ONE DATA POINT SUPPORTS THE ASSUMPTION. One data point is not evidence,
and the entry already said so.

WHY THE SAMPLE DID NOT GROW. The rule changed on 2026-08-23 and most of the
list went with it: it used to flag 21 files, then asked a narrower question and
left three, two of which were folded into the surface. So the tree is not
withholding departures; it genuinely has one.

THE HAZARD IS UNCHANGED AND IT IS NOT ABOUT THIS ENTRY. The refusal's remedy
pre-fills the reason slot with placeholder text and nothing checks it was
replaced. The one author who wrote a reason did not follow that remedy
verbatim. See
[[raid-iss-the-refusal-hands-the-author-a-placeholder-where-the-reason-goes]].
