---
unreachable_citations:
  - vp-vendoring.md
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: raid-iss-a-signed-vision-cites-a-value-prop-that-does-not-stand
type: "[[raid]]"
kind: issue
statement: "A signed vision evidence form names vp-vendoring among the resident goals, and no node of that name stands in the value-prop folder."
owner: the maintainer of the corpus
trigger: the next sweep that reaches references written in evidence prose
status: open
impact: "An iteration that inherits the goal system by pointer inherits a pointer that cannot be opened. The sweep this iteration arms reads frontmatter reference keys, and this citation sits in prose, so arming it does not catch the class."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - i44-the-corpus-resolves-duplicate-headings-a
weighs_with: none
weighs_against: none
---

## What was found

i45's `draft-vision` evidence lists seven resident goals: vp-rigor-without-toil,
vp-the-engine, vp-systematic-engineering, vp-the-ledger, vp-autonomy-range,
vp-qualities and vp-vendoring.

A glob of `spec/trace/value-prop/*.md` returns six files. There is no
`vp-vendoring.md`.

i44's own draft-vision was written from the glob rather than from the previous
form, which is how the seventh was caught.

## Why it is an issue and not a risk

IT HAS ALREADY HAPPENED. The form is signed, the citation is in it, and any
reader following the pointer today finds nothing.

## What is NOT being done about it here

THE FORM IS SIGNED EVIDENCE OF ANOTHER RECORD, so i44 does not edit it. An
amend belongs to the record that owns it.

WHAT i44 DOES OWN is the observation that its armed sweep would not have found
this. A reference in prose is a different class from a reference in a
frontmatter key, and only the second is swept.

## What would close it

Either the missing goal node is written, or the citation is corrected by the
record that owns the form. Whichever happens, the prose-reference class needs
its own decision about whether it is swept at all.
