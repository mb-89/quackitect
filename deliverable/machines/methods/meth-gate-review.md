---
kind: method
statement: "The gate template: how every gate is reviewed and blessed - the standard rounds evaluate the gate's specific acceptance items; specifics first, standard around them."
---

## Situation
Every gate state links this note. The gate's own evidence form carries its milestone-specific acceptance items; this template carries the standard review that evaluates them. The rounds themselves are [[meth-review-rounds]].

THE EVIDENCE FORM IS THE REVIEW. There is no second review artifact. The form holds the acceptance items, the rounds and the verdict, and the bless on it is the gate's ruling.

## A RULING THAT CHANGES BEHAVIOUR OWES A CLAIM SWEEP, BEFORE ANY EDIT #work

A FINDING IS A SAMPLE OF THE DEFECT, NEVER ITS EXTENT. A review names the files it happened to read. The claim lives wherever anybody wrote it down.

SO SEARCH FOR THE SENTENCE THE RULING REPLACES, in its own words, and fix every hit in one pass. One search call, before the first edit.

SWEEP FOUR PLACES, because two of them are the ones nobody looks at.

- requirements and elements, which everybody checks
- DESIGN SPECS, which restate the element they realize
- TEST SPECS, which restate what they verify
- EVIDENCE FORMS of the open record, including the one the gate is reading

LEAVE CLOSED RECORDS ALONE. Their evidence is history and it was true when it was written.

MEASURED ON i63, 2026-08-26. Round one named two files that disagreed about a close, and both were fixed. Round two found the same claim standing in a design spec, a test spec and the gate's own evidence form. It was never a two-file problem, and every hit was findable by one search.

## SWEEP AFTER THE FIX TOO, NOT ONLY BEFORE IT #work

A FIX CAN CREATE THE DEFECT IT CLOSES, ONE LAYER DOWN. The fix is a change to what the system does, so it is exactly the kind of change the sweep exists for.

MEASURED ON i63: closing an archive-listing finding introduced a presence rule that a standing must forbids in as many words. The instrument that would have caught it was already written, and it was not re-run because the sweep was thought of as a thing you do before editing.

BEFORE, to find what the ruling contradicts. AFTER, to find what the fix now contradicts.

## READ THE WHOLE FORM BEFORE SUBMITTING AN AMENDED ONE #work

TOP TO BOTTOM, IN ORDER, NOT THE FIELDS YOU TOUCHED.

AN AMEND TAKES ONE FIELD AT A TIME, so the author never sees two fields side by side. A summary that still counts the old answer is invisible from inside the edit and obvious from outside it.

MEASURED ON i63, three rounds and three instances, every one an amended form contradicting itself. A situation line still crediting an element with work that had moved. One field withdrawing a disposition another field still asserted. One line ruling a row addressed while another still listed it unaddressed.

NONE WAS A WRONG FACT. Each was a summary nobody re-read after the thing it summarised changed. This check is cheaper than the review round that finds it.

## AFTER AN ALLOCATION CHANGE, ASK WHAT NOW CROSSES #work

MOVING A RESPONSIBILITY BETWEEN ELEMENTS CREATES A CROSSING. What was internal to one element becomes a contract between two, and the contract does not mint itself.

CHECK THE STRUCTURE NUMBERS AGAIN AFTERWARDS. An interface debt of zero measured before the move is a stale number, and it is the number the gate is told to trust.

MEASURED ON i63: moving the fold from one element to another created a handover with no interface, while the form still reported interface debt zero.

## NEVER RULE ON TEXT YOU WROTE IN THE SAME PASS #work

Contract rule 5 says it, and a gate is where it bites hardest. A verdict resting on a sentence you added while fixing the finding is not a verdict.

SEND THE REVIEWER BACK INSTEAD. It holds its own findings and its own context, so checking its own fixes costs one message rather than a fresh read.

MEASURED ON i63: this happened twice in one gate, and the reviewer caught it both times.

## The standard fields #work
- round_0_verify | built it right: one line per check that ran, each with its verdict - a bless is not proof | required
- round_1_validate | built the right thing: against the frame and vision, not just the plan; list what is missing, wrong, or out of scope; PRIOR ART IS A LIVE COMPARISON, see below | required
- round_2_red_team | the opposing case: one finding per line, each answered; the kill-criterion named and looked for | required
- raid_additions | anything this review adds to the RAID register, as node references - look especially for ASSUMPTIONS; none is legal ONLY when the verdict is a clean pass ([[meth-raid]]) | required
- state_of_the_art | what was scanned for this milestone's artifact, what adopted, what rejected - or a recorded skip with reason ([[meth-state-of-the-art]]) | required
- verdict | pass, pass with noted overrides, or reopen with named states and reasons | required

