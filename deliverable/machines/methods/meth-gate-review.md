---
kind: method
statement: "The gate template: how every gate is reviewed and blessed - the standard rounds evaluate the gate's specific acceptance items; specifics first, standard around them."
---

## Situation
Every gate state links this note. The gate's own evidence form carries its milestone-specific acceptance items; this template carries the standard review that evaluates them. The rounds themselves are [[meth-review-rounds]].

THE EVIDENCE FORM IS THE REVIEW. There is no second review artifact. The form holds the acceptance items, the rounds and the verdict, and the bless on it is the gate's ruling.

## The standard fields
- round_0_verify | built it right: one line per check that ran, each with its verdict - a bless is not proof | required
- round_1_validate | built the right thing: against the frame and vision, not just the plan; list what is missing, wrong, or out of scope; PRIOR ART IS A LIVE COMPARISON, see below | required
- round_2_red_team | the opposing case: one finding per line, each answered; the kill-criterion named and looked for | required
- raid_additions | anything this review adds to the RAID register, as node references - look especially for ASSUMPTIONS; none is legal ONLY when the verdict is a clean pass ([[meth-raid]]) | required
- state_of_the_art | what was scanned for this milestone's artifact, what adopted, what rejected - or a recorded skip with reason ([[meth-state-of-the-art]]) | required
- verdict | pass, pass with noted overrides, or reopen with named states and reasons | required

## PRIOR ART IS A LIVE SCAN, NEVER A CITATION



SEARCH. Actually search the web, at the gate, for what this milestone's
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
- A milestone gate is never self-certified below the dial - the bless is the person's until the dial hands it over.
- A reopen names states; the executor re-activates them and their downstream cone. Reopen edges are never drawn.
- The gate's bless is the adjudication act itself, recorded with the hand that made it. Where a milestone needs sign-off, the bless IS the sign-off.
- A bless does not outlive its evidence. When an input under the claim moves, the sign-off and the bless come off and a `suspect:` line goes on, naming what moved.
- A gate refuses while any FEEDER state is unsigned. The review covers the input cone, so the cone must stand before the gate can be judged.

## AN OVERRIDE IS A REGISTER ENTRY OR IT IS A SENTENCE

Owner ruling 2026-08-15: "If pass with overrides needs to declare action items
for that override, that's okay."

THE RULE: a verdict of `pass with overrides` REFUSES while raid_additions says
`none`. Every override names at least one standing register entry.

WHY IT NEEDED A RULE. An override is an open item by definition — the gate
passed while something stood unresolved, and the dissent says what. Left in
the verdict's prose it lives only inside a form nobody reopens.

THE MEASUREMENT. i12 passed three gates with SIX named dissents between them,
and wrote `raid_additions: - none` at every one. The form asked the question
and got "none" each time, because a dissent reads as verdict rationale rather
than as something to file. No later state ever asked what became of any of
them.

WHAT THE ENTRY BUYS THAT THE PROSE DOES NOT. It outlives the iteration, lands
on trunk at the close, carries an owner and a trigger, gets a dated look at
every retro sweep, and — where its kind is debt — must now declare what
repaying it consists of.

SO THE REGISTER IS THE CARRY-FORWARD MECHANISM, and no per-gate field is
wanted. A gate that raises something files it; every later sweep sees it. The
alternative considered and rejected was a derived field carrying the previous
gate's open items, which would have vanished at the close.

IT MAKES AN OVERRIDE MORE EXPENSIVE, deliberately. The cheap override is what
let six dissents evaporate. If it proves too heavy, the honest reading is that
gates were passing with more open items than anybody wanted to write down.

A CLEAN PASS STILL ANSWERS `none` FREELY. The rule binds the override verdict
alone.
