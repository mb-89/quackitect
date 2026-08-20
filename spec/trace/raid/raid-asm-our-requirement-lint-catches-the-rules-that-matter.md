---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-asm-our-requirement-lint-catches-the-rules-that-matter
type: "[[raid]]"
kind: assumption
statement: The requirement lint's rule set covers the INCOSE writing rules that actually matter here, so a row passing our submit is a row worth having.
owner: the driving agent
trigger: the next requirement that reads badly and passed, and any change to the lint's rule list
probe: "List the lint's implemented rules from machines/items/requirement.md against the INCOSE guide rules the method card cites — R1, R2, R7 to R9, R18 to R23 and R33. Name every cited rule with no check behind it. UNPROBED 2026-08-17: the comparison needs the guide itself, which is not in the corpus, and buying or fetching it is the owner's call rather than this iteration's."
status: open
probed: 2026-08-17
impact: A row can pass the submit and still be poor. The lint is the only mechanical gate on requirement quality, so what it does not check is checked by nobody, and the method card's citation of the INCOSE guide reads as coverage the code may not have.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - meth-requirement-authoring
  - req-a-refused-act-says-why-and-what-next
---

## Where it came from

THE PRIOR-ART SCAN AT gate-requirements, run live on 2026-08-17. The named
tools people actually use — Jama Connect Advisor, Innoslate's AI Quality
Checker, QRA's QVscribe — all advertise checking against the INCOSE guide and
EARS, and QVscribe's published check list names immeasurable quantification,
passive voice, superfluous infinitives and optional escape clauses.

OURS CHECKS A BANNED-WORD LIST AND A BANNED-PHRASE LIST. It caught `would`
three times in statements written carefully at this iteration's
write-requirements, so it works. What it does NOT check has never been
enumerated against the guide the method card cites.

## Probe

LIST THE TWO SETS SIDE BY SIDE AND SUBTRACT.

- Ours: read the check rules in machines/items/requirement.md — the banned
  words, the banned phrases, the kind enumeration, the damage-scale
  enumeration, and the section requirements.
- Theirs: the INCOSE guide rules the method card cites by number, R1, R2, R7
  to R9, R18 to R23 and R33.

NAME EVERY CITED RULE WITH NO CHECK BEHIND IT. That list is the answer, and
its length is the verdict: a short list means the citation is honest, a long
one means the method card claims coverage the code does not have.

UNPROBED 2026-08-17, WITH ITS REASON. The comparison needs the guide itself,
which is not in the corpus. Fetching or buying it is the owner's call rather
than this iteration's, and guessing at the rule numbers from memory would be
the fabrication this product keeps ruling against.

## Why it is an assumption rather than a finding

NOBODY HAS COMPARED THE TWO LISTS. Believing the coverage is adequate is not
checking it, which is this method's own definition. The method card cites
INCOSE rules R1, R2, R7 to R9, R18 to R23 and R33 as sources; the lint
implements a word list, a phrase list, a kind enumeration, a damage-scale
enumeration and a section requirement.

THOSE ARE NOT THE SAME SET, and the gap is unmeasured rather than known to be
small.

## Why it is not urgent

THE TRADE IS DELIBERATE AND IT IS THE RIGHT ONE. Ours REFUSES where theirs
SCORES. A score is advisory and gets skimmed; a refusal is binding and cost me
one round trip to satisfy at this iteration's own write-requirements.

SO A NARROWER NET WITH TEETH BEATS A WIDER NET WITHOUT THEM, and that argument
does not need this row settled. What the row protects against is the citation
reading as coverage it does not have.