## PRIOR ART IS A LIVE SCAN, NEVER A CITATION #work



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

## Procedure #work
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

## THREE HANDS READ A GATE, AND NONE OF THEM GRADES ITS OWN WORK #work

Owner ruling 2026-08-23, after a gate was authored and blessed by one hand.

THE WALKER AUTHORS the fields, because it walked the phase they describe.

THE REVIEWER JUDGES IT COLD. It is spawned for the gate with no shared
context and reads only the artifacts. That is what makes it worth spawning:
it cannot be told that something was already discussed.

SO IT IS SPAWNED AT THE GATE, NEVER EARLIER. A hand
started back at the milestone's spawn state would sit through the whole phase.
The shared context it picked up there is the one thing a reviewer must not
have, so starting it early destroys the only reason to start it at all.

THE GATE THEREFORE REGISTERS ITS OWN HAND. `se_run` is legal in a gate state
for that reason, and outside a spawn state it is legal nowhere else.

A SPAWN STATE STARTS THE WALKER AND NOTHING ELSE. Each hand is started where
its work begins: the researcher where the research happens, the reviewer here.

THE REVIEWER RE-READS WHAT THE PHASE READ. It is a different reader, so a
reading proof the walker gave says nothing about what this hand holds. NOT
BUILT YET — the reading ledger is still per record, so it will report the
reading as already done. Until it is per hand, tell the reviewer what to read
rather than trusting the ledger to ask.

## THE REVIEWER READS, SCOPES, GRADES AND RANKS — THE WALKER DOES NONE OF IT #work

Owner ruling 2026-08-25, after a review was run on a summary the author wrote.

FOUR THINGS BELONG TO THE REVIEWER and each was taken from it at least once.

- IT READS THE ARTIFACTS ITSELF. Everything the phase produced, through the
  lane, from the record's own folder. A summary in a prompt is the author
  choosing what may be attacked.
- IT SCOPES ITS OWN ATTACK. Nobody tells it what to look at or what is already
  covered. A brief that narrows the search area has moved the finding rate to
  wherever the author was already looking.
- IT GRADES ITS OWN FINDINGS. Which are real and what each is worth is the
  reviewer's judgment, not something the walker decides afterwards.
- IT RANKS THEM, WORST FIRST, BEFORE ANY ANSWER EXISTS. That ranking is a
  record of what an independent reader thought mattered, taken before anybody
  argued back.

THEN THE WALKER ANSWERS, and only then.

AND THE REVIEWER RANKS A SECOND TIME. Handed the answers, it says which
findings still stand strongest. The two rankings together are the evidence: the
first says what an outside reader saw, the second says what survived the reply.

WHY THE SECOND RANKING IS NOT CEREMONY. An answer that satisfies its author is
the ordinary case. The only cheap way to know whether it satisfies anybody else
is to ask the reader who raised it.

WHAT THIS COSTS THE WALKER: nothing it should have been doing. Authoring the
fields, answering the findings, and folding what survives. The judging half was
never the walker's.

THE FAILURE THAT PRODUCED THE RULING. A reviewer was handed a written summary
rather than the files, told which half of the material to attack, and had its
findings graded and entered into the register by the hand that wrote the thing
under attack. It still found three real corrections. What nobody can know is
what a reader with the actual files and a free hand would have found instead.

## A REVIEWER IS NEVER WEAKER THAN THE GUIDE #work

JUDGMENT CANNOT BE DELEGATED DOWNWARD. The reviewer decides whether work
stands, so the hand that judges is at least as strong as the hand that wrote.

- IT TAKES THE GUIDE'S OWN MODEL, or a stronger one. Never a cheaper one.
- THIS BINDS EVERY JUDGING STEP, not only a gate: a review round, a red team,
  a verdict, a recommendation, a score.
- WALKING IS DIFFERENT, and that is why the rule is narrow. A walker
  transcribes, fills and moves the record, and the machine checks its work. A
  cheaper hand is legitimate there.

MEASURED THE DAY IT WAS WRITTEN. A strong guide handed a weaker hand the job
of judging a gate that guide had authored. The review was useful — it found
two real gaps — and the arrangement was still wrong.

