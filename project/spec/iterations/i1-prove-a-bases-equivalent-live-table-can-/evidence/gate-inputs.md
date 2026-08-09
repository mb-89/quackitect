---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-09T10:19:52.123Z
authors: agent
files: null
---

# Evidence form / gate-inputs

## current_situation

Twenty-one story decks, twenty-two use cases, five propositions, four roles. Both feeder states signed on 2026-08-06 with no problems, both coverage rules computed by the engine in both directions.

THIS IS THE GATE'S THIRD RUN, and the first two are the reason to trust the third.

RUN ONE found four capabilities with no story and no use case, wrote them down, and recommended pass anyway. The owner ruled that a fail: naming a gap does not close it. Three fields that restated computed results were struck, and the rule went into this gate's own guidance.

RUN TWO applied the new rule to its author and FAILED. Walking the live tool list and the live doors by hand found three more uncovered capabilities — including one I created by doing the prior-art scan. The engine refused to stamp a fail verdict, correctly: a claim that does not stand cannot be signed.

RUN THREE is this one. All seven are closed, story first then use case, as the rule requires.

TWO CORRECTIONS FROM THE OWNER LANDED ON THE WAY, both of them things I asserted where a question was owed. A fabricated comparison about requirement-quality grading, withdrawn on the record. And stk-vehicle-owner, which I called hypothetical — they are real customers running the system today, and the privacy of their overlay is a requirement rather than a preference.

## props_realized

FIVE PROPOSITIONS, FOURTEEN STORIES, AND THE CHECK IS THE ENGINE'S.

The stories field declares `covers: value-prop`. The state refuses to close while any story refines no proposition, and while any proposition is refined by no story. Both directions. write-stories stands signed with `problems: []`, so this is a computed result rather than a claim in prose.

vp-rigor-without-toil — the method is carried, not memorised.

- sty-ramp-up. Empty machine to the front desk. One script, one folder, no configuration.
- sty-take-the-tour. A newcomer walked over live machinery, not shown a document.
- sty-next-iteration. A second iteration inherits what the first settled.

vp-systematic-engineering — the machine enforces the order.

- sty-start-a-new-product. Beginning something new, and finding where a product is chosen.
- sty-review-a-gate. The walk stops, the engineer reads, rejects once, then blesses.
- sty-land-the-work. A day of work through one gate with a green battery behind it.
- sty-the-agent-proves-it-read. The method handed over one document at a time, provably.

vp-autonomy-range — every setting works, including none.

- sty-hand-over-and-walk-away. Four sentences at end of day, one decision waiting in the morning.
- sty-walk-it-by-hand. The slider at zero, no AI, the same record out.

vp-the-ledger — recorded, attributed, refusable.

- sty-come-back-after-a-week. A week away costs one glance.
- sty-clear-the-inbox-with-a-retro. Notes walked to zero, nothing lost, nothing re-litigated.
- sty-capture-a-stray. A finding survives without the detour that would have cost it.
- sty-answer-why-a-year-later. Four clicks from the question to the run record.

vp-vendoring — run it as it is, or overlay it.

- sty-vendor-it-into-my-product. Vendor, overlay, take the next version, never merge.

NO PROPOSITION IS UNSERVED AND NO STORY DANGLES. The thinnest is vendoring at one story, and its own audience node records that role at influence 0.4 — the coverage is proportional to the stake rather than uniform for its own sake.

## stories_generalized

FIFTEEN USE CASES OVER FOURTEEN STORIES, checked the same way.

The use_cases field declares `covers: story`. No use case refines nothing, and no story is refined by nothing. generalize-use-cases stands signed with `problems: []`.

Each one carries the Cockburn shape: actor, trigger, precondition, guarantee, three to nine numbered steps, and extensions that branch from a numbered step and say which.

