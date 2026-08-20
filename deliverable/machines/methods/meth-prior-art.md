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

0. READ THE PREDECESSOR FIRST. This project has earlier versions and they are
   one argument away on every read verb. `se_file_read`, `se_file_search` and
   `se_file_glob` all take `ref`. `main` reaches v1, `v2` reaches v2.

   IT IS THE ONLY CODEBASE THAT EVER SOLVED THESE PROBLEMS FOR THIS METHOD. A
   sweep of roughly a hundred external products once missed six working
   implementations sitting one ref away, one of them a lint this project had
   written down as impossible to build.

   MINE IT FOR FEATURES, NEVER FOR AUTHORITY. A decision recorded in an earlier
   version is evidence that version tried it, and nothing more.

1. Name the problem in the field's vocabulary. Finding the right TERM is half
   the search, and `se_web_search` earns its keep here.
2. Sweep three angles, all of them written: patterns that describe it,
   standards that govern it, failures written up about it.
3. For each find, ask what adopting it would look like HERE, and what our
   context breaks.
4. Cite everything. An idea with a source is checkable; one without is a
   rumour.

## STORING A BIG SWEEP

EXTENSIVE RESEARCH IS NEVER THROWN AWAY (owner instruction 2026-08-18).

- IT IS STORED LOCALLY, under `scratchpad/research/`, and never
  committed. The scratchpad is the workbench.
- ONE FILE PER SWEEP, named by its date and its question.
- EVERY FINDING CARRIES ITS PRIMARY SOURCE, as a URL or a git ref.
- WHAT COULD NOT BE ESTABLISHED IS RECORDED SEPARATELY. Those gaps say where a
  later search should start, and they are worth as much as the findings.

A LATER PASS MINES IT, and the retro is where that happens today. One sweep of
roughly a hundred products yielded ten reusable mechanisms on its second
reading, none of them the question it was commissioned for.

WHAT A MINED FINDING THEN BECOMES IS STILL OPEN. It stands as a work token in
the pool, because a finding with no reader is landfill.

## THE BACK-CHECK, AND IT IS NOT HERE

This card is the FRONT end: research before invention.

THERE IS A BACK END TOO (owner ruling 2026-08-18). A chosen design that
re-derives existing prior art owes a study of the original. What does the
original do better than ours? What cost did it pay that we have not paid yet?

IT RUNS AT record-adrs IN M5, not here. By then a winner exists, so the
question has something concrete to compare against.

## Output

One [[option]] node per idea, each naming its cluster and its source. Plus
the dry wells: a cluster nobody has published about is a finding, not a gap
in the search.

A cluster with no literature behind it means either the problem is genuinely
new, or it is being described in the wrong words. Both are worth knowing.