WHY IT IS WORSE THAN IT LOOKS. A weak judge that MISSES something leaves no
trace of having missed it. The gate reads green, the record moves on, and
nothing downstream ever re-opens the question. A weak walker's mistake shows
up as a refusal; a weak judge's mistake shows up as nothing at all.

THE REVIEWER DOES NOT COUNT AGAINST THE RECORD'S CEILING, and neither does a
researcher (same ruling). Only walkers do. Register it as
`se_run {agent: "…", model: "…", role: "reviewer"}` so the count is right — a
reviewer that filled the walking slot stranded the next phase outright.

THE GUIDE LOOKS FOR DRIFT, and for nothing else. It held the record across the
phase, so it is the only hand that can see a gate answering a question that
was superseded, or quietly dropping a ruling made mid-phase. Neither is
visible in the artifacts, so neither is visible to the reviewer.

THE GUIDE'S PASS IS ONE QUESTION: does this contradict anything I watched
happen? It is not a second review. A guide that re-reviews pays the reviewer's
price without the reviewer's independence, and it agrees with itself.

IT COSTS ALMOST NOTHING, which is why both run. The reviewer's expense is
loading a fresh context in order to read cold. The guide is already carrying
the record, so its pass is nearly free. This is one expensive read and one
cheap one, not double tokens.

AND THE GUIDE MUST NOT BLESS. Where it answered the walker's questions during
the phase, it co-authored the work, and its bless would be the i15 failure
wearing a better name. The bless belongs to the reviewer or to the person, as
the dial decides.

## AN OVERRIDE IS A REGISTER ENTRY OR IT IS A SENTENCE #work

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

## A FAILED REVIEW PRODUCES A NOTE, EVERY TIME

Owner ruling 2026-08-26, after no milestone in one record passed its first
review and the fifth failure repeated the first.

THE RULE: a gate whose review finds anything WRITES THE LEARNING AS A NOTE
before it answers the findings. Not the finding — the LEARNING. What shape of
mistake this was, said generally enough that a different gate on a different
milestone could recognise it.

ONE NOTE PER GATE, not one per finding. Several findings usually share one
shape, and the shape is the thing worth carrying.

WHY IT IS A NOTE RATHER THAN A REGISTER ENTRY. The register carries what is
OPEN. A learning is closed by the time it is written: the mistake happened, it
was caught, and what remains is the pattern. The retro drains the notes, and
that is where a pattern becomes a rule.

WHAT IT COSTS: one call, at the moment the walker already holds the whole
context. What it buys: the next gate starts from what the last one learned
rather than from nothing.

### What a learning looks like, against what a finding looks like #work

A FINDING: "the upward-links row was scored against its title."

A LEARNING: "a row was judged by its name rather than its statement, and the
cheapest guard is that a cut reason quotes the statement it strikes."

THE TEST: could a gate on a different milestone act on it? A finding names
this artifact. A learning names the shape.

### The five that produced this rule, and they are one shape #work

MEASURED ACROSS ONE RECORD, 2026-08-26. Five reviews, five failures.

- A row judged by its NAME rather than its statement, twice, three iterations
  apart.
- A coverage walk run over a SUMMARY of the steps rather than the steps.
- A named defect logged as an OVERRIDE and walked past, as though naming were
  fixing.
- A gate signed, then its feeders re-signed, and no `suspect:` line went on.
- A commitment made in a FEEDER state and never kept at the state that owed it.

EVERY ONE IS A CHEAP PROXY PASSING FOR THE REAL THING, and every one reads as
diligence while it happens. That is why the hand doing it never catches it, and
why the note has to be written for a reader who was not there.

## A GATE READS THE OPEN ENTRIES WHOSE TRIGGER NAMES IT #work

FOUR OF THOSE FIVE FAILURES WERE ALREADY ON THE RECORD before they happened
again. Two open register entries name judging a row by its label as a known
failure, one of them quoting the exact requirement that was misread again.

ONE ENTRY'S TRIGGER READ "THE NEXT CUT-CRITERIA RUN". That run happened, the
trigger fired, and nobody read the entry.

SO THE CORPUS KNEW AND THE WALK DID NOT LOOK. An entry with a trigger is a
message addressed to a moment, and nothing delivers it.

THE RULE: before the rounds, search the register for entries whose `trigger`
names this state, this milestone or this act. Read them. Answer them in the
rounds or say why they do not apply.

NOT BUILT YET. Nothing serves these entries automatically, so the search is by
hand: `se_file_search` over `spec/trace/raid` for the state's name and for the
act it performs. When it is built, the pull will carry them and this paragraph
becomes a description of what already happens.