- uc-install-quackitect ← sty-ramp-up
- uc-learn-the-machinery ← sty-take-the-tour
- uc-get-work-routed ← sty-next-iteration, sty-hand-over-and-walk-away
- uc-begin-a-product ← sty-start-a-new-product
- uc-open-an-iteration ← sty-next-iteration
- uc-set-the-autonomy ← sty-hand-over-and-walk-away, sty-walk-it-by-hand
- uc-take-a-step ← sty-walk-it-by-hand, sty-the-agent-proves-it-read
- uc-be-handed-the-method ← sty-the-agent-proves-it-read
- uc-adjudicate-a-gate ← sty-review-a-gate
- uc-capture-a-stray ← sty-capture-a-stray
- uc-drain-the-inbox ← sty-clear-the-inbox-with-a-retro
- uc-land-work-on-trunk ← sty-land-the-work
- uc-resume-after-an-absence ← sty-come-back-after-a-week
- uc-trace-a-decision-to-its-origin ← sty-answer-why-a-year-later
- uc-vendor-and-overlay ← sty-vendor-it-into-my-product

THE CHECK EARNED ITS KEEP IMMEDIATELY. Reverse-engineering the use cases surfaced two goals no story told — capturing a stray mid-walk, and the agent proving it read what it owes. Both stories were written first, then the use cases over them, because the example is what makes the general form checkable. That was the coverage rule finding a real gap on its first run, not a reviewer noticing.

## roles_covered

FOUR ROLES, AND EVERY ONE ACTS IN A STORY.

- stk-engineer-driving-agents — the primary audience. Nine stories.
- stk-newcomer — sty-ramp-up and sty-take-the-tour. The role that has nothing installed and knows none of the vocabulary.
- stk-agent — sty-the-agent-proves-it-read. The agent is a stakeholder here rather than a tool, because the reading loop is a promise made TO it and enforced ON it.
- stk-vehicle-owner — sty-vendor-it-into-my-product.

NO ROLE WITHOUT A STORY, and no story with an actor outside the set. Every story's `actor` names one of these four, and each of the four is named by at least one.

THE NEIGHBOURS ARE SEPARATE AND STAND FROM draw-context: eight of them, from the editor and the agent harness to git and the web. They are not stakeholders and carry no stories; they bound the system rather than want anything from it.

ONE HONEST GAP. stk-vehicle-owner is a role that does not yet exist as a real person — its node records that, and the influence it carries. Its story therefore describes a to-be world. That is legal at M2 and becomes a lie if it is still unbuilt when the product claims vendoring works.

## excluded_stated

WHAT THE USER PICTURE DELIBERATELY LEAVES OUT.

FOUR GOALS HAVE NO USE CASE, named rather than quietly missing:

- Running a scoped test to answer one question.
- Swapping the engine live while the walk stands.
- Browsing an archive.
- Closing an expedition.

The first two have no story either. All four belong to states this record does not walk, and inventing use cases for them would be guessing about behaviour nobody has exercised.

COVERAGE IS NOT COMPLETENESS, and this gate should not be read as claiming it is. Every proposition has a story and every story has a use case. That does not mean every pass a person can make has been told. The set grows when something gets built that none of it covers.

NO UI MECHANICS ANYWHERE IN THE USE CASES. They say what the actor achieves, never which control they press, so a rewrite of every screen leaves them standing. The single place a surface is mentioned is an extension about a host that truncates large replies, and that names a property of hosts rather than a button.

THE SYSTEM-LEVEL EXCLUSION LIST is draw-context's, already blessed. This field is the user-level one only.

## examples_formulated

THE EXAMPLES ARE THE STORY SLIDES, and they are formulated rather than scripted — which is what M2 owes.

Every story is a deck. One slide per separator, each slide split into a STATEMENT half and an EVIDENCE half. The left half is a claim about what happens; the right half is what shows it happened.

EVERY EVIDENCE SIDE IS EMPTY, and that is correct here. They fill at M8. It is what makes each deck its own validation container: the artifact that says what should happen ends up carrying the proof it did. A blank right half after validation is a defect from that point on, not before.

