---
id: uc-quality-performance-efficiency
type: "[[use-case]]"
statement: Get an answer fast enough to keep working
actor: stk-engineer-driving-agents
kind: quality-area
trigger: Any call into the lane, at any corpus size.
precondition: The system is running and the record has whatever it has accumulated.
guarantee: A call answers inside the bound the register names, and a call that cannot says so rather than hanging.
refines:
  - sty-what-a-quality-is
killer: false
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

## Extensions

- 2a. The answer exceeds the bound: the excess is the defect, and it is measured rather than felt.
- 3a. The record has grown past what the shape can serve: the growth is the finding, and the fix is the shape rather than a bigger machine.
- 4a. The handed-off work never finishes: the handle says it is still running, and the person can stop it and everything it spawned.
