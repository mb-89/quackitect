---
kind: method
statement: "The gate template: how every gate is reviewed and blessed - the standard rounds evaluate the gate's specific acceptance items; specifics first, standard around them."
---

## Situation
Every gate state links this note. The gate's own evidence form carries its milestone-specific acceptance items; this template carries the standard review that evaluates them. The rounds themselves are [[meth-review-rounds]].

THE EVIDENCE FORM IS THE REVIEW (owner ruling 2026-08-06). There is no second review artifact. The form holds the acceptance items, the rounds and the verdict, and the bless on it is the gate's ruling.

The engine demanded a separate milestone-review file until that ruling. None was ever written, for any gate, in any iteration. It asked for the same sections under a second path, which is the DRY law broken inside the gate itself.

## The standard fields
- round_0_verify | built it right: one line per check that ran, each with its verdict - a bless is not proof | required
- round_1_validate | built the right thing: against the frame and vision, not just the plan; list what is missing, wrong, or out of scope; PRIOR ART IS A LIVE COMPARISON, see below | required
- round_2_red_team | the opposing case: one finding per line, each answered; the kill-criterion named and looked for | required
- raid_additions | anything this review adds to the RAID register, as node references - look especially for ASSUMPTIONS; none is legal ([[meth-raid]]) | required
- state_of_the_art | what was scanned for this milestone's artifact, what adopted, what rejected - or a recorded skip with reason ([[meth-state-of-the-art]]) | required
- verdict | pass, pass with noted overrides, or reopen with named states and reasons | required

## PRIOR ART IS A LIVE SCAN, NEVER A CITATION

Owner ruling, 2026-08-06, after a gate cited a book and called it prior art.

SEARCH. Actually search, on the web, at the gate, for what this milestone's
artifact is being compared against. `se_web_search` and `se_web_fetch` are the
lane for it. Reaching for a name already in your head is not a scan - it
returns what was known before the work started, which is exactly the
comparison that cannot surprise you.

NAME SYSTEMS PEOPLE ACTUALLY USE. Not papers, not methods, not the book a
shape was borrowed from. Products with users. Citing Cockburn proves a use-case
shape was borrowed correctly; it says nothing about whether this user picture
survives against the tools people reach for instead.

SAY WHAT THEY DO BETTER, FIRST. Then what ours sheds, and why shedding it is
the right trade. A comparison that finds our side better at everything was not
a comparison. The sycophancy guard applies here more than anywhere: this is the
one round whose job is to find out we are wrong.

AN UNMADE COMPARISON IS A FINDING. Write "not scanned" with the reason and let
the reviewer weigh it. A blank, or a citation standing in for a scan, reads as
done and is worth less than an honest gap.

WHAT SURVIVES THE SCAN GOES IN THE REFERENCE CORPUS, so the next gate at this
milestone starts from what this one found rather than searching from nothing.

## Procedure
- Work the specifics first: every acceptance item filled with real evidence.
- SCAN BEFORE THE ROUNDS, not during. Round 1 records what the scan found; it
  is not the place to do it.
- Then the rounds, in increasing scrutiny: verify, validate, red-team.
- Risk-weighted: deepest scrutiny on the most central, most-reversed, human-judged items. Scale to size - do not red-team a trivial gate.
- Killers (`killer` fields) are never self-certified by the agent that did the work.
- A reopen names states; the executor re-activates them and their downstream cone. Reopen edges are never drawn.
- The gate's bless is the adjudication act itself, recorded with the hand that made it. Where a milestone needs sign-off, the bless IS the sign-off.
- A bless does not outlive its evidence. When an input under the claim moves, the sign-off and the bless come off and a `suspect:` line goes on, naming what moved.
- A gate refuses while any FEEDER state is unsigned. The review covers the input cone, so the cone must stand before the gate can be judged.