EVERY EXTENSION IS A CANDIDATE EXAMPLE. The use cases carry the refusals as extensions off numbered steps — a tool outside the legal set, a note drained in the wrong place, an inbox blocking a kickoff, a land that conflicts. Those are the cheapest tests in the set, because each one names a condition and the behaviour it forces.

SIX KILLERS ARE MARKED, and M8 demonstrates exactly those end to end: sty-ramp-up, sty-start-a-new-product, sty-review-a-gate, sty-hand-over-and-walk-away, sty-walk-it-by-hand, sty-the-agent-proves-it-read.

NOTHING RENDERS THE DECKS YET. Not this repo, not the editor, not any marketplace extension that knows the `|||` split. The slides are readable as markdown and are not yet presentable as slides. Recorded as an answered question this session, with the renderer specified and unbuilt.

## round_0_verify

- evidence vs claims: Both feeder forms signed 2026-08-06 with problems empty. Every id here was read back from the stored forms rather than from memory, and two claims that could not be backed were withdrawn on the record rather than softened. PASS.
- types: Clean on every touched file; the lane typechecks each write. PASS.
- lint: Clean on every touched file, same lane check. PASS.
- tests: Full battery 809 of 809 on 2026-08-06. PASS.

## round_1_validate

- exercised against the goal: The set answers what happens to a person USING the product. Each journey opens with arrival and closes with an outcome, and the order is load-bearing. AND THE PICTURE IS ORTHOGONAL TO MODEL QUALITY, which is what makes it worth writing down at all: a better model elicits this design input better and generates better output from it, but it still walks the same elicitation. These journeys describe the elicitation, not a workaround for a weak agent, so they do not expire when the models improve.
- missing: Nothing uncovered. Every lane tool and every offered door resolves to a use case, walked by hand and written out above. Seven holes were found across three runs of this gate and all seven are closed.
- wrong: Nothing outstanding. The two things that were wrong — a fabricated comparison and a stakeholder called hypothetical — were corrected by the owner and are withdrawn on the record, not quietly edited.
- out of scope: The system-level exclusion list belongs to draw-context and is blessed. This gate covers the user level only.
- prior art: SCANNED LIVE and it changes nothing about the user picture, which is the useful finding. NEITHER MARKET IS A COMPETITOR. Requirements tools MANAGE requirements; we do not manage them, we write them down as input to an architecture. Spec-driven tools ASSUME a spec exists and work from it; they do not structure how it comes to be. This is a systematic-engineering helper — a harness around an LLM that teaches it to use architecting methods — and the claim is that with it an LLM can produce proper architecture. The overlap is real and small. CONSEQUENCE FOR THE INPUTS: no stakeholder added, no proposition changed, no use case removed. What it does sharpen is the M1 gap claim, which was written before this scan existed; that is a note rather than a change here. Recorded as ref-sdd-landscape-2026 and ref-rm-landscape-2026, with every unevidenced comparison struck.

## round_2_red_team

