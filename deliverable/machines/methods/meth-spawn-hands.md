---
kind: method
card: spawn-hands
catalog: spawn_hands
catalog_sections: Roster
statement: "Spawn the hand a state is actually built to start. A spawn state starts the walker, and only the walker; the reviewer starts at its own gate and the researcher starts wherever the work asks for one."
---

## Roster

The checklist a spawn state serves. One box, because a spawn state starts
exactly one hand.

- Walker (deliverable/machines/methods/meth-spawn-hands.md)

## Guidance

THE CAST IS FIXED and it is four (owner ruling 2026-08-20, i38). A GUIDE, which
enters the record and stays across it, never pulls and holds no position. A
WALKER, the only role that calls the pull. A REVIEWER, spawned at its own gate
where the review actually happens. A RESEARCHER, spawned at whichever state
the work actually asks for research. Nothing else spawns.

A SPAWN STATE STARTS THE WALKER, and that is ALL it starts (owner ruling
2026-08-23). This card used to say a gate later in the phase "gets a reviewer
with no shared context" — written here, at the spawn state. That read as the
reviewer being named or readied early, and it was wrong. THE REVIEWER SPAWNS
AT THE GATE, when the review actually happens, never before it. A researcher
spawns the same way: at the state doing the research, never up front. Each
row's own gate or research state registers its own hand when it gets there —
this state registers the walker and nothing else.

THE WALKER MAY DIFFER PER MILESTONE. It reads the guidance for its own phase,
and its rung comes from that milestone — that variation is the reason this
state exists at all, once per milestone.

THE WALKER DOES THE WORK OF THE STATES IT WALKS (owner ruling 2026-08-23).
Authoring a state's evidence IS the walker's job. The guide looks over it.

DO NOT SEND A WALKER TO A STATE AND FORBID IT TO WRITE. That leaves a hand
standing at a form it was sent to fill, reporting back for permission it
already had. Measured twice the day this was written.

A WALKER PULLS AND DOES WHAT COMES BACK. It never needs to know where it is,
and it cannot be raced (owner ruling 2026-08-23).

- THE PULL RECOMPUTES FROM WHEREVER THE WALK STANDS. The position moving under
  a hand is not a problem, because the hand holds no position of its own.
- DO NOT BRIEF A HAND TO EXPECT A PARTICULAR STATE. Tell it what to do with
  what comes back — read, fill, re-earn, stop at a gate. A hand told to look
  for one named door reports failure when it is offered another.
- MEASURED THE DAY THIS WAS WRITTEN. A hand was sent to one named state, the
  walk moved, and it returned having done nothing. The brief had made the
  STATE the job instead of the WALKING.

WHAT A HAND IS FOR:

- WALKING THE RECORD. Pulling, answering reads, clearing fallen inputs.
- AUTHORING A STATE'S EVIDENCE, including prose and judgment the state asks
  for. That is the work, not an overstep.
- MECHANICAL REPETITION. One shape applied across many files.
- BREADTH NOBODY HAS SCOPED. Reading a subsystem the guide has not read, where
  the reading itself is the work.

WHAT STAYS WITH THE GUIDE, and it is narrower than it sounds:

- AN EDIT ALREADY LOCATED BY FILE AND LINE. If you can name both, the handover
  costs the hand a full re-read and buys nothing.
- A DECISION THE OWNER OWNS. Scope, seeding, which record a finding belongs to.
- THE BLESS AT A GATE THE GUIDE AUTHORED.

CHECK WHAT A HAND REPORTS AS FACT. One reported that no use-case nodes
existed; fifty-seven did, and the claim was one glob away from being checked.
A hand's finding is evidence, never a verdict.

MEASURED 2026-08-23, which is why this is a rule. Three hands each spent about
fifteen minutes reading before touching anything, on tasks where the guide had
supplied the file names and the line numbers. The guide did comparable work in
a fraction of the time, and the token cost was probably higher, not lower.

BE CONSERVATIVE. The count at the kickoff is a CEILING and never a quota.
Spawning fewer is always right where fewer is right, and spawning none at a
state is a legitimate answer that needs no excuse.

SEPARATION IS A DIFFERENT PURCHASE and it still holds. A reviewer at a gate
must not have written what it judges. That is bought with tokens and time on
purpose, and it is not covered by this rule.

