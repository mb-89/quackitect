---
form: selection-state
by: agent
signed_off: 2026-08-16T07:42:54.195Z
authors: agent
files: null
---

# Evidence form / selection-state

## current_situation

The selection state is built and the bare-pull check is green.

WHAT THE OWNER ASKED FOR, three times: "we need a state before the iterations that's called selection or something like this so that when we enter the iteration state machine, we don't automatically enter the first iteration."

WHAT WAS ACTUALLY WRONG WAS NOT THE OFFER. The container's offer was correct the whole time, and containerchoice.test.ts proved it before this iteration started. Three separate mechanisms carried the walk past it, and each was found by measurement rather than by reading.

A FIRST ATTEMPT FAILED AND IS RECORDED BELOW. Putting a work state in front of the records changed nothing, because landing on a state and stopping there are different things.

## built

FOUR CHANGES, in the order they were found.

1. THE SELECTION STATE IS THE CONTAINER'S OWN FIRST STATE — engine/iterations.ts, `generateIterations`. It keeps the START kind, so no machine mechanics change, and `initial` names it. `where` now reads `iterations/select`.

It is the same state renamed, not a new one in front. A separate select state one hop past start was built first and measured: the walk ARRIVES at a container by landing on its initial state, so the offer stood one hop ahead of where the walk stopped and came back empty.

2. THE CONTAINER HAS AN EXIT THAT AVOIDS EVERY RECORD — same function. Before this it had none: the first state fanned to the open records, and each record's only edge ran to `end`. A route to the front desk could ONLY be drawn through a record. The exit edge is first in the list, because `tryMove` takes the first authored edge and the default must be to leave rather than to take up work nobody picked.

3. THE ROUTER MAY NOT ROUTE THROUGH A RECORD — engine/session.ts, `expandNode`. A record is work, not a corridor; passing through one enters it. The guard is conservative: it only withholds a record when the same state also offers a door that is not a record, so no container can be stranded by it.

4. AN UNCHOSEN RECORD IS NOT AN OBJECTIVE — engine/session.ts, `deepOwed`. This is the one that actually moved the walk. `subObjective` deliberately adds the container the walk stands in, and from the container's own selection state that meant descending into whichever record came first and calling its work the objective. Standing INSIDE a record, the walk still finds its owed legs.

A FIFTH CHANGE IS IN AND IS NOT LOAD-BEARING HERE — engine/session.ts, `completeGuarded`: a completion that would open more than one alternative, with no choice naming which, does not complete. It was built for this and did not fire, because the sweep routes each hop explicitly and so always names a target. It is kept because it closes the same hole on the unrouted path.

MEASURED: run test-msvhslmn-17. `a bare pull at the container enters no iteration` was red and is green. The container suite stands at 27 of 29, and the two still red are `status-is-the-open-flag` and `close-leaves-the-folder`, which are later chunks and are supposed to be red.

## follow_up

- TWO OLD CASES WERE REWRITTEN, not deleted, because this chunk changed what they observe.
  - containerchoice's "a container holding two open iterations offers them rather than entering one" asserted the walk stood at `iterations/start`. The demand is unchanged; only the name of the place has moved.
  - iterations.test.ts's "a seed stands in the container at once" looked the container's first state up by the id `start`. It now names `select`, and it also asserts `initial` points there.
- THE BATTERY STANDS AT 1320 OF 1325, run test-msvhvwmk-19. Four of the five reds are accounted for and none is a regression.
  - Two are onetree's own: `status-is-the-open-flag` and `close-leaves-the-folder`, which are later chunks and are supposed to be red.
  - One is drift's recordDone timing at 1255 ms against a 1000 ms budget. Run alone it passes: test-msvhyb07-20, 30 of 30. It was load from two batteries back to back.
  - One is unattended-start's node floor, which was red before this iteration touched anything and is not i34's work. It is note-e6b05a0a53ce: the test demands engines.node >= 24 and package.json declares >= 22.6.
- A DUPLICATE YAML KEY WAS FIXED ON THE WAY. raid-asm-only-one-agent-works-a-clone-at-a-time carried `probed:` twice, which reds every test that formats the corpus. It was written earlier in this iteration, so it is this record's own defect rather than a stray.
- THE OWNER'S OTHER REPORT IS CLOSED BY THE SAME CHANGE. "Aiming at the intended iteration drew a route THROUGH two more — starting those as well" is the router half, and a route no longer passes through a record when a plain door exists.
- NEXT CHUNK is rescue-at-risk, which runs before anything else touches a tree.

## anything_else

