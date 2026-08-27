---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: uc-work-a-states-work-tokens-to-completion
type: "[[use-case]]"
kind: interaction
statement: Work every work token a state carries until the state may be left.
actor: stk-agent
trigger: the walk enters a state
precondition: the state's method and the reading it demands are declared
guarantee: every work token the state carried is settled or has moved elsewhere, each carrying its own evidence and its own reason where it was not simply done
refines:
  - sty-walk-a-state-that-will-not-let-me-skip-a-step
priority: must
---

## Main scenario

1. The system works out what the state demands to be read, and subtracts whatever proof already stands.
2. The system hands over one work token for each document still unproven.
3. The system hands over one work token for each marked step of the state's method, carrying that step's guidance and what it owes.
4. The system hands over one work token for each piece of evidence the state must produce.
5. The system withholds an work token whose predecessor is not yet finished, and offers the rest.
6. The hand asks for what is open and works it.
7. The hand settles each one, writing its result into the work token itself rather than into a second document.
8. The hand tries to leave.
9. The system refuses while anything the state carries is neither settled nor moved elsewhere, and the state is left when nothing is outstanding. Its settled work tokens are its evidence.

## Lane doors

- `se_work` is how a hand picks a work token up and how it ends one, and both acts demand a comment that may not be empty.

The comment lands on the work token itself. It is what a person reads later,
and a log line nobody can find is not a report.

## Extensions

1a. THE PROOF ALREADY STANDS FOR EVERY DOCUMENT. No reading work token is created, and the hand is not asked twice.

3a. THE METHOD CARD CHANGED SINCE THIS STATE WAS LAST ENTERED. The work tokens are matched by their own identity rather than by the wording of the step, so a rewritten heading neither orphans one nor creates a duplicate.

4a. THE EVIDENCE IS COMPUTED RATHER THAN JUDGED. The work token carries a program instead of a question. The program runs when the work token is asked, and once it has answered the work token settles rather than being asked again.

5a. AN WORK TOKEN NAMES NO PREDECESSOR. It is offered straight away. Most carry none, so readiness is derived where an order was written and assumed otherwise.

5b. AN WORK TOKEN WAITS ON A WHOLE STATE RATHER THAN ON ANOTHER WORK TOKEN. The same edge serves, with a state as its target instead of a single piece of work.

5c. THE PREDECESSOR SETTLED WITHOUT BEING DONE. What the waiting work token needed is stated on the edge: some need the predecessor finished, and some need only that it stopped being open.

5d. SEVERAL WORK TOKENS ARE OFFERED AT ONCE. The hand takes them in whatever order it likes, and the marks each carries say which matter most.

6a. AN WORK TOKEN IS BEYOND THE HAND THAT HOLDS IT. The hand records that it is harder than it was marked and leaves it for a stronger one, rather than attempting it or dropping it quietly.

6b. AN WORK TOKEN CAN ONLY BE SETTLED BY A PERSON. It says so on its own face. The hand stops there, consulting no list of acceptable reasons, and the walk continues when the person has answered.

6c. THE WORK TOKEN IS LARGER THAN IT LOOKED. The hand creates parts beneath it and works those, and the parts are visible as the hand's own reasoning.

7a. THE WORK TOKEN IS NOT DONE AND WILL NOT BE. The hand settles it another way and states why in one line, because every close carries a reason and only a successful one is trivial to write.

7b. THE WORK TOKEN DUPLICATES ANOTHER. The hand closes it as a duplicate and points at the one it duplicates.

8a. THE WORK TOKEN BELONGS SOMEWHERE ELSE. Moving it releases this state as surely as settling it, and it becomes an open point wherever it landed.

9a. THE STATE IS OUTSIDE A RECORD. Its work tokens were temporary and go when the state completes. What survives is the evidence they produced, and a restart takes them with it.