AND IT IS NOT COUNTED EITHER (owner ruling 2026-08-23). The ceiling counts
WALKERS. A reviewer and a researcher are registered with their own role and
stand outside the number, because neither competes for the walking slot.

    se_run {agent: "…", model: "…", role: "reviewer"}

A REVIEWER IS NEVER WEAKER THAN THE GUIDE. Judgment cannot be delegated
downward — a cheaper hand is legitimate for walking, never for judging.
[[meth-gate-review]] carries why, and it binds every judging step rather than
only a gate.

GIVE THE HAND ONE NAME. Use the same words for the harness spawn and for
`se_run {agent}`. Two registries carry these rows and nothing reconciles them,
so a hand named differently in each appears twice and matches nowhere.

THE GUIDE IS THE ONE THAT SPAWNS. The engine cannot start an agent and never
will - req-the-machine-names-a-driver-and-starts-nothing is a must graded
fatal, and it groups that power with pushing and opening records unasked. The
harness performs the spawn; the guide asks it to.

SO THIS STATE IS TWO ACTS. Spawn the walker through the harness. Then declare
it to the record with `se_run {agent: "<what it is for>", steps: <n>}`, which
registers it in the job table. A reviewer or a researcher spawned later, at
its own state, is declared the same way, there.

THEN HAND THE WALKER ITS JOB ID, and tell it to narrate. A hand reports through
the update system, which rides every lane call it already makes.

ITS FIRST UPDATE IS A PLAN, and the number of items in that plan sets the
length of the job. Each item resolved after that advances the bar by one.

THAT IS WHERE THE WORK TABLE'S ESTIMATE COMES FROM. A hand that plans and
resolves earns a time remaining. One that narrates nothing gets none, because
there is nothing to measure.

`se_run` IS NOT THE CHANNEL. It is legal in this state and nowhere else, so a
hand told to report with it is refused on its first attempt. That instruction
stood here until 2026-08-23, and in that time no hand ever reported once.

WITHOUT THAT THE PANEL LIES. A hand that has said nothing for two minutes
reads as idle, whatever it is actually doing, because silence is the only
signal the table has. A working hand that looks idle is worse than no column
at all.

THE EXIT CHECKS THAT YOU DID. hands-spawned.ts reads the registry and refuses
while no hand stands against this record. It proves a hand was registered and
nothing more.

WHAT IT DELIBERATELY DOES NOT PROVE is that the hand did the work. A guide
could spawn a walker and then walk anyway. That is caught in the RETRO, which
weighs how much each part did from the part stamped on every call, and a guide
doing too much is a signal to fix the system rather than a refusal in the
moment (owner ruling 2026-08-23).

THE RUNG COMES FROM THE MILESTONE, not from taste. sizing.ts publishes the
difficulty and the rung; a submachine takes the maximum over its items, so one
walker strong enough for the hardest step walks them all.

IT IS THE MILESTONE'S SETUP STATE, and i38's design input named it before it
existed: the milestone's setup state computes the tier and names the model, the
pull carries it, and whoever is driving performs the spawn. One per milestone,
at its head.

THE POINT IS CONTEXT SEPARATION, and it is why the spawn REPEATS rather than
happening once. A fresh walker per phase does not carry the last phase's
reasoning into this one. A hand spawned after the work has started inherits
exactly the context the separation exists to deny it.

THE WALKER CARRIES THE PHASE. It is the only role that calls the pull, and it
does the work. The i15 arrangement ran this way: the harness spawned, and the
walker reached the lane itself.

IT CALLS BACK TO THE GUIDE ONLY WHERE IT MUST - a question it cannot settle, or
a judgment above its rung. A guide that answers constantly has taken the
walker's job, and the retro shows it as the guide's share of the calls.

A SPAWNED HAND HOLDS EXACTLY THE GUIDE'S TOOLS and never more (owner ruling
2026-08-23). There is one lane session and one position, so a walker sees the
state the guide stands in. Anything else would let a guide widen its own reach
by spawning.

SO A REFUSAL HERE IS NOT A FAULT. This state is read-only, which is right for a
state whose whole job is to spawn and declare. A walker spawned here reads
until the walk moves on, and moving it is the guide holding the record rather
than the guide doing the walker's work.
