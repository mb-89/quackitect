---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-report-separates-agrees-from-unexamined-from-absent
type: "[[option]]"
cluster: the-bootstrap
question: how a copy's own changes are represented
statement: a report of what a copy changed names, for every artifact, whether it agrees, was never examined, or is not present at all, because silence cannot mean all three
found_by: analogy
source: "textual criticism, the positive versus negative apparatus criticus, and TEI P5 chapter 13's witStart, witEnd, lacunaStart and lacunaEnd — tei-c.org/release/doc/tei-p5-doc/en/html/TC.html"
---

## Mechanism

TWO THOUSAND YEARS OF EDITING ONE TEXT ACROSS MANY COPIES produced a named
choice, and it is exactly the choice a drift report faces.

A NEGATIVE APPARATUS lists only the copies that DIVERGE. Compact, and ambiguous:
silence about a copy could mean it agrees, or that the page is missing, or that
the editor never checked it.

A POSITIVE APPARATUS lists the supporters of the accepted reading too. The
ambiguity is gone, and any single copy's full text can be reconstructed from the
record alone.

AND THE DISCIPLINE BUILT DEDICATED NOTATION FOR THE THIRD STATE, which is the
part worth taking. The machine-readable standard defines four separate markers
for where a copy starts, where it ends, where a gap opens inside it, and where
that gap closes. Those exist because "this copy is silent here" has three
different causes and conflating them corrupts every inference drawn afterwards.

## What transfers

THE THREE-STATE ANSWER. For each artifact a report covers: this copy matches
what it received; this copy departed, and here is how; this copy was never
compared, and here is why.

THAT IS THE GAP IN EVERY DERIVED MECHANISM ON THIS CHART.
[[opt-the-copys-changes-are-derived-on-every-update]] computes a delta and says
nothing about coverage. A derived report that cannot distinguish UNCHANGED from
NOT CHECKED is a negative apparatus, and a reader cannot tell a clean copy from
an unexamined one.

AND THE ABSENT CASE IS REAL HERE, not an analogy stretch. A copy may have
deleted an artifact outright, or may predate one the source added. Both look
like silence and neither is agreement.

## What breaks in translation

COMPLETENESS AND USABILITY ARE THE SAME AXIS, and the source domain has already
paid to learn it. A positive apparatus becomes impractical past roughly ten
copies. The standard critical edition of the Greek New Testament cites thirty
manuscripts out of five hundred and thirty for one book, and its apparatus is
negative BECAUSE the witnesses number in the thousands.

SO THE THREE-STATE REPORT IS AFFORDABLE ONLY AT SMALL SCALE. One copy against
one source is the cheap case and is what this product actually has. A source
reporting across many copies would face the same wall, and could not.

THE APPARATUS IS PARASITIC ON A PRIVILEGED BASE. Every entry says "here is what
the base has, and here is what others have". A design with no privileged version
has nothing to hang entries on, and the standard says as much about traditions
where establishing a base text is not a satisfactory goal.

THAT IS FINE HERE AND WORTH SAYING. A copy's base is what it received, which is
privileged by construction. The transfer works precisely because this problem
has the asymmetry the method needs.

## The constraint the source domain could not solve

OVERLAP HAS NO GOOD ANSWER, and the standard admits it. The readable encoding
cannot represent two departures whose spans cross without nesting. The encoding
that can is described by its own specification as lengthy, difficult, and
normally examined only with mechanical assistance.

COMPACT AND LOSSY, OR COMPLETE AND UNREADABLE. There is no third form, after two
millennia of people wanting one. A design here should expect to make the same
choice rather than to escape it.
