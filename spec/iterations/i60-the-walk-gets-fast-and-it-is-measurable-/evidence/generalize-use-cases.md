---
form: generalize-use-cases
by: agent
signed_off: 2026-08-24T15:07:29.620Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

THE USE CASE ALREADY EXISTS AND ALREADY REFINES THE STORY. Nothing is minted here.

IT SAYS: drive the machine through a sequence of acts without any single act breaking the rhythm. Its guarantee is that the common act comes back inside a second, and that an act which cannot returns a signal within that second instead.

SO BOTH SIDES OF THE COVERAGE ALREADY HOLD. The story sits inside a use case, and the use case has a story under it.

WHAT THIS ROUND ADDS IS FOUR EXTENSIONS, which is what this state's guidance asks for when a delta fits an existing scenario rather than needing a new one.

## use_cases

- uc-drive-the-machine-at-the-pace-of-thought

## follow_up

M3 DERIVES THE REQUIREMENTS FROM THESE STEPS AND EXTENSIONS, and three of the four extensions are new, so the derivation has more to draw from than the round started with.

WHAT TO WATCH THERE. A step no requirement covers is a hole that shows in the coverage matrix rather than in a review. The search-that-finds-nothing branch is the one most likely to be missed, because it reads like a performance detail rather than a behaviour.

## anything_else

THE FOUR EXTENSIONS, and why each is a branch rather than a new use case.

- A SEARCH THAT FINDS NOTHING dominates the act's cost. The work is not large; the not-finding is. It branches from the step where the work is done, and it is the failing-bound case rather than the genuinely-large case, because the size follows from what is ABSENT rather than from what was asked.
- THE ACT IS ONE HOP OF A WALK rather than a single call. Then the bound is per hop and the walk multiplies it. An act comfortably inside a second still leaves a re-entry costing minutes, so the guarantee is necessary and not sufficient at this grain.
- SEVERAL ACTS RUN AT ONCE and the loop that answers is the loop that draws the surface. A slow act is then not slow alone: the actor sees a frozen screen rather than a waiting one.
- THE EXISTING BRANCH FOR AN AGENT ACTOR ALREADY STOOD, and it is the sharpest line in the scenario: an agent that waits thirty seconds is not inconvenienced, it is idle, and its whole session is the sum of these waits.

WHY NONE OF THEM IS A NEW USE CASE. Each is the same actor with the same goal, branching at a numbered step. A second use case would have to differ in actor or goal, and none of these does.

THE THIRD ONE IS THE ROUND'S OWN THIRD HYPOTHESIS, written into the scenario so a later reader meets it where the behaviour is described rather than only in a register entry.
