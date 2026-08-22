---
form: frame-delta
by: agent
signed_off: 2026-08-21T08:49:30.286Z
authors: agent
files:
---

# Evidence form / frame-delta

## current_situation

The baseline stands, with every pain carrying a file and a line.

This state frames what the gap is, why it can close now, and which standing value proposition the work serves.

No web tool is legal here. The state-of-the-art scan was run at the kickoff gate and is inherited rather than repeated, with its two findings carried forward and one of them marked as a source not read to the primary.

## gap_claim

THE GAP IN ONE CLAIM: every alternative reports background work to a PERSON WATCHING, and none of them answers the caller that started it.

WHAT THE ALTERNATIVES DO BETTER, said first.

Jenkins carries exactly the shape this iteration wants. `hudson.model.Run` in Jenkins core declares an estimated duration, and a running build is presented against it. Its estimate is derived from prior builds of the same job and has run at scale for years. Ours has neither the history nor the scale.

PRIMARY SEEN for the declaration, not for the derivation. The kickoff gate recorded that the derivation rule behind it was not read, and that limit is carried rather than quietly dropped.

GitHub Actions does NOT carry it. It publishes job execution time after the fact rather than a time remaining for a running job, per its own monitoring documentation. The first comparison reached for did not survive checking, and it is recorded here because a dropped comparison is evidence too.

WHAT EVERY ONE OF THEM SHEDS: the caller. A dashboard is read by a person deciding whether to go and get coffee. Nothing in that shape answers a program that started the work and has to decide whether to wait, to keep working, or to ask again.

WHY THAT MATTERS HERE AND NOT THERE. Their caller is a human with other windows open. Ours is an agent whose only verb is the one that just froze, on a machine where nobody is watching to notice.

THE SECOND HALF OF THE GAP IS NOT ABOUT REPORTING AT ALL. No build server has our problem, because none of them runs the long job INSIDE the step-completion path. The freeze is ours alone: a tick attempt awaits the exit script inline (`deliverable/engine/session.ts:3686`), so the walk's own progress verb is the thing that stops.

SO THE CLAIM IS TWO-PART. The report is a shape others have and ours lacks. The non-freezing exit is a defect others never had, because they never made the choice that causes it.

## why_now

THE PRECONDITION IS EACH OTHER, and that is why neither has come up alone.

Both work tokens name the other as their re-entry condition. `wt-one-lane-call-should-report-the-state-of-every-piece-of-work` waits on the walking core being opened for the frozen-pull fix. `wt-a-step-whose-leaving-condition-runs-a-long-program-should-no` waits on the status verb having a shape, so a returned handle has something to ask.

NEITHER CONDITION CAN EVER COME TRUE ON ITS OWN. A sweep that reads them one at a time finds both parked forever. Building them as one piece is what both conditions are groping towards.

THE PARTS ARE ALREADY BUILT AND UNJOINED. The handoff shape exists twice over, in `se_run` and in `se_test`. The job tables exist. A condition script already counts its own progress on stdout for the mirror's bar. What is missing is one answer that reads all of it.

AND THE MACHINE IT HURTS MOST NOW EXISTS. An unattended cloud run is where a frozen verb is fatal rather than annoying, because nobody is beside the box to notice. That was not true of this product a few iterations ago.

WHAT IS NOT A REASON. Nobody has measured how often an agent polls a running job. The cost of polling is asserted by the work token and not counted, and the why-now does not lean on it.

## value_props

- [[vp-rigor-without-toil]]
- [[vp-the-engine]]

## business_case

NO NEW VALUE PROPOSITION IS AUTHORED, and that is a claim rather than an omission.

`vp-rigor-without-toil` IS EXTENDED. It gains one success criterion: work that runs out of sight says so, and says how much longer. That criterion is the AGENT's half of the criterion i33 added for a person at a screen, whose owner framing was "everything that is over one second needs to be non-intrusive... Either that fast, or very transparent about how slow it is."

WHY IT BELONGS THERE RATHER THAN IN A PROP OF ITS OWN. The i33 criterion already says silence is not an acceptable answer from anything a person or an agent touches. The agent half was written into the words and never made checkable. This iteration makes it checkable and adds nothing the proposition did not already promise.

`vp-the-engine` IS POINTED AT AND NOT CHANGED. Its promises are the consequences a drawing attaches: a state refuses tools, a gate refuses passage, a write refuses a corpus it would break. None of the three moves.

WHAT DOES MOVE UNDER IT is when a hop may call itself finished, which is the execution model rather than the promise. That is why the kickoff sized this `major` while every surface change in it is additive.

THE THREE NEW METRICS ARE ALL ZERO-TARGETS, and each one is countable today.

- Lane calls that block longer than a second on work the caller could have been told about.
- Pieces of background work a single call cannot report. Two tables today, so the count is at least two.
- A reported time remaining that does not name its basis.

## follow_up

Scope and non-goals come next, informed by this delta.

One thing is parked with its owner. The prior-art derivation rule behind Jenkins's estimate was not read to the primary. If the design leans on how that estimate is derived rather than on the fact that one exists, the source has to be read before the claim is made.

## anything_else