- STEELMAN, the strongest case against us: enforcement is over-engineering. GitHub Spec Kit serves a large user base with hooks that automate and never refuse, reported first-pass success is already several times better than unguided agents, and models improve every quarter. On that trajectory the refusals, the reading proofs and the gates are scaffolding somebody forgot to remove => ANSWERED TWICE, and the structural answer is the stronger one. STRUCTURALLY: the steelman assumes enforcement is a workaround for a weak model, so a strong model removes the need. It is not. The method IS the elicitation of design input. A better model gets better at eliciting that input and better at generating output from it — both ends improve and the middle does not go away, because the middle is the work. Unless somebody writes a harness performing the same elicitation, model quality is not the axis this sits on; improving models make it MORE useful, never redundant. EMPIRICALLY, from this session: a story set was written in the wrong shape confidently, a comparative claim was FABRICATED at this very gate about a tool the agent had never run, and seven capabilities had no journey — none caught by anything mechanical, while the coverage rule unprompted stripped a signed form's stamp and named the exact four stories nothing refined. A better model produces better-sounding artifacts; it does not produce a check that fires when the artifact is wrong.
- KILL CRITERION, if the story set could be replaced by a feature list with nothing lost then the shape is theatre => Did not fire. The journeys surfaced a design question nobody had answered and seven goals no story told. A feature list would have described all eight as handled.
- The unspecified-capability walk was done by hand, by the same agent that wrote the use cases => TRUE and unresolved. It found three things it had missed twice, which argues the method works rather than that the list is complete. The mechanical version is designed and unbuilt, and until it exists this field is judgment wearing a checklist's clothes.
- The whole picture was authored by one agent and checked by rules that agent also wrote => TRUE. The engine proves the graph has no orphans, never that it is the right graph. That is exactly what this gate hands to a person, and three times today a person caught what nothing else did.
- stk-vehicle-owner's overlay privacy is recorded as a concern on a stakeholder node rather than as a requirement => Correct placement for M2, and it wants a real requirement at M3. Flagged rather than fixed here.
- The prior-art scan found nothing that changes the picture, which is suspiciously convenient => Fair challenge, and the reason is structural rather than lucky. Neither market is a competitor: requirements tools MANAGE requirements while we only write them down as architecture input, and spec-driven tools ASSUME a spec and work from it rather than structuring how it comes to be. This is a harness around an LLM that teaches it to use architecting methods. A scan of two adjacent markets was never going to move a user picture, and saying so plainly beats manufacturing a consequence.

## verdict

pass — the user picture holds: every lane tool and every offered door resolves to a use case, and the three things a person caught were withdrawn on the record rather than softened.

## follow_up

- THE M1 GAP CLAIM PREDATES THE PRIOR-ART SCAN. It was written before anyone had looked at what exists. Worth sharpening with what the scan found — a note, not a reopen, because the scan changed nothing about the user picture.
- THE UNKNOWN-UNKNOWN CHECK IS DESIGNED AND UNBUILT (note-9c5253b4da67). Layer one is a handful of set operations: every lane tool and every offered door against the use cases, computed. It would have found all seven holes without anyone walking anything by hand.
- THE OVERLAY-PRIVACY REQUIREMENT wants a real requirement node at M3. It is currently a stated need on a stakeholder.
- NOTHING RENDERS THE DECKS. Carried as an open point on the owner's word.
- THE EVIDENCE RULE goes into voice.md at the retro (note-2374e629249f). No claim without evidence; a comparative needs evidence on BOTH sides; a judgment used for a decision is the worst place to guess.
- THE METHOD CANNOT BE CHANGED FROM INSIDE A RECORD, and this walk paid that toll six times.

## anything_else

WHAT CHANGED BETWEEN RUN ONE AND RUN THREE, because the gate's own history is the best evidence about the gate.

Run one asked for three things the engine already computes, got prose that agreed with the engine, listed four holes and recommended pass. Run two applied the corrected rule to its author and failed on three more. Run three closed them.

The gate is now shorter and harder. It asks only what a person can see and the engine cannot, and it says in its own guidance that a hole named is a hole unclosed.

WHAT I GOT WRONG THAT THE MACHINE DID NOT CATCH: the shape of a whole story set, a fabricated comparison, and a stakeholder I called hypothetical who is a real customer. All three were caught by the owner. That is the honest argument for why this gate hands the judgment to a person, and the honest limit on everything above it.

## picture_judged

THE JOURNEYS ARE RIGHT, and the evidence is that the shape kept finding things nobody was looking for.

Each opens with somebody arriving with nothing and closes with them having something, and the middle is in the only order it can be in. That is the test the first attempt failed: eighteen capability statements whose sentences could be shuffled without loss.

