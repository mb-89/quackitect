---
kind: method
statement: "Prior art: what somebody WROTE DOWN about this problem — the mechanism and the reason behind it, so reuse beats rediscovery."
---

# Prior art — somebody explained this already

**What.** Deliberate research before invention: search the literature, the
standards, and the project's own corpus for accounts of how this problem has
been solved and why. Reuse beats rediscovery.

**When.** ALWAYS at least briefly, and fully when the problem feels general.
Caching, undo, scheduling and review flows all have decades of art behind
them.

## THE EVIDENCE IS A DESCRIPTION, AND THAT IS THE WHOLE DISTINCTION

This card and [[meth-benchmarking]] are told apart by WHAT YOU ARE HOLDING,
never by what the thing is.

- HERE you hold a written account. A pattern, a reference architecture, a
  standard, a paper, a post-mortem. It gives you the MECHANISM AND THE
  REASON, generalised, usually with the failure modes named. You cannot watch
  it run.
- THERE you hold an observation of a running artifact. It gives you the WHAT,
  concretely, plus evidence that it survived real users. It rarely gives you
  the why.

THE OVERLAP IS REAL AND IT IS FINE. A shipped product with a paper about it
belongs to both, and both finders may mint an option for it. The chart
dedupes, and `found_by` records which lens turned it up.

THE TIE-BREAK, when you are unsure which card you are on: did you READ a
description, or did you LOOK at the artifact? Reading is here. Looking is
benchmarking.

THIS CARD USED TO SAY "somebody shipped this already" AND TO SWEEP "products
that do it" (owner ruling 2026-08-08). That was benchmarking's territory
written into prior art's card, and it left the two finders with no rule that
could separate them.

## THE TWO FAILURE MODES ARE OPPOSITE

- PRIOR ART FAILS BY BEING ASPIRATIONAL. A paper describes a design nobody
  ever ran, and its costs were never paid by anybody.
- BENCHMARKING FAILS BY BEING OPAQUE. You see behaviour and guess the
  mechanism, and a vendor's page is a claim rather than a quality judgment.

That is why both run. Each one's blind spot is the other's evidence.

## Steps

1. Name the problem in the field's vocabulary. Finding the right TERM is half
   the search, and `se_web_search` earns its keep here.
2. Sweep three angles, all of them written: patterns that describe it,
   standards that govern it, failures written up about it.
3. For each find, ask what adopting it would look like HERE, and what our
   context breaks.
4. Cite everything. An idea with a source is checkable; one without is a
   rumour.

## Output

One [[option]] node per idea, each naming its cluster and its source. Plus
the dry wells: a cluster nobody has published about is a finding, not a gap
in the search.

A cluster with no literature behind it means either the problem is genuinely
new, or it is being described in the wrong words. Both are worth knowing.
