---
form: write-stories
by: agent
signed_off: 2026-08-21T08:58:14.335Z
authors: agent
files:
---

# Evidence form / write-stories

## current_situation

The boundary is drawn and the stakeholder map is re-checked. `stk-agent` gained two concerns, and this state makes them concrete.

Three stories are written, all with `stk-agent` as the actor. The fifty resident stories are untouched except one, which now points at its sibling.

Coverage is computed by the engine and not restated here, per the state's own ruling.

## stories

- [[sty-the-step-that-hands-the-walk-back]]
- [[sty-ask-once-what-is-still-running]]
- [[sty-a-documents-edit-does-not-fire-the-whole-battery]]

## follow_up

Use cases come next, generalising these three passes.

One resident story was revised rather than left. `sty-the-slow-call-that-says-it-is-working` records six pulls that timed out on a hop into a gate. That is the same cause the first new story fixes, and the two now point at each other so neither reads as the whole answer.

## anything_else

TWO MUSTS AND ONE SHOULD, and the grading is the judgment this field owes.

`sty-the-step-that-hands-the-walk-back` IS A MUST. It is the load-bearing goal, and it is the only one that moves the hop-completion contract. If it is not demonstrated end to end at M8, the iteration has not happened.

`sty-ask-once-what-is-still-running` IS A MUST. Its demonstration is cheap and mechanical: start a battery and a shell command, make one call, check the answer holds both and names a time. A goal whose demonstration is that easy has no excuse for being a should.

`sty-a-documents-edit-does-not-fire-the-whole-battery` IS A SHOULD. It rests on the weakest evidence in the iteration, a count from one session, and its risk entry is graded `plausible` rather than `expected`. It is also the only one of the three that could be cut without the other two losing anything.

WHY THE ACTOR IS `stk-agent` FOR ALL THREE. The person reads the same answers through the mirror, and that reading is a non-goal here. A story written with the engineer as actor would be telling the mirror's story, and the mirror's presentation is outside this iteration's boundary.

WHAT THE THREE DECKS CANNOT SHOW YET. Every evidence half is empty, which is correct before M8. Two of them will be filled by a scripted check rather than by a watcher, because the actor is a program and what it received is readable.

ONE THING WORTH SAYING ABOUT COVERAGE. All three refine `vp-rigor-without-toil`, and none refines `vp-the-engine`. That matches the vision's judgment: the engine's promises do not move, so no story should claim they do.
