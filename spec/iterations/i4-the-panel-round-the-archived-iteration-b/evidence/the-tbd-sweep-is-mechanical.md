---
form: the-tbd-sweep-is-mechanical
by: agent
signed_off: 2026-08-23T19:40:16.339Z
authors: agent
files:
---

# Evidence form / the-tbd-sweep-is-mechanical

## current_situation

THE MARKERS WERE BANNED IN ONE FIELD AND NOWHERE ELSE. Every item template lists TBD, TBC, TBR and a bare row of question marks as banned in a node's `statement`, and the write guard refuses one there.

ANYWHERE ELSE IN THE SAME FILE THEY LANDED SILENTLY and waited for a reader who happened to look.

## built

THE SWEEP READS FIELDS NOW. `deliverable/engine/bin/sweep.ts` walks every markdown file under `spec/` and checks the frontmatter block for the same four markers the templates ban.

ONE VOCABULARY, NOT TWO. The markers are the templates' own, so a marker banned at the write is the same marker found by the sweep.

IT NAMES THE FILE, THE LINE AND THE FIELD. A count with no roll call is a warning nobody can act on.

THE SWEEP FAILS ON A FINDING, the same as it does on a corpus finding. A check that reports and never fails is a warning that rots.

### The first version was wrong and the measurement caught it

SCANNING WHOLE FILES RETURNED 33 HITS, and nearly every one was an evidence form SAYING the marker sweep found nothing. Lines like "no_tbd: swept and ZERO" and "lint: no TBD/TBC/??? markers anywhere".

A CHECK THAT FLAGS THE RULE FOR STATING ITSELF IS NOISE, and noise is how a check gets switched off.

SO IT READS FRONTMATTER ONLY. A marker in a FIELD is unresolved. A marker in a paragraph is somebody talking about markers, and they are allowed to.

THE NARROWED SWEEP RETURNS `markers green` over 2686 nodes in 671 ms.

## follow_up

THE BODY IS NOT SWEPT and that is a deliberate gap rather than an oversight. A section left as "TBD" in prose would pass. Catching it needs a rule that can tell a placeholder from a discussion, and the frontmatter split is the cheap version of that rule.

THE COST IS PRINTED EVERY RUN alongside the corpus sweep's, so a check that gets slow says so rather than being discovered later.

## anything_else

