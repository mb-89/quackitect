---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: uc-read-what-the-system-owes-and-what-it-is-doing
type: "[[use-case]]"
kind: interaction
statement: Read what the system still owes and what it is working on right now.
actor: stk-engineer-driving-agents
trigger: the person wants to know where the work stands
precondition: none
guarantee: the person knows what each state owes, what is finished, what has no home yet, and which work token a hand is on
refines:
  - sty-see-every-open-thing-at-one-glance
  - sty-watch-the-machine-think
priority: must
---

## Main scenario

1. The person opens the machine they are interested in.
2. The system shows, on every state, how much that state must still take in and how much it must still produce.
3. The system hides a count that is zero, so a state showing nothing along its top has nothing left to do.
4. The system shows the outstanding work that belongs to no state as its own group, beside the machine rather than inside it.
5. The person reads any one state's counts without opening it.
6. The system shows which work tokens a hand currently has in progress, and where.
7. The person opens a state's group to see the work tokens themselves, one row each.
8. The system shows each work token's own record of when it was opened and when it closed.

## Extensions

2a. THE MACHINE CONTAINS ANOTHER MACHINE. The system shows the container's own count beside the sum of everything beneath it, and the person opens the container to see how that sum is distributed.

4a. NOTHING IS OUTSTANDING WITHOUT A HOME. The group is not shown at all, by the same rule that hides a zero.

6a. NO HAND IS WORKING. The system shows no work token in progress, which is a different reading from a hand that is working and silent.

6b. A HAND SPLITS AN WORK TOKEN IT IS WORKING. The system shows the parts it created beneath the one it was given, so the person reads how the hand broke the job down without asking it.

7a. AN WORK TOKEN IS FINISHED. It is filtered out of what the state still owes, and the person can ask to see the finished ones as their own group.

8a. THE WORK TOKEN WAS TEMPORARY AND ITS STATE HAS COMPLETED. The work token itself is gone and its evidence remains, so the trail records what was produced rather than what was pending.
