---
minted_in: i1
id: uc-quality-performance-efficiency
type: "[[use-case]]"
statement: Get an answer fast enough to keep working
actor: stk-engineer-driving-agents
kind: quality-area
trigger: Any call into the lane, or any surface a person opens, at any corpus size.
precondition: The system is running and the record has whatever it has accumulated.
guarantee: A call or a look answers inside the bound the register names, and one that cannot says so rather than hanging.
refines:
  - sty-what-a-quality-is
  - sty-judge-without-waiting
  - sty-the-slow-call-that-says-it-is-working
priority: should
---

## What this characteristic covers

PERFORMANCE EFFICIENCY, from ISO/IEC 25010:2023. The performance of a system
relative to the amount of resources it uses under stated conditions.

Its sub-characteristics, so nobody has to open the standard to use this:

- TIME BEHAVIOUR. Response time, processing time and throughput rates meet
  the requirement when the functions are performed.
- RESOURCE UTILIZATION. The amounts and types of resource used meet the
  requirement when the functions are performed.
- CAPACITY. The maximum limits of a parameter — stored items, concurrent
  users, throughput — meet the requirement.

## Main scenario

1. The agent makes a call into the lane.
2. The machine answers within the bound the register names for that call.
3. The record grows over weeks of work, and the bound still holds.
4. A call that will take longer than the bound hands off rather than blocking, and returns a handle.
5. The person asks the handle how it is doing, and gets the output so far.
6. The person opens a surface to look at what stands, and it renders inside the bound named for a look.

## Extensions

- 2a. The answer exceeds the bound: the excess is the defect, and it is measured rather than felt.
- 2d. The bound itself is a guess: `se_probe_cap` measures what THIS host will actually take, climbing until the answer is cut, and records the largest that arrived whole. Only the agent can see the cut, because it happens between the host and the model, so the engine hands the ladder over rather than guessing a number.
- 2b. The answer will exceed the bound and cannot be handed off: it says so WHILE it works, without taking the surface over, so the person is never left deciding whether the machine is alive. Added by i33, and it is the half this use case's guarantee already promised — a call that cannot answer in time says so rather than hanging — with nothing in the main scenario carrying it.
- 2c. The signal itself misleads: a faithful completion reading that carries discouraging news drives a person out of a wait worth finishing, so what is shown is whether it is working rather than a percentage. raid-risk-an-accurate-progress-signal-can-drive-abandonment holds this, and it is the owner's.
- 6a. The surface exceeds the bound: the excess is recorded where somebody reads it, rather than being paid silently on every look.
- 3a. The record has grown past what the shape can serve: the growth is the finding, and the fix is the shape rather than a bigger machine.
- 4a. The handed-off work never finishes: the handle says it is still running, and the person can stop it and everything it spawned.
- 4b. The long call is a state's leaving check, which today does NOT hand off: it is awaited inline, so step 4 was promised here and never delivered for this case. i51 delivers it, and uc-leave-a-state-whose-check-is-still-running is where that pass is told. Found at i51's inputs gate by walking this use case against the live surface.
- 5a. The asking is one handle at a time, and the answer names a rate rather than a time remaining. uc-report-every-piece-of-work-out-of-sight replaces that with one list, each entry carrying a time remaining and the measurement it came from. Step 5 stands; what it returns gets better.