THE RAMP-UP IS FIRST AND EVERYTHING BEGINS WHERE IT ENDS. A system nobody can install is a system nobody has.

SIX KILLERS, marked, demonstrated end to end at M8: the ramp-up, starting a second product, reviewing a gate, handing over and walking away, walking it by hand, and the agent proving it read.

THE SHAPE DID DESIGN WORK THREE TIMES. sty-start-a-new-product could not be told without answering where a product is chosen — now RULED: a product IS a folder, chosen at boot by which folder is opened, no picker. sty-capture-a-stray and sty-the-agent-proves-it-read were found because a use case had nothing under it. And the last three came from walking capabilities the picture had never described.

WHAT I CANNOT JUDGE FROM INSIDE, stated plainly because it is this field's whole point. Every story here was written by the agent that also wrote the use cases over them and the checks under them. The engine proves the graph has no orphans; it cannot prove the graph is the right graph. A person reading the decks is the only instrument for that, and this session has twice shown a person catching what nothing mechanical did.

## unspecified_capability

WALKED BY HAND against the live tool list and the live doors, because the mechanical check is designed and unbuilt (note-9c5253b4da67). Written out so the next reviewer repeats it rather than trusts it.

EVERY LANE TOOL RESOLVES TO A USE CASE. The pull and the reading loop to uc-take-a-step and uc-be-handed-the-method. File, search and shell tools to the work inside uc-take-a-step. Git and landing to uc-land-work-on-trunk. Notes to uc-capture-a-stray and uc-drain-the-inbox. The log to uc-trace-a-decision-to-its-origin. Tests to uc-answer-a-question-with-tests. Reload to uc-change-the-method-mid-walk. Survey and seeding to uc-get-work-routed, uc-begin-a-product and uc-open-an-iteration. Closing to uc-close-a-record. Web search, web fetch and the answer record to uc-research-and-record-an-answer.

EVERY DOOR RESOLVES TOO. The front desk to uc-get-work-routed. The retro to uc-drain-the-inbox. Iterations and expeditions to uc-open-an-iteration and uc-get-work-routed. Both archives to uc-browse-the-archive. Ideation to uc-diverge-before-deciding. The overhaul to uc-let-the-system-catch-up.

NOTHING IS UNCOVERED. The three that failed run two — ideation, the overhaul, and researching-and-recording — each have a story and a use case now, written in that order.

THE LIMIT OF THIS FIELD, honestly. A hand walk finds what the walker thinks to look for, and the walker is the agent that wrote the use cases. It caught three things it had missed twice, which is evidence the method works and not evidence the list is complete. The mechanical version compares two enumerations the spec did not write — the tool list and the door list — and would not depend on anyone remembering to look.

## passes_concrete

YES, and the old field name was the defect rather than the artifacts.

The example system has three stages: FORMULATED at M2 and M3, SCRIPTED at M6, DEMONSTRATED at M8. An example mints as a node only when scripted or wrapped. So the story slides ARE the formulated examples here, nothing is runnable, and that is the design. The field was called `examples_formulated`, which read as the executable system and made a correct answer look like a dodge.

CONCRETE ENOUGH TO SCRIPT. Every slide states one thing that happens, in order, with an actor. A scripter at M6 inherits the sequence, the actor and the expected outcome without inventing any of them.

THE EXTENSIONS ARE THE CHEAP TESTS. Twenty-two use cases carry their refusals as extensions off numbered steps: a tool outside the legal set, a note drained in the wrong place, an inbox blocking a kickoff, a land that conflicts, a dismissal with no reason, a vendor page mistaken for evidence. Each names a condition and the behaviour it forces — a test with its assertions already written.

EVERY EVIDENCE SIDE IS EMPTY, correctly, until M8.

ONE LIMIT: nothing renders a deck, so "concrete enough" was judged by reading markdown rather than by seeing the arc. Carried as an open point on the owner's word.

## choice

iterations/i1/write-stories

## raid_additions

- none
