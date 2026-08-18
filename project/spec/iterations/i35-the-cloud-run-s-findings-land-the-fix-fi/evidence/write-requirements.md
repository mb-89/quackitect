---
form: write-requirements
by: agent
signed_off: 2026-08-17T11:44:08.069Z
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

Five requirements are written against uc-arrive-on-an-unattended-machine. Every one carries its verify_method, its breaks_if_removed and the sources it came from.

Four are constraints or functional requirements on the arrival itself. The fifth pins the rule that a declared runtime floor is read and never edited, which is the one this iteration was most tempted to break.

## register

- req-one-command-takes-a-fresh-clone-to-a-live-lane
- req-the-arrival-never-costs-the-session
- req-arriving-twice-changes-nothing
- req-every-ref-the-corpus-cites-resolves-on-arrival
- req-the-declared-runtime-floor-is-read-never-edited

## set_criteria

- complete: The set covers every step of the use case's main scenario and every extension that can lose work. Steps 1 to 8 are covered by req-one-command; extensions 2a and 2b by req-every-ref; 3a by req-the-declared-runtime-floor; 1a and 1b by req-arriving-twice; and every failure branch by req-the-arrival-never-costs-the-session. WHAT IS DELIBERATELY NOT COVERED: extension 8a, the pull answering wait on the dial. That is not the arrival's behaviour, it is the walk's, and it belongs to vp-autonomy-range.
- consistent: No two requirements can both be satisfied only by contradicting each other. The one pair worth checking is req-the-arrival-never-costs-the-session against req-the-declared-runtime-floor-is-read-never-edited, because one says never end the session and the other says stop. They are consistent because they bind different subjects: the RUNTIME CHECK stops the arrival, and the HOOK reports that and leaves the session running. The arrival stopping is not the session ending.
- affordable: The whole set is satisfied by one script and one hook, both written and running. The cost is measured rather than estimated: se-arrive.ts and se-hook-arrive.ts, against roughly an hour of hand-work per cloud run that they replace.
- bounded: Every requirement names its trigger — a session starting, a step failing, an arrival repeating, the arrival completing, a runtime below the floor. None is phrased as a standing obligation over unspecified conditions, so each one has a moment where it is either met or not.
- comprehensible: Each states one obligation in one sentence, in EARS shape, with the detail below the frontmatter rather than inside the statement. A reader who knows nothing of this project can tell what would violate each one.
- no_tbd: No requirement carries a placeholder, a to-be-decided or an unnamed quantity. The one number that is genuinely unknown — the after-measurement of the arrival on a fresh box — lives in the value prop's success criteria as a target with a stated gap, not in a requirement.
- behaviour_modelled: The behaviour is modelled in uc-arrive-on-an-unattended-machine, whose main scenario is the ordered eight steps and whose extensions are the branches. The requirements refine that use case rather than restating it, and each names the step or extension it binds to in its source_refs.

## follow_up

- req-the-arrival-never-costs-the-session has verify_method: test and no test yet. Nothing asserts that a broken arrival leaves the agent told rather than silently uncaged.
- req-arriving-twice-changes-nothing is verified by demonstration only, twice by hand this run. It deserves a test once the shared module lands.
- req-every-ref-the-corpus-cites-resolves-on-arrival was measured both ways on this box and has no automated check either.

## anything_else

THREE OF THE FIVE ARE VERIFIED BY HAND TODAY, and the set_criteria answer above would be dishonest if it did not say so here.

What exists is the behaviour and the measurement. What does not exist is a check that fails when the behaviour stops. That gap is named in follow_up rather than hidden, and it is the natural work of the test-authoring state below.

ONE REQUIREMENT IS AIMED AT THIS ITERATION'S OWN TEMPTATION. req-the-declared-runtime-floor-is-read-never-edited exists because i35 measured the pin to be over-tight and had every reason to just lower it. Writing the rule down was the alternative to breaking it.
